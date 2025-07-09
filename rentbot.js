const { default: makeWASocket, jidDecode, DisconnectReason, useMultiFileAuthState, Browsers, getContentType, proto, jidNormalizedUser, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Boom } = require("@hapi/boom");
const axios = require("axios"); 
const os = require('os'); 
const moment = require("moment-timezone"); 
const { runtime, smsg: smsgMyfunc } = require("./lib/myfunc"); // <<< MODIFIED: Import smsg from myfunc.js as smsgMyfunc
const versions = require("./package.json").version;

// --- GLOBAL SOCKET MAP ---
global.activeSockets = global.activeSockets || {}; // Track all active Baileys sockets by JID

// --- ADDED: extendWASocket import ---
const extendWASocket = require('./lib/matrixUtils'); // Import the utility

// --- STORE DEFINITION ---
const store = {
  messages: {},
  chats: {},
  contacts: {},
  saveMessage(msg) {
    const jid = msg.key.remoteJid;
    if (!this.messages[jid]) this.messages[jid] = [];
    this.messages[jid].push(msg);
  },
  saveChat(chat) {
    this.chats[chat.id] = chat;
  },
  saveContact(contact) {
    this.contacts[contact.id] = contact;
  },
  loadMessage(jid, msgId) {
    return this.messages[jid]?.find(msg => msg.key.id === msgId);
  }
}

const storeFile = "./src/store.json";
function saveStoredMessages(chatId, messageId, messageData) {
    let storedMessages = {};
    if (fs.existsSync(storeFile)) {
        try {
            storedMessages = JSON.parse(fs.readFileSync(storeFile));
        } catch (err) {
            // console.error("⚠️ Error reading store.json in rentbot.js:", err); // Removed
            storedMessages = {};
        }
    }
    if (!storedMessages[chatId]) storedMessages[chatId] = {};
    if (!storedMessages[chatId][messageId]) {
        storedMessages[chatId][messageId] = messageData;
        try {
            fs.writeFileSync(storeFile, JSON.stringify(storedMessages, null, 2));
        } catch (err) {
            // console.error("❌ Error writing to store.json in rentbot.js:", err); // Removed
        }
        return true; // Return true if message was newly stored
    }
    return false; // Return false if message already existed or couldn't be stored
}

let pairingCodeErrorShown = false;
const reconnectAttempts = {};
const pairingRequested = {};
const connectionNotified = {};

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            fs.lstatSync(curPath).isDirectory() ? deleteFolderRecursive(curPath) : fs.unlinkSync(curPath);
        });
        fs.rmdirSync(folderPath);
    }
}

// --- GITHUB SYNC ADDITIONS START ---

const { Octokit } = require("@octokit/rest");

// Use a dedicated environment variable for pairing repo authentication
global.GITHUB_PAIRING_TOKEN = process.env.GITHUB_PAIRING_TOKEN || ""; // <-- Add this line at the top of your file or in settings.js

const GITHUB_PAIRING_REPO = "rentbot-pairing-sessions";
const GITHUB_PAIRING_OWNER = "Matrix1999"; // Replace with your GitHub username
const GITHUB_PAIRING_BASEPATH = "pairing";

// Use a dedicated Octokit instance for the pairing repo
const pairingOctokit = new Octokit({ auth: global.GITHUB_PAIRING_TOKEN });

async function createPairingRepo() {
    if (!global.GITHUB_PAIRING_TOKEN) return;
    try {
        await pairingOctokit.repos.createForAuthenticatedUser({
            name: GITHUB_PAIRING_REPO,
            private: true,
        });
        console.log(`[RENTPOT] GitHub repo '${GITHUB_PAIRING_REPO}' created successfully.`);
    } catch (error) {
        if (error.status === 422) {
            console.log(`[RENTPOT] GitHub repo '${GITHUB_PAIRING_REPO}' already exists.`);
        } else {
            console.error(`[RENTPOT] Error creating GitHub repo '${GITHUB_PAIRING_REPO}':`, error);
        }
    }
}

