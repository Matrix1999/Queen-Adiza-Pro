const { default: makeWASocket, jidDecode, DisconnectReason, useMultiFileAuthState, Browsers, getContentType, proto, jidNormalizedUser, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Boom } = require("@hapi/boom");
const axios = require("axios"); 
const os = require('os'); 
const moment = require("moment-timezone"); 
const { runtime, smsg: smsgMyfunc } = require("./lib/myfunc");
const versions = require("./package.json").version;

// --- GLOBAL SOCKET MAP ---
global.activeSockets = global.activeSockets || {};
global.manuallyDisconnected = global.manuallyDisconnected || new Set(); 

const extendWASocket = require('./lib/matrixUtils');

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
            storedMessages = {};
        }
    }
    if (!storedMessages[chatId]) storedMessages[chatId] = {};
    if (!storedMessages[chatId][messageId]) {
        storedMessages[chatId][messageId] = messageData;
        try {
            fs.writeFileSync(storeFile, JSON.stringify(storedMessages, null, 2));
        } catch (err) {}
        return true;
    }
    return false;
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

function isPremiumUser(MatrixNumber) {
    const premiumUsers = (global.db && global.db.data && global.db.data.premium) ? global.db.data.premium : [];
    return premiumUsers.some(p => p.jid === MatrixNumber);
}

