const { default: makeWASocket, jidDecode, DisconnectReason, useMultiFileAuthState, Browsers, getContentType, proto, makeInMemoryStore, jidNormalizedUser } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Boom } = require("@hapi/boom");

const store = {
  messages: {}, // { [jid]: WebMessageInfo[] }
  chats: {},    // { [jid]: Chat }
  contacts: {}, // { [id]: Contact }

  saveMessage(msg) {
    const jid = msg.key.remoteJid
    if (!this.messages[jid]) this.messages[jid] = []
    this.messages[jid].push(msg)
  },

  saveChat(chat) {
    this.chats[chat.id] = chat
  },

  saveContact(contact) {
    this.contacts[contact.id] = contact
  }
}

let pairingCodeErrorShown = false;
const reconnectAttempts = {};
const pairingRequested = {}; // Track pairing per number By яαgємσ∂ѕ
const connectionNotified = {}; // NEW: Track if connection notification has been sent for this number

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            fs.lstatSync(curPath).isDirectory() ? deleteFolderRecursive(curPath) : fs.unlinkSync(curPath);
        });
        fs.rmdirSync(folderPath);
    }
}

async function startpairing(MatrixNumber) {
    try {
        const sessionPath = `./lib2/pairing/${MatrixNumber}`;

        // --- FIX START ---
        // Ensure the session directory exists before any file operations
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
            console.log(chalk.green(`[RENTPOT] Created missing session directory for ${MatrixNumber}: ${sessionPath}`));
        }
        // --- FIX END ---

        if (!fs.existsSync(`${sessionPath}/creds.json`)) {
            console.warn(chalk.yellow(`[${MatrixNumber}] No session found, starting fresh.`));
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        if (!state?.creds) {
            console.warn(chalk.red(`[${MatrixNumber}] Invalid session state. Resetting.`));
            deleteFolderRecursive(sessionPath);
            // After deleting, ensure the directory is re-created for the next attempt
            // This is crucial if startpairing is immediately called again.
            if (!fs.existsSync(sessionPath)) { 
                fs.mkdirSync(sessionPath, { recursive: true });
                console.log(chalk.green(`[RENTPOT] Re-created session directory after reset for ${MatrixNumber}: ${sessionPath}`));
            }
            return setTimeout(() => startpairing(MatrixNumber), 5000);
        }

        const Matrix = makeWASocket({
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            auth: state,
            version: [2, 3000, 1017531287], // Ensure this version is stable and up-to-date with Baileys recommendations
            browser: Browsers.ubuntu("Edge"),
            getMessage: async key => {
                // Modified: Your `store` object is in-memory and not bound to Baileys events.
                // This means store.loadMessage might not return actual messages from Baileys.
                // Providing a fallback that attempts to fetch from the socket or returns empty proto.Message.
                const jid = jidNormalizedUser(key.remoteJid);
                // Attempt to load from store if you bind it, otherwise Baileys fetches (slower).
                // If you bind the store (uncomment `store.bind(Matrix.ev)` below), this might work better.
                let msg = await store.loadMessage(jid, key.id);
                if (msg) return msg.message; // Return the message content if found in your store

                // Fallback to fetching directly via Baileys if not in store (can be slow)
                // Or you might need to implement a database for persistent message storage
                return key.id ? (await Matrix.fetchMessagesFromWA(key.remoteJid, [key])).messages[0]?.message || '' : '';
            },
            shouldSyncHistoryMessage: msg => {
                console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`);
                return !!msg.syncType;
            }
        });

       // store.bind(Matrix.ev); // <--- CONSIDER UNCOMMENTING THIS if you want `store` to populate with messages and chats

        const keepAliveInterval = setInterval(() => {
            if (Matrix?.user) {
                Matrix.sendPresenceUpdate('available').catch(err => {
                    console.error("Keep-alive failed:", err.message);
                });
            }
        }, 1000 * 60 * 30);

        if (!state.creds.registered && MatrixNumber && !pairingRequested[MatrixNumber]) {
            pairingRequested[MatrixNumber] = true;
            const phoneNumber = MatrixNumber.replace(/[^0-9]/g, '');

            setTimeout(async () => {
                try {
                    let code = await Matrix.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    fs.writeFileSync(`./lib2/pairing/pairing.json`, JSON.stringify({ code }, null, 2));
                } catch (err) {
                    if (!pairingCodeErrorShown) {
                        console.error("Error requesting pairing code:", err.stack || err.message);
                        pairingCodeErrorShown = true;
                    }
                }
            }, 1703);
        }

        Matrix.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                const decode = jidDecode(jid) || {};
                return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
            }
            return jid;
        };

        Matrix.ev.on("messages.upsert", async chatUpdate => {
            try {
                const msg = chatUpdate.messages[0];
                if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
                const m = smsg(Matrix, msg, store);
                require("./system")(Matrix, m, chatUpdate, store);
            } catch (err) {
                console.error("Error handling message:", err.stack || err.message);
            }
        });

        const badSessionRetries = {}; // Track retries per number By яαgємσ∂ѕ

        Matrix.ev.on("connection.update", async update => {
            const { connection, lastDisconnect } = update;
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

            try {
                if (connection === "close") {
                    clearInterval(keepAliveInterval);
                    // Reset notification flag when connection closes, so it can be sent again on next open
                    connectionNotified[MatrixNumber] = false; 

                    switch (statusCode) {
                        case DisconnectReason.badSession:
                            badSessionRetries[MatrixNumber] = (badSessionRetries[MatrixNumber] || 0) + 1;

                            if (badSessionRetries[MatrixNumber] <= 6) {
                                console.log(chalk.yellow(`[${MatrixNumber}] Bad session detected. Retrying (${badSessionRetries[MatrixNumber]}/6) without deleting session...`));
                                pairingRequested[MatrixNumber] = false;
                                return setTimeout(() => startpairing(MatrixNumber), 3000);
                            } else {
                                console.log(chalk.red(`[${MatrixNumber}] Bad session retry limit reached. Deleting session and starting fresh.`));
                                deleteFolderRecursive(sessionPath);
                                // Ensure directory is recreated after deletion for the next attempt
                                if (!fs.existsSync(sessionPath)) { // Added this check and mkdirSync here too
                                    fs.mkdirSync(sessionPath, { recursive: true });
                                    console.log(chalk.green(`[RENTPOT] Re-created session directory after bad session reset for ${MatrixNumber}: ${sessionPath}`));
                                }
                                badSessionRetries[MatrixNumber] = 0;
                                pairingRequested[MatrixNumber] = false;
                                return setTimeout(() => startpairing(MatrixNumber), 5000);
                            }

                        case DisconnectReason.connectionClosed:
                        case DisconnectReason.connectionLost:
                        case DisconnectReason.restartRequired:
                        case DisconnectReason.timedOut:
                        case 405:
                            reconnectAttempts[MatrixNumber] = (reconnectAttempts[MatrixNumber] || 0) + 1;
                            if (reconnectAttempts[MatrixNumber] <= 5) {
                                console.log(`[${MatrixNumber}] attempting reconnect (${reconnectAttempts[MatrixNumber]}/5)...`);
                                return setTimeout(() => startpairing(MatrixNumber), 2000);
                            } else {
                                console.log(`[${MatrixNumber}] max reconnect attempts reached.`);
                            }
                            break;

                        case DisconnectReason.loggedOut:
                            deleteFolderRecursive(sessionPath);
                            // Ensure directory is recreated after deletion for the next attempt
                            if (!fs.existsSync(sessionPath)) { // Added this check and mkdirSync here too
                                fs.mkdirSync(sessionPath, { recursive: true });
                                console.log(chalk.green(`[RENTPOT] Re-created session directory after logout for ${MatrixNumber}: ${sessionPath}`));
                            }
                            pairingRequested[MatrixNumber] = false;
                            console.log(chalk.bgRed(`${MatrixNumber} disconnected (logged out).`));
                            break;

                        default:
                            console.log("Unknown disconnect reason:", statusCode);
                            console.error("Disconnect error:", lastDisconnect?.error?.stack || lastDisconnect?.error?.message);
                            // For unknown errors, also ensure not to spam
                            connectionNotified[MatrixNumber] = false; 
                    }
                } else if (connection === "open") {
                    console.log(chalk.bgGreen(`Rent bot is active on ${MatrixNumber}`));
                    reconnectAttempts[MatrixNumber] = 0;
                    badSessionRetries[MatrixNumber] = 0; // Reset on successful connection
                    // Removed the section that sends "Connected: [Number]" notifications.
                }
            } catch (err) {
                console.error("Connection update error:", err.stack || err.message);
                // Ensure flag is reset in case of connection update error that leads to retry
                connectionNotified[MatrixNumber] = false; 
                setTimeout(() => startpairing(MatrixNumber), 5000);
            }
        });

        Matrix.ev.on("creds.update", async creds => {
            try {
                await saveCreds();
            } catch (err) {
                console.error("Failed to save credentials:", err.stack || err.message);
            }
        });
    } catch (err) {
        console.error("Fatal error in startpairing:", err.stack || err.message);
        setTimeout(() => startpairing(MatrixNumber), 5000);
    }
}

function smsg(sock, m, store) {
    const M = proto.WebMessageInfo;
    if (!m) return m;
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = sock.decodeJid(m.fromMe && sock.user.id || m.participant || m.key.participant || m.chat || '');

    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype === 'viewOnceMessage')
            ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
            : m.message[m.mtype];

        m.text = m.message?.conversation || m.msg?.caption || m.msg?.text || '';
        m.reply = (text, chatId = m.chat, options = {}) =>
            sock.sendMessage(chatId, { text }, { quoted: m, ...options });
    }

    return m;
}

module.exports = startpairing;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update detected in '${__filename}'`));
    delete require.cache[file];
    require(file);
});

// By яαgємσ∂ѕ