function ensureLocalPairingDir() {
    const basePairingDir = path.join(__dirname, 'lib', 'pairing');
    if (!fs.existsSync(basePairingDir)) {
        fs.mkdirSync(basePairingDir, { recursive: true });
        console.log(`[RENTPOT] Created missing base pairing directory: ${basePairingDir}`);
    }
}

async function downloadPairingSessions() {
    if (!global.GITHUB_PAIRING_TOKEN) return;
    try {
        const { data: userDirs } = await pairingOctokit.repos.getContent({
            owner: GITHUB_PAIRING_OWNER,
            repo: GITHUB_PAIRING_REPO,
            path: GITHUB_PAIRING_BASEPATH,
        });

        for (const userDir of userDirs) {
            if (userDir.type !== "dir") continue;
            const localUserDir = path.join(__dirname, "lib", "pairing", userDir.name);
            if (!fs.existsSync(localUserDir)) fs.mkdirSync(localUserDir, { recursive: true });

            const { data: sessionFiles } = await pairingOctokit.repos.getContent({
                owner: GITHUB_PAIRING_OWNER,
                repo: GITHUB_PAIRING_REPO,
                path: `${GITHUB_PAIRING_BASEPATH}/${userDir.name}`,
            });

            for (const file of sessionFiles) {
                if (file.type !== "file") continue;
                if (!file.content) {
                    // Skip files with no content (can happen if file is empty or API returns directory)
                    console.warn(`[RENTPOT] Skipping file with no content: ${file.name}`);
                    continue;
                }
                try {
                    const content = Buffer.from(file.content, "base64").toString("utf8");
                    fs.writeFileSync(path.join(localUserDir, file.name), content);
                } catch (err) {
                    console.error(`[RENTPOT] Failed to write file ${file.name}:`, err);
                }
            }
        }
        console.log("[RENTPOT] Pairing sessions restored from GitHub.");
    } catch (error) {
        if (error.status === 404) {
            console.log("[RENTPOT] No pairing sessions found in GitHub repo yet.");
        } else {
            console.error("[RENTPOT] Failed to restore pairing sessions from GitHub:", error);
        }
    }
}

async function uploadPairingSessions() {
    if (!global.GITHUB_PAIRING_TOKEN) return;
    try {
        const basePairingDir = path.join(__dirname, "lib", "pairing");
        if (!fs.existsSync(basePairingDir)) return;

        const userDirs = await fs.promises.readdir(basePairingDir);
        for (const userDir of userDirs) {
            const userPath = path.join(basePairingDir, userDir);
            const stat = await fs.promises.lstat(userPath);
            if (!stat.isDirectory()) continue;

            const files = await fs.promises.readdir(userPath);
            for (const fileName of files) {
                const filePath = path.join(userPath, fileName);

                // --- Robust: skip if file does not exist ---
                let content;
                try {
                    content = await fs.promises.readFile(filePath, "utf8");
                } catch (err) {
                    // File is missing, skip it
                    console.warn(`[RENTPOT] Skipping missing file during upload: ${filePath}`);
                    continue;
                }

                // --- SHA conflict-safe upload ---
                let sha;
                try {
                    const { data } = await pairingOctokit.repos.getContent({
                        owner: GITHUB_PAIRING_OWNER,
                        repo: GITHUB_PAIRING_REPO,
                        path: `${GITHUB_PAIRING_BASEPATH}/${userDir}/${fileName}`,
                    });
                    sha = data.sha;
                } catch (err) {
                    if (err.status !== 404) throw err;
                    sha = undefined; // File does not exist yet
                }

                try {
                    await pairingOctokit.repos.createOrUpdateFileContents({
                        owner: GITHUB_PAIRING_OWNER,
                        repo: GITHUB_PAIRING_REPO,
                        path: `${GITHUB_PAIRING_BASEPATH}/${userDir}/${fileName}`,
                        message: `Update pairing session for ${userDir}/${fileName}`,
                        content: Buffer.from(content).toString("base64"),
                        sha,
                    });
                } catch (err) {
                    if (err.status === 409) {
                        // SHA conflict, fetch latest SHA and retry
                        try {
                            const { data } = await pairingOctokit.repos.getContent({
                                owner: GITHUB_PAIRING_OWNER,
                                repo: GITHUB_PAIRING_REPO,
                                path: `${GITHUB_PAIRING_BASEPATH}/${userDir}/${fileName}`,
                            });
                            await pairingOctokit.repos.createOrUpdateFileContents({
                                owner: GITHUB_PAIRING_OWNER,
                                repo: GITHUB_PAIRING_REPO,
                                path: `${GITHUB_PAIRING_BASEPATH}/${userDir}/${fileName}`,
                                message: `Retry update pairing session for ${userDir}/${fileName}`,
                                content: Buffer.from(content).toString("base64"),
                                sha: data.sha,
                            });
                            console.warn(`[RENTPOT] 409 conflict resolved for ${fileName}, upload retried.`);
                        } catch (retryErr) {
                            console.error(`[RENTPOT] Failed to resolve 409 conflict for ${fileName}:`, retryErr);
                        }
                    } else {
                        console.error(`[RENTPOT] Failed to upload file ${fileName}:`, err);
                    }
                }
            }
        }
        console.log("[RENTPOT] Pairing sessions synced to GitHub.");
    } catch (error) {
        console.error("[RENTPOT] Failed to sync pairing sessions to GitHub:", error);
    }
}