async function startpairing(MatrixNumber) {
    if (!isPremiumUser(MatrixNumber)) {
        return;
    }
    if (global.manuallyDisconnected.has(MatrixNumber)) {
        console.log(chalk.yellow(`[RENTPOT] Not starting session for ${MatrixNumber} (manually disconnected by owner).`));
        return;
    }
    try {
        const basePairingDir = path.join('./lib', 'pairing');
        if (!fs.existsSync(basePairingDir)) {
            fs.mkdirSync(basePairingDir, { recursive: true });
        }
        const sessionPath = path.join(basePairingDir, MatrixNumber);
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }
        const credsFilePath = path.join(sessionPath, 'creds.json');
        const pairingFilePath = path.join(sessionPath, 'pairing.json');

        if (fs.existsSync(pairingFilePath)) {
            const pairingData = JSON.parse(fs.readFileSync(pairingFilePath, 'utf-8'));
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        if (!state?.creds) {
            deleteFolderRecursive(sessionPath);
            if (!fs.existsSync(sessionPath)) {
                fs.mkdirSync(sessionPath, { recursive: true });
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
                return !!msg.syncType;
            }
        });

        const keepAliveInterval = setInterval(() => {
            if (Matrix?.user) {
                Matrix.sendPresenceUpdate('available').catch(err => {});
            }
        }, 1000 * 60 * 30);
        
        global.activeSockets[MatrixNumber] = {
            sock: Matrix,
            keepAliveIntervalId: keepAliveInterval
        };

        extendWASocket(Matrix);

        if (!state.creds.registered && MatrixNumber && !pairingRequested[MatrixNumber]) {
            pairingRequested[MatrixNumber] = true;
            const phoneNumber = MatrixNumber.replace(/[^0-9]/g, '');

            setTimeout(async () => {
                try {
                    let code = await Matrix.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    fs.writeFileSync(pairingFilePath, JSON.stringify({ code }, null, 2));
                } catch (err) {
                    if (!pairingCodeErrorShown) {
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
                const m = smsgMyfunc(Matrix, msg, store);
                require("./system")(Matrix, m, chatUpdate, store);
            } catch (err) {}
        });

        const badSessionRetries = {};

        Matrix.ev.on("connection.update", async update => {
            const { connection, lastDisconnect } = update;
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

            try {
                if (connection === "close") {
                    // ===> ADDED FOR DEBUGGING DISCONNECT REASONS <===
                    console.log("Disconnect error object:", lastDisconnect?.error);

                    if (global.activeSockets[MatrixNumber] && global.activeSockets[MatrixNumber].keepAliveIntervalId) {
                        clearInterval(global.activeSockets[MatrixNumber].keepAliveIntervalId);
                    }
                    
                    connectionNotified[MatrixNumber] = false;

                    if (global.activeSockets[MatrixNumber]) {
                        delete global.activeSockets[MatrixNumber];
                    }

                    if (!isPremiumUser(MatrixNumber)) {
                        return;
                    }
                    if (global.manuallyDisconnected.has(MatrixNumber)) {
                        console.log(chalk.yellow(`[RENTPOT] Not attempting reconnect for ${MatrixNumber} (manually disconnected by owner).`));
                        return;
                    }

                    switch (statusCode) {
                        case DisconnectReason.badSession:
                            badSessionRetries[MatrixNumber] = (badSessionRetries[MatrixNumber] || 0) + 1;
                            if (badSessionRetries[MatrixNumber] <= 6) {
                                pairingRequested[MatrixNumber] = false;
                                return setTimeout(() => startpairing(MatrixNumber), 3000);
                            } else {
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
                                return setTimeout(() => startpairing(MatrixNumber), 2000);
                            }
                            break;
                        case DisconnectReason.loggedOut:
                            deleteFolderRecursive(sessionPath);
                            pairingRequested[MatrixNumber] = false;
                            global.manuallyDisconnected.delete(MatrixNumber); 
                            if (global.db && global.db.data && Array.isArray(global.db.data.manualDisconnects)) {
                                global.db.data.manualDisconnects = global.db.data.manualDisconnects.filter(jid => jid !== MatrixNumber);
                                await global.db.write();
                                console.log(chalk.green(`[RENTPOT] ${MatrixNumber} logged out, removed from manual disconnect list (persistent).`));
                            } else {
                                console.log(chalk.green(`[RENTPOT] ${MatrixNumber} logged out, removed from manual disconnect list (runtime only).`));
                            }
                            break;
                        default:
                            connectionNotified[MatrixNumber] = false;
                            reconnectAttempts[MatrixNumber] = (reconnectAttempts[MatrixNumber] || 0) + 1;
                            if (reconnectAttempts[MatrixNumber] <= 5) {
                                console.log(chalk.yellow(`[RENTPOT] Unknown disconnection reason for ${MatrixNumber}, attempting reconnect (${reconnectAttempts[MatrixNumber]}/5)...`));
                                return setTimeout(() => startpairing(MatrixNumber), 2000);
                            } else {
                                console.log(chalk.red(`[RENTPOT] Max unknown reconnect attempts reached for ${MatrixNumber}.`));
                            }
                    }
                } else if (connection === "open") {
                    reconnectAttempts[MatrixNumber] = 0;
                    badSessionRetries[MatrixNumber] = 0;
                    if (global.manuallyDisconnected.has(MatrixNumber)) {
                        global.manuallyDisconnected.delete(MatrixNumber);
                        if (global.db && global.db.data && Array.isArray(global.db.data.manualDisconnects)) {
                            global.db.data.manualDisconnects = global.db.data.manualDisconnects.filter(jid => jid !== MatrixNumber);
                            await global.db.write();
                            console.log(chalk.green(`[RENTPOT] ${MatrixNumber} reconnected, removed from manual disconnect list (persistent).`));
                        } else {
                            console.log(chalk.green(`[RENTPOT] ${MatrixNumber} reconnected, removed from manual disconnect list (runtime only).`));
                        }
                    }
                    const rentBotInstanceJid = Matrix.user.id;
                    const rentBotSettings = global.db.data.users[rentBotInstanceJid] || {};
                    const instancePrefix = rentBotSettings.prefix ?? global.db.data.settings.prefix ?? '.';
                    const instanceMode = rentBotSettings.mode ?? global.db.data.settings.mode ?? 'public';
                    const modeStatus =
                        instanceMode === 'public' ? "Public" :
                        instanceMode === 'private' ? "Private" :
                        instanceMode === 'group' ? "Group Only" :
                        instanceMode === 'pm' ? "PM Only" : "Unknown";

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
                            `│🕒 ${moment.tz('Africa/Accra').format('HH:mm:ss z')}\n` + `╰───━━━༺◈༻━━━───╯\n`
                    }, {
                        ephemeralExpiration: 1800 
                    });
                }
            } catch (err) {
                connectionNotified[MatrixNumber] = false;
                setTimeout(() => startpairing(MatrixNumber), 5000);
            }
        });

        Matrix.ev.on("creds.update", async creds => {
            try {
                await saveCreds();
            } catch (err) {}
        });
    } catch (err) {
        setTimeout(() => startpairing(MatrixNumber), 5000);
    }
}

function smsg(sock, m) {
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

module.exports = startpairing;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    delete require.cache[file];
    require(file);
});