// --- GITHUB SYNC ADDITIONS END ---



// --- PREMIUM CHECK FUNCTION ---
function isPremiumUser(MatrixNumber) {
    const premiumUsers = (global.db && global.db.data && global.db.data.premium) ? global.db.data.premium : [];
    return premiumUsers.some(p => p.jid === MatrixNumber);
}

async function startpairing(MatrixNumber) {
    // --- PREMIUM CHECK: Block non-premium users ---
    if (!isPremiumUser(MatrixNumber)) {
        // console.log(chalk.red(`[RENTPOT] Not starting session for ${MatrixNumber} (not premium).`)); // Removed
        return;
    }

    try {
        // Ensure base pairing directory exists to prevent ENOENT
        const basePairingDir = path.join('./lib', 'pairing');
        if (!fs.existsSync(basePairingDir)) {
            fs.mkdirSync(basePairingDir, { recursive: true });
            // console.log(chalk.green(`[RENTPOT] Created missing base pairing directory: ${basePairingDir}`)); // Removed
        }

        const sessionPath = path.join(basePairingDir, MatrixNumber);

        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
            // console.log(chalk.green(`[RENTPOT] Created missing session directory for ${MatrixNumber}: ${sessionPath}`)); // Removed
        }

        const credsFilePath = path.join(sessionPath, 'creds.json');
        const pairingFilePath = path.join(sessionPath, 'pairing.json');

        if (!fs.existsSync(credsFilePath)) {
            // console.warn(chalk.yellow(`[${MatrixNumber}] No creds.json found, starting fresh.`)); // Removed
        }

        // Improved log: distinguish between first time and reuse
        if (fs.existsSync(pairingFilePath)) {
            const pairingData = JSON.parse(fs.readFileSync(pairingFilePath, 'utf-8'));
            if (!fs.existsSync(credsFilePath)) {
                // No creds.json means this is the first time pairing
                // console.log(chalk.green(`[RENTPOT] Using newly generated pairing code for ${MatrixNumber}: ${pairingData.code}`)); // Removed
            } else {
                // creds.json exists, so this is a reuse
                // console.log(chalk.blue(`[RENTPOT] Reusing existing pairing code for ${MatrixNumber}: ${pairingData.code}`)); // Removed
            }
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        if (!state?.creds) {
            // console.warn(chalk.red(`[${MatrixNumber}] Invalid session state. Resetting.`)); // Removed
            deleteFolderRecursive(sessionPath);
            if (!fs.existsSync(sessionPath)) {
                fs.mkdirSync(sessionPath, { recursive: true });
                // console.log(chalk.green(`[RENTPOT] Re-created session directory after reset for ${MatrixNumber}: ${sessionPath}`)); // Removed
            }
            return setTimeout(() => startpairing(MatrixNumber), 5000);
        }

        const Matrix = makeWASocket({
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            auth: state,
            version: [2, 3000, 1017531287],
            browser: Browsers.ubuntu("Edge"),
            getMessage: async key => {
                const jid = jidNormalizedUser(key.remoteJid);
                let msg = await store.loadMessage(jid, key.id);
                if (msg) return msg?.message || "";
                return key.id ? (await Matrix.fetchMessagesFromWA(key.remoteJid, [key])).messages[0]?.message || '' : '';
            },
            shouldSyncHistoryMessage: msg => {
                // console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`); // Removed
                return !!msg.syncType;
            }
        });

        // --- TRACK THE SOCKET GLOBALLY ---
        global.activeSockets[MatrixNumber] = Matrix;

        extendWASocket(Matrix);

        const keepAliveInterval = setInterval(() => {
            if (Matrix?.user) {
                Matrix.sendPresenceUpdate('available').catch(err => {
                    // console.error("Keep-alive failed:", err.message); // Removed
                });
            }
        }, 1000 * 60 * 30);

        // --- PAIRING CODE GENERATION LOGIC ---
        if (!state.creds.registered && MatrixNumber && !pairingRequested[MatrixNumber]) {
            pairingRequested[MatrixNumber] = true;
            const phoneNumber = MatrixNumber.replace(/[^0-9]/g, '');

            setTimeout(async () => {
                try {
                    let code = await Matrix.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    fs.writeFileSync(pairingFilePath, JSON.stringify({ code }, null, 2));
                    // console.log(chalk.green(`[RENTPOT] Pairing code written to: ${pairingFilePath}`)); // Removed
                } catch (err) {
                    if (!pairingCodeErrorShown) {
                        // console.error("Error requesting pairing code:", err.stack || err.message); // Removed
                        pairingCodeErrorShown = true;
                    }
                }
            }, 1703);
        }

        Matrix.ev.on("messages.upsert", async chatUpdate => {
            try {
                const msg = chatUpdate.messages[0];
                if (!msg.message) return;

                if (msg.key.remoteJid !== 'status@broadcast' && msg.message) {
                     saveStoredMessages(msg.key.remoteJid, msg.key.id, msg);
                }

                // Call smsg from myfunc.js for system.js processing
                const m = smsgMyfunc(Matrix, msg, store); // <<< MODIFIED: Using smsgMyfunc and passing 'store'
                require("./system")(Matrix, m, chatUpdate, store);
            } catch (err) {
                // console.error("Error handling message:", err.stack || err.message); // Removed
            }
        });

        const badSessionRetries = {};

        Matrix.ev.on("connection.update", async update => {
            const { connection, lastDisconnect } = update;
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

            try {
                if (connection === "close") {
                    clearInterval(keepAliveInterval);
                    connectionNotified[MatrixNumber] = false;

                    // --- REMOVE SOCKET FROM GLOBAL ON DISCONNECT ---
                    if (global.activeSockets[MatrixNumber]) {
                        delete global.activeSockets[MatrixNumber];
                        // console.log(chalk.yellow(`[RENTPOT] Removed socket for ${MatrixNumber} from global.activeSockets.`)); // Removed
                    }

                    // --- PREMIUM CHECK: Prevent reconnect if not premium ---
                    if (!isPremiumUser(MatrixNumber)) {
                        // console.log(chalk.red(`[RENTPOT] Not reconnecting socket for ${MatrixNumber} (not premium).`)); // Removed
                        return;
                    }

                    switch (statusCode) {
                        case DisconnectReason.badSession:
                            badSessionRetries[MatrixNumber] = (badSessionRetries[MatrixNumber] || 0) + 1;
                            if (badSessionRetries[MatrixNumber] <= 6) {

                                pairingRequested[MatrixNumber] = false;
                                return setTimeout(() => startpairing(MatrixNumber), 3000);
                            } else {
                                // console.log(chalk.red(`[${MatrixNumber}] Bad session retry limit reached. Deleting session and starting fresh.`)); // Removed
                                deleteFolderRecursive(sessionPath);
                                if (!fs.existsSync(sessionPath)) {
                                    fs.mkdirSync(sessionPath, { recursive: true });

                                }
                                badSessionRetries[MatrixNumber] = 0;
                                pairingRequested[MatrixNumber] = false;
                                return setTimeout(() => startpairing(MatrixNumber), 5000);
                            }
                        case DisconnectReason.connectionClosed:
                        case DisconnectReason.connectionLost:
                        case DisconnectReason.restartRequired:
                        case 405:
                        case DisconnectReason.timedOut:
                            reconnectAttempts[MatrixNumber] = (reconnectAttempts[MatrixNumber] || 0) + 1;
                            if (reconnectAttempts[MatrixNumber] <= 5) {
                                // console.log(`[${MatrixNumber}] attempting reconnect (${reconnectAttempts[MatrixNumber]}/5)...`); // Removed
                                return setTimeout(() => startpairing(MatrixNumber), 2000);
                            } else {
                                // console.log(`[${MatrixNumber}] max reconnect attempts reached.`); // Removed
                            }
                            break;
                        case DisconnectReason.loggedOut:
                            // --- USER LOGGED OUT: DELETE SESSION FOLDER, KEEP PREMIUM ---
                            deleteFolderRecursive(sessionPath);
                            // console.log(chalk.bgRed(`${MatrixNumber} logged out. Session folder deleted.`)); // Removed
                            pairingRequested[MatrixNumber] = false;
                            // DO NOT remove premium from database!
                            break;
                        default:
                            connectionNotified[MatrixNumber] = false;
                    }
                } else if (connection === "open") {
                    // console.log(chalk.bgGreen(`Rent bot is active on ${MatrixNumber}`)); // Removed
                    reconnectAttempts[MatrixNumber] = 0;
                    badSessionRetries[MatrixNumber] = 0;

                    // --- START ADDED CODE FOR RENT BOT STARTUP MESSAGE ---

                    // Get specific settings for THIS rent bot instance from the database
                    const rentBotInstanceJid = Matrix.user.id; // This is the JID of the rent bot itself
                    // Ensure global.db is accessible (it should be if index.js runs first and sets it)
                    const rentBotSettings = global.db.data.users[rentBotInstanceJid] || {};

                    const instancePrefix = rentBotSettings.prefix ?? global.db.data.settings.prefix ?? '.';
                    const instanceMode = rentBotSettings.mode ?? global.db.data.settings.mode ?? 'public';

                    const modeStatus =
                        instanceMode === 'public' ? "Public" :
                        instanceMode === 'private' ? "Private" :
                        instanceMode === 'group' ? "Group Only" :
                        instanceMode === 'pm' ? "PM Only" : "Unknown";

                    // The 'const updates = await checkForUpdates();' line is removed here.

                    // Send the startup message to the rent bot's own JID (Matrix.user.id)
                    await Matrix.sendMessage(Matrix.user.id, {
                        text:
                            "╭༺◈👸🌹𝗤𝗨𝗘𝗘𝗡-𝗔𝗗𝗜𝗭𝗔🌹👸\n" +
                            "│📌 » *Username*: " + Matrix.user.name + "\n" +
                            "│💻 » *Platform*: " + os.platform() + "\n" +
                            "│⚡ » *Prefix*: [ " + instancePrefix + " ]\n" + 
                            "│🚀 » *Mode*: " + modeStatus + "\n" +    
                            `│🤖 » *Version*: [ ${versions} ]\n` +    
                            "╰───━━━༺◈༻━━━───╯\n\n" + 

                            "╭༺◈👑 *𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦* 👑◈༻╮\n" + 
                            `│🕒 *Uptime*: ${runtime(process.uptime())}\n` +
                            "╰───━━━༺◈༻━━━───╯\n\n" +

                            "╭༺◈⏰ *𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗧𝗜𝗠𝗘* ⏰◈༻╮\n" + 
                            `│🗓️ ${moment.tz('Africa/Accra').format('dddd, DD MMMM')}\n` +    
                            `│🕒 ${moment.tz('Africa/Accra').format('HH:mm:ss z')}\n` +                             `╰───━━━༺◈༻━━━───╯\n`
                            
                    }, {
                        ephemeralExpiration: 1800 
                    });
// --- END ADDED CODE ---


                }
            } catch (err) {
                // console.error("Connection update error:", err.stack || err.message); // Removed
                connectionNotified[MatrixNumber] = false;
                setTimeout(() => startpairing(MatrixNumber), 5000);
            }
        });

        Matrix.ev.on("creds.update", async creds => {
            try {
                await saveCreds();
            } catch (err) {
                // console.error("Failed to save credentials:", err.stack || err.message); // Removed
            }
        });

        // --- ADDED: Periodic GitHub upload of pairing sessions ---
       if (global.dbToken) {
    setInterval(() => {
                uploadPairingSessions().catch(console.error);
            }, 15 * 60 * 1000); // every 15 minutes
        }

    } catch (err) {
        // console.error("Fatal error in startpairing:", err.stack || err.message); // Removed
        setTimeout(() => startpairing(MatrixNumber), 5000);
    }
}

// --- ENHANCED & ROBUST SMSG FUNCTION (KEPT AS IS) ---
function smsg(sock, m) { // This function remains named 'smsg' for internal rentbot.js dependencies
    if (!m) return m;

    m.id = m.key.id;
    m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = jidNormalizedUser(m.fromMe && sock.user.id || m.participant || m.key.participant || m.chat || '');

    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype === 'viewOnceMessage')
            ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
            : m.message[m.mtype];

        m.text = m.message?.conversation || m.msg?.caption || m.msg?.text || '';

        // Add download helper to main message
        m.download = async () => {
            try {
                const type = m.mtype;
                if (!m.msg || !m.msg.mediaKey) {
                    throw new Error("Media key missing. Please send a new image.");
                }
                const stream = await downloadContentFromMessage(m.msg, type.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            } catch (e) {
                return null;
            }
        };

        // --- Robust Quoted Message Handling for ALL Types ---
        let quoted = null, quotedInfo = null;
        if (m.message?.stickerMessage?.contextInfo?.quotedMessage) {
            quoted = m.message.stickerMessage.contextInfo.quotedMessage;
            quotedInfo = m.message.stickerMessage.contextInfo;
        } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
            quotedInfo = m.message.extendedTextMessage.contextInfo;
        } else if (m.message?.imageMessage?.contextInfo?.quotedMessage) {
            quoted = m.message.imageMessage.contextInfo.quotedMessage;
            quotedInfo = m.message.imageMessage.contextInfo;
        } else if (m.message?.videoMessage?.contextInfo?.quotedMessage) {
            quoted = m.message.videoMessage.contextInfo.quotedMessage;
            quotedInfo = m.message.videoMessage.contextInfo;
        }

        if (quoted && quotedInfo) {
            let quotedType = getContentType(quoted);
            m.quoted = {
                key: {
                    remoteJid: quotedInfo.remoteJid || m.chat,
                    fromMe: quotedInfo.fromMe,
                    id: quotedInfo.stanzaId,
                    participant: quotedInfo.participant
                },
                message: quoted,
                mtype: quotedType,
                sender: jidNormalizedUser(quotedInfo.participant || quotedInfo.remoteJid),
                text: quoted[quotedType]?.text || quoted[quotedType]?.caption || quoted.conversation || '',
            };
            m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
                key: m.quoted.key,
                message: m.quoted.message,
                messageTimestamp: quotedInfo.messageTimestamp,
                participant: quotedInfo.participant
            });

            // Add download helper to quoted message
            m.quoted.download = async () => {
                try {
                    const type = m.quoted.mtype;
                    if (!m.quoted.message[type] || !m.quoted.message[type].mediaKey) {
                        throw new Error("Media key missing. Please ask the sender to resend the image.");
                    }
                    const stream = await downloadContentFromMessage(m.quoted.message[type], type.replace('Message', ''));
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    return buffer;
                } catch (e) {
                    return null;
                }
            };
        } else {
            m.quoted = undefined;
        }

        m.mentionedJid =
            m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
            m.message?.stickerMessage?.contextInfo?.mentionedJid ||
            [];

        m.reply = (text, chatId = m.chat, options = {}) =>
            sock.sendMessage(chatId, { text }, { quoted: m, ...options });
    }

    return m;
}

module.exports = {
    startpairing,
    createPairingRepo,
    ensureLocalPairingDir,
    downloadPairingSessions,
    uploadPairingSessions
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    delete require.cache[file];
    require(file);
});
