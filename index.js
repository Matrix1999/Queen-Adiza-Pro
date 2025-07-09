
require('events').EventEmitter.defaultMaxListeners = 50;
require('./settings'); 
const {
    Telegraf,
    Markup
} = require('telegraf');
const {
    simple
} = require("./lib/myfunc"); 
global.activeSockets = global.activeSockets || {}; // Track all active Baileys sockets by JID
const fs = require("fs");
const os = require('os');
const speed = require('performance-now');
const axios = require("axios");
const chalk = require('chalk');
const { exec } = require('child_process');
const util = require('util'); // Added for util.format

const extendWASocket = require('./lib/matrixUtils'); 

const makeWASocket = require("@whiskeysockets/baileys").default
const { makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, generateForwardMessageContent, generateWAMessageFromContent, downloadContentFromMessage, jidDecode, proto, Browsers, normalizeMessageContent, getAggregateVotesInPollMessage, areJidsSameUser, jidNormalizedUser } = require("@whiskeysockets/baileys")
const { color } = require('./lib/color')
const pino = require("pino");
const path = require('path')
const NodeCache = require("node-cache");
const msgRetryCounterCache = new NodeCache();
const fetch = require("node-fetch")
const _ = require('lodash')
const express = require('express')
const app = express();
const timezones = "Africa/Accra";
const moment = require("moment-timezone")
const readmore = String.fromCharCode(8206).repeat(4001);
const { File } = require('megajs');
const PhoneNumber = require("awesome-phonenumber");
const readline = require("readline");
const { formatSize, runtime, sleep, serialize, smsg, getBuffer } = require("./lib/myfunc") 
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { toAudio, toPTT, toVideo } = require('./lib/converter')
const FileType = require('file-type')

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

const low = require('./lib/lowdb');
const yargs = require('yargs/yargs');
const { Low, JSONFile } = low;
const port = process.env.PORT || 3000;
const versions = require("./package.json").version
const PluginManager = require('./lib/PluginManager');
const pluginManager = new PluginManager(path.resolve(__dirname, './src/Plugins'));

const ownernumber = "233544981163"; // or load from config/env


// Database
const dbName = "Matrix-db";
const dbPath = `${global.ownernumber.replace('@s.whatsapp.net', '')}.json`; // Use global.ownernumber from settings
const localDb = path.join(__dirname, "src", "database.json");

global.db = new Low(new JSONFile(localDb));

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise(resolve => setInterval(() => {
        if (!global.db.READ) {
            clearInterval(this);
            resolve(global.db.data ?? global.loadDatabase());
        }
    }, 1000));

    if (global.db.data !== null) return;

    global.db.READ = true;

    try {
        await global.db.read();

        if (!global.db.data || Object.keys(global.db.data).length === 0) {
            console.log("[ADIZATU] Syncing local database...");
            await readDB(); // Assuming readDB populates global.db.data
            await global.db.read(); // Re-read after potential GitHub sync
        }

    } catch (error) {
        console.error("❌ Error loading database:", error);
        global.db.data = {};
    }

    global.db.READ = false;

    global.db.data ??= {};

    // --- START MODIFICATION ---
    global.db.data = {
      chats: global.db.data.chats && Object.keys(global.db.data.chats).length ? global.db.data.chats : {},
      users: global.db.data.users && Object.keys(global.db.data.users).length ? global.db.data.users : {}, // ADDED THIS LINE FOR INDIVIDUAL USER DATA
      settings: global.db.data.settings && Object.keys(global.db.data.settings).length ? global.db.data.settings : {
    
        autobio: false,
        anticall: false,
        autotype: false,
        autoread: false,
        welcome: false,
        antiedit: "private",
        menustyle: "2",
        autoreact: false,
        statusemoji: "🧡",
        autorecord: false,
        antidelete: "private",
        alwaysonline: false,
        autoviewstatus: false,
        autoreactstatus: false,
        autorecordtype: false
      },
      blacklist: global.db.data.blacklist && Object.keys(global.db.data.blacklist).length ? global.db.data.blacklist : {
        blacklisted_numbers: []
      },
      sudo: Array.isArray(global.db.data.sudo) && global.db.data.sudo.length ? global.db.data.sudo : [],
      premium: Array.isArray(global.db.data.premium) ? global.db.data.premium : []
};
    // --- END MODIFICATION ---

    global.db.chain = _.chain(global.db.data);
    await global.db.write();
};


// GitHub Functions (unchanged, as they handle sync with your GitHub DB)
async function getOctokit() {
    const { Octokit } = await import("@octokit/rest");
    return new Octokit({ auth: global.dbToken });
}

async function getOwner(octokit) {
    const user = await octokit.rest.users.getAuthenticated();
    return user.data.login;
}

async function createDB() {
    if (!global.dbToken) return;
    try {
        const octokit = await getOctokit();
        const owner = await getOwner(octokit);
        await octokit.repos.createForAuthenticatedUser({ name: dbName, private: true });
        console.log("[MATRIX-X] Database created successfully.");
    } catch (error) {
        if (error.status === 422) {
            return;
        } else {
            console.error("❌ Error creating repository database:", error);
        }
    }
}

async function readDB() {
    if (!global.dbToken) return;
    try {
        const octokit = await getOctokit();
        const owner = await getOwner(octokit);
        const { data } = await octokit.repos.getContent({ owner, repo: dbName, path: dbPath });

        const content = Buffer.from(data.content, "base64").toString("utf-8");

        if (!content || content.trim() === "{}") {
            console.log("[MATRIX-X] GitHub database content is empty. Will initialize defaults.");
            return;
        }

        const githubData = JSON.parse(content);
        fs.writeFileSync(localDb, JSON.stringify(githubData, null, 2));
        console.log("[MATRIX-X] Synced local database successfully from GitHub.");

    } catch (error) {
        if (error.status === 404) {
            console.log("[MATRIX-X] GitHub database file not found. Will attempt to create on first write.");
        } else {
            console.error("❌ Error reading database from GitHub:", error);
        }
    }
}

global.writeDB = async function () {
    if (!global.dbToken) return;
    try {
        await global.db.write();

        const octokit = await getOctokit();
        const owner = await getOwner(octokit);
        const content = fs.readFileSync(localDb, "utf-8");
        let sha;

        try {
            const { data } = await octokit.repos.getContent({ owner, repo: dbName, path: dbPath });
            sha = data.sha;
        } catch (error) {
            if (error.status !== 404) throw error;
        }

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo: dbName,
            path: dbPath,
            message: `Updated database`,
            content: Buffer.from(content).toString("base64"),
            sha,
        });

        console.log("[MATRIX-X] Successfully synced local database to GitHub.");
    } catch (error) {
        console.error("❌ Error writing database to GitHub:", error);
    }
};

(async () => {
    if (global.dbToken) {
        await createDB();
        await readDB();
    }
    await global.loadDatabase();
    
    // Ensure global.ownernumber is a full JID before bot start
    if (global.ownernumber && !global.ownernumber.includes('@s.whatsapp.net')) {
        global.ownernumber = `${global.ownernumber}@s.whatsapp.net`;
        console.log(`[ADIZATU] Owner number normalized to: ${global.ownernumber}`);
    }

    // --- NEW: Require premiumSystem HERE, after DB is loaded ---
    require('./lib/premiumSystem');
    
        // --- RENTBOT AUTO-START: Ensures rentbot sessions come online on restart ---
    const rentbot = require('./rentbot');
await rentbot.createPairingRepo();
rentbot.ensureLocalPairingDir();
await rentbot.downloadPairingSessions(); // <--- This must finish first!

if (global.db && global.db.data && Array.isArray(global.db.data.premium)) {
    const rentbotUsers = global.db.data.premium.filter(u => u.jid);
    console.log(`[RENTPOT] Found ${rentbotUsers.length} premium users to start rentbots for.`);
    for (const user of rentbotUsers) {
        try {
            if (typeof rentbot.startpairing === 'function') {
                await rentbot.startpairing(user.jid);
                console.log(`[RENTPOT] Successfully initiated rentbot for premium user: ${user.jid}`);
            } else {
                console.error(`[RENTPOT] Error: 'startpairing' function not exported from rentbot.js, cannot start rentbot for ${user.jid}.`);
            }
        } catch (err) {
            console.error(`[RENTPOT] Failed to start rentbot for ${user.jid}:`, err);
        }
    }
} else {
    console.warn("[RENTPOT] No premium user data found to start rentbots. Ensure global.db is loaded correctly.");
}

    // --- END RENTBOT AUTO-START BLOCK ---

    

    Object.defineProperty(global, "mode", {
      get() { return global.db.data.settings.mode || "public" },
      set(val) { global.db.data.settings.mode = val }
    });

    global.settings = global.db.data.settings;
    global.modeStatus = global.settings.mode === "public" ? "Public" : global.settings.mode === "private" ? "Private" : global.settings.mode === "group" ? "Group Only" : global.settings.mode === "pm" ? "PM Only" : "Unknown";

    global.db.data.settings.sudo = global.db.data.settings.sudo || [
        ...(Array.isArray(global.sudo) ? global.sudo : [])
        .map(num => num.includes('@') ? num : `${num}@s.whatsapp.net`)
    ];
    await global.db.write();

    // --- Call startMatrix() HERE, after premiumSystem is loaded ---
    await startMatrix();

})(); // End of the main async IIFE

if (global.dbToken) {
    setInterval(global.writeDB, 5 * 60 * 1000); // 5 minutes
}

if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write();
}, 30 * 1000);

// ... rest of your index.js code remains the same ...

let phoneNumber = "233544981163"
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")
const usePairingCode = true
const question = (text) => {
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});
return new Promise((resolve) => {
rl.question(text, resolve)
})
};


function cleanUp() {
  const _0x1c5d11 = [path.join(__dirname, ".npm"), path.join(__dirname, ".cache")];
  _0x1c5d11.forEach(_0x216fb8 => {
    if (fs.existsSync(_0x216fb8)) {
      try {
        fs.rmSync(_0x216fb8, {
          recursive: true,
          force: true
        });
      } catch (_0x4e9a98) {
        console.error("Error cleaning up " + _0x216fb8 + ":", _0x4e9a98);
      }
    }
  });
}


const storeFile = "./src/store.json";
const maxMessageAge = 24 * 60 * 60; //24 hours

function loadStoredMessages() {
    if (fs.existsSync(storeFile)) {
        try {
            return JSON.parse(fs.readFileSync(storeFile));
        } catch (err) {
            console.error("⚠️ Error loading store.json:", err);
            return {};
        }
    }
    return {};
}

function saveStoredMessages(chatId, messageId, messageData) {
    let storedMessages = loadStoredMessages();

    if (!storedMessages[chatId]) storedMessages[chatId] = {};
    if (!storedMessages[chatId][messageId]) {
        storedMessages[chatId][messageId] = messageData;
        fs.writeFileSync(storeFile, JSON.stringify(storedMessages, null, 2));
    }
}

function cleanupOldMessages() {
    let now = Math.floor(Date.now() / 1000);
    let storedMessages = {};

    if (fs.existsSync(storeFile)) {
        try {
            storedMessages = JSON.parse(fs.readFileSync(storeFile));
        } catch (err) {
            console.error("❌ Error reading store.json:", err);
            return;
        }
    }

    let totalMessages = 0, oldMessages = 0, keptMessages = 0;

    for (let chatId in storedMessages) {
        let messages = storedMessages[chatId];

        for (let messageId in messages) {
            let messageTimestamp = messages[messageId].timestamp;

            if (typeof messageTimestamp === "object" && messageTimestamp.low !== undefined) {
                messageTimestamp = messageTimestamp.low;
            }

            if (messageTimestamp > 1e12) {
                messageTimestamp = Math.floor(messageTimestamp / 1000);
            }

            totalMessages++;

            if (now - messageTimestamp > maxMessageAge) {
                delete storedMessages[chatId][messageId];
                oldMessages++;
            } else {
                keptMessages++;
            }
        }

        if (Object.keys(storedMessages[chatId]).length === 0) {
            delete storedMessages[chatId];
        }
    }

    fs.writeFileSync(storeFile, JSON.stringify(storedMessages, null, 2));

    console.log("[ADIZATU] 🧹 Cleaning up:");
    console.log(`- Total messages processed: ${totalMessages}`);
    console.log(`- Old messages removed: ${oldMessages}`);
    console.log(`- Remaining messages: ${keptMessages}`);
}

async function loadAllPlugins() {
  try {
    await pluginManager.unloadAllPlugins();
    await pluginManager.loadPlugins();
  } catch (error) {
    console.log(`[MATRIX-X] Error loading plugins: ${error.message}`);
  }
}

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

async function downloadSessionData() {
  try {
    await fs.promises.mkdir(sessionDir, { recursive: true });

    if (!fs.existsSync(credsPath) && global.SESSION_ID) {
      const sessdata = global.SESSION_ID.split("QUEEN-ADIZA~")[1];
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);

      filer.download(async (err, data) => {
        if (err) throw err;
        await fs.promises.writeFile(credsPath, data);
        console.log(color(`[MATRIX-X] Session saved successfully`, 'green'));
        await startMatrix();
      });
    }
  } catch (error) {
    console.error('Error downloading session data:', error);
  }
}

async function startMatrix() {
  const { state, saveCreds } = await useMultiFileAuthState(`./session`);
  const msgRetryCounterCache = new NodeCache();

  const Matrix = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !pairingCode,
    version: [2, 3000, 1017531287],
    browser: Browsers.ubuntu('Edge'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      if (msg) return msg?.message || "";
      return key.id ? (await Matrix.fetchMessagesFromWA(key.remoteJid, [key])).messages[0]?.message || '' : '';
    },
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined,
  });
  
  
  global.mainMatrix = Matrix;
  
  require('./lib/premiumSystem'); 

  // Extend the Matrix object with your custom utilities
  extendWASocket(Matrix);

  // Presence update event listener — track who is online/offline
  Matrix.ev.on('presence.update', ({ id, presences }) => {
  
    if (!store.presences) store.presences = {};
    if (!store.presences[id]) store.presences[id] = {};

    if (presences) {
      for (const [userJid, presenceInfo] of Object.entries(presences)) {
        if (presenceInfo.lastKnownPresence === 'available') {
          store.presences[id][userJid] = true;
        } else {
          delete store.presences[id][userJid];
        }
      }
    }
  });

  
  setInterval(() => {
  }, 10000);
  // --- END ADDED DEBUG LOG ---

  // Your existing pairing code logic
  if (usePairingCode && !Matrix.authState.creds.registered) {
    if (useMobile) throw new Error('Cannot use pairing code with mobile API');

    let phoneNumber;
    phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Number to be connected to Adiza Bot?\nExample 233593734312:- `)));
    phoneNumber = phoneNumber.trim();

    setTimeout(async () => {
      const code = await Matrix.requestPairingCode(phoneNumber);
      console.log(chalk.black(chalk.bgWhite(`[ADIZATU]:- ${code}`)));
    }, 3000);
  }

  

Matrix.ev.on('connection.update', async (update) => {
	const {
		connection,
		lastDisconnect
	} = update
try{

if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
if (lastDisconnect.error.output.statusCode === DisconnectReason.loggedOut)
console.log("Logged out. Please link again.");
if (lastDisconnect.error.output.statusCode === DisconnectReason.badSession)
console.log("Bad session. Log out and link again.");
startMatrix();
}

		if (update.connection == "connecting") {
			console.log(color(`[ADIZATU] Connecting...`, 'red'))
		}
		if (update.connection == "open") {
            console.log(color(`[ADIZATU] Connected`, 'green'))

// Wait for 2 seconds
await sleep(2000);

try {

  console.log("Group Invite: welcome to ethical hacks");
} catch (error) {
  console.log("An error occurred: " + (error.message || error));
}

// Function to accept a group invite with retries
async function acceptGroupInvite(inviteCode, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await Matrix.groupAcceptInvite(inviteCode);
      return;  // Success, exit function
    } catch (err) {
      if (attempt === maxRetries) {
        // Give up after max retries
        return;
      } else {
        // Wait 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

const inviteCode = "Dly93CfsXHCH1gB5sOdVLt";

// Try to accept the group invite with retries, then log success
acceptGroupInvite(inviteCode).then(() => {
  console.log("🚀🚀⚡ 🤖 ⚡🚀🚀");
});


await Matrix.sendMessage(Matrix.user.id, {
  text:
    "╭༺◈👸🌹𝗤𝗨𝗘𝗘𝗡-𝗔𝗗𝗜𝗭𝗔🌹👸\n" +
    "│📌 » *Username*: " + Matrix.user.name + "\n" +
    "│💻 » *Platform*: " + os.platform() + "\n" +
    "│⚡ » *Global Fallback Prefix*: [ . ]\n" + 
    "│🚀 » *Global Fallback Mode*: Public\n" +
    "│🤖 » *Version*: [ " + versions + " ]\n" +
    "╰───━━━༺◈༻━━━───╯\n\n" + // Main bot info block

    "╭༺◈👑 *𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦* 👑◈༻╮\n" +
    `│🕒 *Uptime*: ${runtime(process.uptime())}\n` +
    "╰───━━━༺◈༻━━━───╯\n\n" + 

    
    "╭༺◈⏰ *𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗧𝗜𝗠𝗘* ⏰◈༻╮\n" +
    `│🗓️ ${moment.tz(timezones).format('dddd, DD MMMM YYYY')}\n` +
    `│🕒 ${moment.tz(timezones).format('HH:mm:ss z')}\n` + 
    `╰───━━━༺◈༻━━━───╯\n` 

}, {
  ephemeralExpiration: 1800
});




        // ====================================\\
        // Add deleteFolderRecursive and pairing folder cleanup from main.js here
        const { promisify } = require('util');
        const readdir = promisify(fs.readdir);
        // rmdir, stat, unlink are not directly used in the cleanup logic, so can be omitted if not used elsewhere
        async function deleteFolderRecursive(path) {
            fs.rm(path, { recursive: true, force: true }, (err) => {
                if (err) console.error(`Error deleting ${path}:`, err);
                else console.log(`Deleted folder: ${path}`);
            });
        }
        await sleep(1999); // (already there, but re-confirming for context)
        fs.readdir('./lib/pairing/', { withFileTypes: true }, async (err, dirents) => {
            if (err) return console.error(err);

            for (let i = 0; i < dirents.length; i++) {
                const dirent = dirents[i];
                const dirPath = `./lib/pairing/${dirent.name}`;

                if (dirent.isDirectory()) {
                    try {
                        const files = await readdir(dirPath);
                        if (files.length === 0) {
                            // Wait for 1 minute before deleting the folder
                            await sleep(60000);
                            await deleteFolderRecursive(dirPath);
                        } else {
                            console.log(dirent.name);
                            // If you need the re-pairing logic, ensure rentbot.js is available
                            const rentbot = require('./rentbot.js');
                            await rentbot.startpairing(dirent.name);

                            await sleep(200);
                        }
                    } catch (err) {
                        console.error(`Error processing directory ${dirent.name}:`, err);
                    }
                }
            }
        });
        // ====================================\\
    }

} catch (err) {
	  console.log('Error in Connection.update '+err)
	  startMatrix();
	}
})

Matrix.ev.on('creds.update', saveCreds);

// appenTextMessage function definition for poll updates
const appenTextMessage = async (m, MatrixInstance, text, chatUpdate) => { // Renamed AdizaBotInc to MatrixInstance
    let messages = await generateWAMessage(
      m.key.remoteJid,
      {
        text: text
      },
      {
        quoted: m.quoted,
      },
    );
    messages.key.fromMe = areJidsSameUser(m.sender, MatrixInstance.user.id);
    messages.key.id = m.key.id;
    messages.pushName = m.pushName;
    if (m.isGroup) messages.participant = m.sender;
    let msg = {
      ...chatUpdate,
      messages: [proto.WebMessageInfo.fromObject(messages)],
      type: "append",
    };
    return MatrixInstance.ev.emit("messages.upsert", msg);
}
// Helper to get message for poll updates. Assumes `store` is available globally.
async function getMessage(key) {
    if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg
    }
    return {
        conversation: "Queen Adiza Bot"
    }
}

Matrix.ev.on('messages.update',
    async(chatUpdate) => {
    for (const { key, update } of chatUpdate) {
      	if (update.pollUpdates && key.fromMe) {
	     const pollCreation = await getMessage(key);
	   	if (pollCreation) {
             let pollUpdate = await getAggregateVotesInPollMessage({
							message: pollCreation?.message,
							pollUpdates: update.pollUpdates,
						});
	          let toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
              console.log(toCmd);
	          await appenTextMessage(pollCreation, Matrix, toCmd,
              pollCreation);
	          await Matrix.sendMessage(key.remoteJid, { delete: key });
	         	} else return false
	          return
   	    	}
   	      }
        });


// Merged messages.upsert handler
Matrix.ev.on('messages.upsert', async (chatUpdate) => {
  try {
    const processedMessages = new Set();

    for (const msg of chatUpdate.messages) {
      if (!msg.message) continue;

      // Save message for persistence
      const chatId = msg.key.remoteJid;
      const messageId = msg.key.id;
      saveStoredMessages(chatId, messageId, msg);

      // Normalize message content
      msg.message = normalizeMessageContent(msg.message);

      // Filter unwanted message IDs
      if (
        msg.key.id.startsWith('BAE5') ||
        (msg.key.id.startsWith('3EBO') && msg.key.id.length === 22) ||
        (!msg.key.id.startsWith('3EBO') && msg.key.id.length === 22) ||
        (msg.key.id.length !== 32 && msg.key.id.length !== 20)
      ) continue;

      // Avoid processing duplicates
      if (processedMessages.has(messageId)) continue;
      processedMessages.add(messageId);

      // Process message with your system handler
      const m = smsg(Matrix, msg, store);
      require('./system')(Matrix, m, chatUpdate, store);
    }
  } catch (err) {
    console.error('Error handling messages.upsert:', err);
  }
});

// Interval to clear old session files every 2 hours
setInterval(() => {
  try {
    const sessionPath = path.join(__dirname, 'session');
    fs.readdir(sessionPath, (err, files) => {
      if (err) {
        console.error("Unable to scan directory:", err);
        return;
      }

      const now = Date.now();
      const filteredArray = files.filter((item) => {
        const filePath = path.join(sessionPath, item);
        const stats = fs.statSync(filePath);

        return (
          (item.startsWith("pre-key") ||
           item.startsWith("sender-key") ||
           item.startsWith("session-") ||
           item.startsWith("app-state")) &&
          item !== 'creds.json' &&
          now - stats.mtimeMs > 2 * 24 * 60 * 60 * 1000
        );
      });

      if (filteredArray.length > 0) {
        console.log(`Found ${filteredArray.length} old session files.`);
        console.log(`Clearing ${filteredArray.length} old session files...`);

        filteredArray.forEach((file) => {
          const filePath = path.join(sessionPath, file);
          fs.unlinkSync(filePath);
        });
      } else {
        console.log("No old session files found.");
      }
    });
  } catch (error) {
    console.error('Error clearing old session files:', error);
  }
}, 7200000);

// Interval to cleanup old messages every hour
setInterval(cleanupOldMessages, 60 * 60 * 1000);

// Ensure tmp folder exists
function createTmpFolder() {
  const folderName = "tmp";
  const folderPath = path.join(__dirname, folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
}
createTmpFolder();

// Junk files cleanup every 30 seconds
setInterval(() => {
  let directoryPath = path.join();
  fs.readdir(directoryPath, async function (err, files) {
    if (err) {
      console.error("Unable to scan directory:", err);
      return;
    }

    var filteredArray = files.filter(item =>
      item.endsWith("gif") ||
      item.endsWith("png") ||
      item.endsWith("mp3") ||
      item.endsWith("mp4") ||
      item.endsWith("opus") ||
      item.endsWith("jpg") ||
      item.endsWith("webp") ||
      item.endsWith("webm") ||
      item.endsWith("zip")
    );

    if (filteredArray.length > 0) {
      let teks = `Detected ${filteredArray.length} junk files,\nJunk files have been deleted🚮`;
      Matrix.sendMessage(Matrix.user.id, { text: teks });

      setTimeout(() => {
        filteredArray.forEach(function (file) {
          let filePath = path.join(directoryPath, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        console.log("Junk files cleared");
      }, 15_000);
    }
  });
}, 30_000);

// Decode JID helper function
Matrix.decodeJid = (jid) => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    let decode = jidDecode(jid) || {};
    return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
  } else return jid;
};

Matrix.ev.on("contacts.update", (update) => {
for (let contact of update) {
let id = Matrix.decodeJid(contact.id);
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
}
});

Matrix.ev.on("group-participants.update", async ({ id: groupId, participants, action }) => {
  // Get the current bot instance's JID
  const botJid = Matrix.user.id;


  const botInstanceSettings = global.db.data.users[botJid] || {}; // Ensure this is available.
  const instanceWelcomeStatus = botInstanceSettings.welcome ?? global.db.data.settings.welcome ?? false; // Default to false

  // Check if welcome messages are enabled for THIS bot instance
  if (instanceWelcomeStatus === true) { // FIX: Use individual setting here
    try {
      // Fetch group metadata (name, participants, etc.)
      const groupMetadata = await Matrix.groupMetadata(groupId);
      const memberCount = groupMetadata.participants.length;
      const groupName = groupMetadata.subject;

      // Loop through each participant who joined or left
      for (const participant of participants) {
        // Get participant's profile picture
        const userPic = await getUserPicture(participant);
        // Get group's profile picture (not used here but fetched)
        const groupPic = await getGroupPicture(groupId); // groupPic is defined but not used here, consistent with original.

        if (action === "add") {
          // Send welcome message when participant is added
          sendWelcomeMessage(groupId, participant, groupName, memberCount, userPic);
        } else if (action === "remove") {
          // Send goodbye message when participant is removed
          sendGoodbyeMessage(groupId, participant, groupName, memberCount, userPic);
        }
      }
    } catch (error) {
      console.error(`❌ Error in Welcome/Goodbye handler for group ${groupId}:`, error);
    }
  }
});


async function getUserPicture(userId) {
  try {
    return await Matrix.profilePictureUrl(userId, 'image');
  } catch {
    return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
  }
}

async function getGroupPicture(groupId) {
  try {
    return await Matrix.profilePictureUrl(groupId, 'image');
  } catch {
    return 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60';
  }
}

async function sendWelcomeMessage(groupId, participant, groupName, memberCount, profilePic) {
  try {
    const userTag = `@${participant.split('@')[0]}`;
    // timezones should be globally accessible in index.js, or passed/derived
    const joinTime = moment.tz(timezones).format('HH:mm:ss');
    const joinDate = moment.tz(timezones).format('DD/MM/YYYY');

    // New decorative lines with crown and elegant flair
    const lineTop = "╭──━─━─༺🔮༻━───━─╮";
    const lineMiddle = "╰──━─━─༺🔮༻━───━─╯";
    const lineBottom = "🌹✧✦✧✦✧✦✧✦✧✦✧✦✧🌹";

    const welcomeMessage =
`${lineTop}
✨ *Welcome to ${groupName}!* ✨
${lineMiddle}

Hello ${userTag} 👋

You're our *${memberCount}th* member!

🕒 Join time: ${joinTime}
📅 Date: ${joinDate}

${lineBottom}
Stay awesome! 😊
${lineTop}

> ${global.wm}`; // global.wm should be defined in settings.js

    await Matrix.sendMessage(groupId, {
      image: { url: profilePic },  // Send big photo
      caption: welcomeMessage,
      contextInfo: {
        mentionedJid: [participant]
        // externalAdReply removed to avoid small preview photo
      }
    });
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}


async function sendGoodbyeMessage(groupId, participant, groupName, memberCount, profilePic) {
const goodbyeMessage = `✨ *Goodbye @${participant.split('@')[0]}!* ✨

You'll be missed in ${groupName}!🥲

We're now ${memberCount} members.

Left at: ${moment.tz(timezones).format('HH:mm:ss')},  ${moment.tz(timezones).format('DD/MM/YYYY')}

> ${global.wm}`; // global.wm should be defined in settings.js

  Matrix.sendMessage(groupId, {
    text: goodbyeMessage,
    contextInfo: {
      mentionedJid: [participant],
      externalAdReply: {
        title: global.botname, // global.botname should be defined in settings.js
        body: ownername,      // ownername should be defined in settings.js
        previewType: 'PHOTO',
        thumbnailUrl: '',
        thumbnail: await getBuffer(profilePic), // getBuffer should be available in index.js scope
        sourceUrl: plink     // plink should be defined in settings.js
      }
    }
  });
}
//------------------------------------------------------//


Matrix.serializeM = (m) => smsg(Matrix, m, store)

Matrix.getName = (jid, withoutContact = false) => {
id = Matrix.decodeJid(jid);
withoutContact = Matrix.withoutContact || withoutContact;
let v;
if (id.endsWith("@g.us"))
return new Promise(async (resolve) => {
v = store.contacts[id] || {};
if (!(v.name || v.subject)) v = Matrix.groupMetadata(id) || {};
resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
});
else
v =
id === "0@s.whatsapp.net"
? {
id,
name: "WhatsApp",
}
: id === Matrix.decodeJid(Matrix.user.id)
? Matrix.user
: store.contacts[id] || {};
return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
};

Matrix.getFile = async (PATH, returnAsFilename) => {
    let res, filename;
    const data = Buffer.isBuffer(PATH)
        ? PATH
        : /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split`, `[1], 'base64')
        : /^https?:\/\//.test(PATH)
        ? await (res = await fetch(PATH)).buffer()
        : fs.existsSync(PATH)
        ? (filename = PATH, fs.readFileSync(PATH))
        : typeof PATH === 'string'
        ? PATH
        : Buffer.alloc(0);

    if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer');

    const type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };

    if (returnAsFilename && !filename) {
        filename = path.join(__dirname, './tmp/' + new Date() * 1 + '.' + type.ext);
        await fs.promises.writeFile(filename, data);
    }

    const deleteFile = async () => {
        if (filename && fs.existsSync(filename)) {
            await fs.promises.unlink(filename).catch(() => {});
        }
    };

    setImmediate(deleteFile);
    data.fill(0);

    return { res, filename, ...type, data, deleteFile };
};

Matrix.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];

    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    const data = Buffer.from(buffer);
    buffer.fill(0);
    buffer = null;

    return data;
};

Matrix.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
let type = await Matrix.getFile(path, true)
let { res, data: file, filename: pathFile } = type
if (res && res.status !== 200 || file.length <= 65536) {
try { throw { json: JSON.parse(file.toString()) } }
catch (e) { if (e.json) throw e.json }
}
let opt = { filename }
if (quoted) opt.quoted = quoted
if (!type) options.asDocument = true
let mtype = '', mimetype = type.mime, convert
if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
else if (/video/.test(type.mime)) mtype = 'video'
else if (/audio/.test(type.mime)) (
convert = await (ptt ? toPTT : toAudio)(file, type.ext),
file = convert.data,
pathFile = convert.filename,
mtype = 'audio',
mimetype = 'audio/ogg; codecs=opus'
)
else mtype = 'document'
if (options.asDocument) mtype = 'document'

let message = {
...options,
caption,
ptt,
[mtype]: { url: pathFile },
mimetype
}
let m
try {
m = await Matrix.sendMessage(jid, message, { ...opt, ...options })
} catch (e) {
console.error(e)
m = null
} finally {
if (!m) m = await Matrix.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
return m
}
}

Matrix.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
if (options.readViewOnce) {
message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = {
...message.message.viewOnceMessage.message
}
}
let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo
}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo
}
} : {})
} : {})
await Matrix.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
return waMessage
}

Matrix.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}
await Matrix.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

Matrix.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];

    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    let type = await FileType.fromBuffer(buffer);
    let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    let savePath = path.join(__dirname, 'tmp', trueFileName); // Save to 'tmp' folder

    await fs.writeFileSync(savePath, buffer);

    buffer = null;
    global.gc?.();

    return savePath;
};

Matrix.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await Matrix.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}
Matrix.sendText = (jid, text, quoted = '', options) => Matrix.sendMessage(jid, { text: text, ...options }, { quoted })

Matrix.sendTextWithMentions = async (jid, text, quoted, options = {}) => Matrix.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

return Matrix;
}

// Telegram-specific constants and functions (from main.js)
const cooldowns = new Map();
// adminfile is now handled by premiumUsers below.

// File to store all Telegram user IDs
const usersFile = 'users.json';
// Ensure the users file exists for Telegram bot
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
}

async function saveTelegramUser(userId) {
    // Load existing users
    let users = [];
    if (fs.existsSync(usersFile)) {
        try {
            const data = fs.readFileSync(usersFile, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            console.error('Error reading Telegram users file:', error);
            users = [];
        }
    }

    // Check if the user already exists
    if (!users.includes(userId)) {
        users.push(userId); // Add the new user ID

        // Save the updated list of users
        try {
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
            console.log(`Telegram User ID ${userId} added to the users list.`);
        } catch (error) {
            console.error('Error writing to Telegram users file:', error);
        }
    }
}

let allTelegramUsers = []; // Initialize
try {
    allTelegramUsers = JSON.parse(fs.readFileSync(usersFile));
} catch (error) {
    console.error('Error loading allTelegramUsers:', error);
    allTelegramUsers = []; // Defensive re-initialization
}

const premium_file = './lib/premium.json';
let premiumUsers = []; // Initialize
try {
    premiumUsers = JSON.parse(fs.readFileSync(premium_file));
} catch (error) {
    console.error('Error reading premiumUsers file:', error);
    premiumUsers = [];
}

// Function to escape MarkdownV2 special characters (Telegram specific)
function escapeMarkdownV2(text) {
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

const bot = new Telegraf(BOT_TOKEN); // Initialize Telegraf bot instance

async function startAdiza() {
    bot.on('callback_query', async (AdizaBotInc) => {
        // Split the action and extract user ID
        const action = AdizaBotInc.callbackQuery.data.split(' ');
        const user_id = Number(action[1]);

        // Check if the callback is from the correct user
        if (AdizaBotInc.callbackQuery.from.id !== user_id) {
            return AdizaBotInc.answerCbQuery('Oof! this button is not for you!', {
                show_alert: true
            });
        }

        const timestampi = speed();
        const latensii = speed() - timestampi;
        const user = simple.getUserName(AdizaBotInc.callbackQuery.from);
        const pushname = user.full_name;
        const username = user.username ? user.username : "MATRIX";
        const isCreator = [AdizaBotInc.botInfo.username, ...global.OWNER].map(v => v.replace("https://t.me/Matrixxxxxxxxx", '')).includes(username);

        const reply = async (text) => {
            for (let x of simple.range(0, text.length, 4096)) { // Split text to avoid overflow
                await AdizaBotInc.replyWithMarkdown(text.substr(x, 4096), {
                    disable_web_page_preview: true
                });
            }
        };

        try {
            switch (action[0]) {
                // Add any specific callback query actions here if needed from original main.js
            }
        } catch (e) {
            console.log(e);
        }
    });

    bot.command('start', async (AdizaBotInc) => {
        try {
            const user = AdizaBotInc.message.from;
            const fullName = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
            await AdizaBotInc.reply(lang.first_chat(BOT_NAME, fullName), {
                parse_mode: "MarkdownV2", // Updated to "MarkdownV2"
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'OWNER',
                            url: "https://t.me/Matrixxxxxxxxx"
                        }, {
                            text: 'CHANNEL',
                            url: "https://t.me/QueenAdiza"
                        }]
                    ]
                }
            });
        } catch (e) {
            console.log(e);
        }
    });

    bot.command('listprem', async (AdizaBotInc) => {
        const isOwner = global.DEVELOPER.includes(AdizaBotInc.message.from.id.toString());
        if (!isOwner) {
            return AdizaBotInc.reply(`You are not authorized to use this command.\nPlease dm ${OWNER_NAME} for buy.`);
        }
        try {
            const adminList = premiumUsers.length > 0 ? premiumUsers.join('\n') : "No admins found.";
            await AdizaBotInc.reply(`👮 Premium List:\n${adminList}`);
        } catch (error) {
            console.error('Error listing admins:', error);
            AdizaBotInc.reply('Error listing premium users.');
        }
    });

    bot.command('addprem', async (AdizaBotInc) => {
        const isOwner = global.DEVELOPER.includes(AdizaBotInc.message.from.id.toString());
        if (!isOwner) {
            return AdizaBotInc.reply(`You are not authorized to use this command.\nPlease dm ${OWNER_NAME} for buy.`);
        }
        const text = AdizaBotInc.message.text.split(' ');
        if (text.length < 2) {
            return AdizaBotInc.reply("Please provide the user ID to add as premium user.\nUsage: `/addprem <user_id>`", { parse_mode: "Markdown" });
        }
        const newAdmin = text[1];
        if (premiumUsers.includes(newAdmin)) {
            return AdizaBotInc.reply("This user is already a premium user.");
        }
        try {
            premiumUsers.push(newAdmin);
            fs.writeFileSync(premium_file, JSON.stringify(premiumUsers, null, 2));
            AdizaBotInc.reply(`✅ User ${newAdmin} added as admin.`);
        } catch (error) {
            console.error('Error adding user as premium:', error);
            AdizaBotInc.reply('Error adding user as premium.');
        }
    });

    bot.command('delprem', async (AdizaBotInc) => {
        const isOwner = global.DEVELOPER.includes(AdizaBotInc.message.from.id.toString());
        if (!isOwner) {
            return AdizaBotInc.reply(`You are not authorized to use this command.\nPlease dm ${OWNER_NAME} for buy.`);
        }
        const text = AdizaBotInc.message.text.split(' ');
        if (text.length < 2) {
            return AdizaBotInc.reply("Please provide the user ID to remove as premium user.\nUsage: `/delprem <user_id>`", { parse_mode: "Markdown" });
        }
        const adminToRemove = text[1];
        if (!premiumUsers.includes(adminToRemove)) {
            return AdizaBotInc.reply("This user is not a premium user.");
        }
        try {
            premiumUsers = premiumUsers.filter((id) => id !== adminToRemove);
            fs.writeFileSync(premium_file, JSON.stringify(premiumUsers, null, 2));
            AdizaBotInc.reply(`✅ User ${adminToRemove} removed from admins.`);
        } catch (error) {
            console.error('Error removing premium user:', error);
            AdizaBotInc.reply('Error removing premium user.');
        }
    });

    bot.command('broadcast', async (AdizaBotInc) => {
        const isOwner = global.DEVELOPER.includes(AdizaBotInc.from.id.toString());
        if (!isOwner) {
            return AdizaBotInc.reply(`You are not authorized to use this command.\nPlease dm ${OWNER_NAME} for buy.`);
        }

        const cmdParts = AdizaBotInc.message.text.split(' ');
        if (cmdParts.length < 2) {
            return AdizaBotInc.reply("Please provide a message to broadcast.\nUsage: `/broadcast <message>`", { parse_mode: 'Markdown' });
        }

        // Join all parts after the command to form the full broadcast message
        const broadcastMessage = cmdParts.slice(1).join(' ');
        const allRecipients = Array.from(new Set([...allTelegramUsers, ...premiumUsers])); // Combine all users and premium users, remove duplicates

        let successCount = 0;
        let failedCount = 0;

        for (const userId of allRecipients) {
            try {
                // Check if the user is reachable
                const chat = await AdizaBotInc.telegram.getChat(userId);
                if (chat) {
                    await AdizaBotInc.telegram.sendMessage(userId, broadcastMessage, { parse_mode: 'Markdown' });
                    successCount++;
                }
            } catch (err) {
                // console.error(`Failed to send broadcast to ${userId}:`, err.message); // Optional: log failed broadcasts
                failedCount++;
            }
        }

        AdizaBotInc.reply(`Broadcast completed.\n✅ Success: ${successCount}\n❌ Failed: ${failedCount}`);
    });

    bot.command('checkid', (AdizaBotInc) => {
        const sender = AdizaBotInc.from.username || "User";
        const text12 = `Hi @${sender} 👋

👤 From ${AdizaBotInc.from.id}
  └🙋🏽 You

Your ID Telegram : ${AdizaBotInc.from.id}
Your Full Name : @${sender}

🙏🏼 Excuse me, the bot will leave automatically.
Developer : @Matrixxxxxxxxx`;

        // Sending text messages without an interactive keyboard
        AdizaBotInc.reply(text12, { parse_mode: 'Markdown' });
    });


    bot.on('message', async (AdizaBotInc) => {
        // Delegate complex Telegram command handling to adiza.js
        // This is where commands like /listpair, /delpair, /pair, /runtime, /menu will be handled.
        require("./adiza")(AdizaBotInc, bot); // This line remains as per user's clarification

        const userId = AdizaBotInc.from.id; // Get the user's ID
        await saveTelegramUser(userId); // Save the user ID
    });

    bot.launch({
        dropPendingUpdates: true
    });

    bot.telegram.getMe().then((getme) => {
        console.table({
            "Bot Name": getme.first_name,
            "Username": "@" + getme.username,
            "ID": getme.id,
            "Link": `https://t.me/${getme.username}`,
            "Author": "https://t.me/Matrixxxxxxxxx"
        });
    });
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}


async function matrix() {
    await cleanupOldMessages();
    await loadAllPlugins();
    if (fs.existsSync(credsPath)) {
        await startMatrix();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            await startMatrix();
        } else {
            if (!fs.existsSync(credsPath)) {
                if (!global.SESSION_ID) {
                    console.log(color("Please wait for a few seconds to enter your number!", 'red'));
             await startMatrix();
                }
            }
        }
    }
}

const porDir = path.join(__dirname, 'Media');
const porPath = path.join(porDir, 'Adiza.html');

// get runtime
function getUptime() {
    return runtime(process.uptime());
}

app.get("/", (req, res) => {
    res.sendFile(porPath);
});

app.get("/uptime", (req, res) => {
    res.json({ uptime: getUptime() });
});

app.listen(port, (err) => {
    if (err) {
        console.error(color(`Failed to start server on port: ${port}`, 'red'));
    } else {
        console.log(color(`[ADIZATU] Running on port: ${port}`, 'white'));
    }
});

// Main execution block: Start both WhatsApp and Telegram bots
(async () => {
    try {
        console.log("Starting WhatsApp bot...");
        await matrix(); // This starts your main WhatsApp bot logic
        console.log("WhatsApp bot started! Starting Telegram bot...");
        await startAdiza(); // This starts the Telegram bot logic
        console.log("All bots launched successfully!");
    } catch (error) {
        console.error("Error during bot startup:", error.message);
        process.exit(1);
    }
})();


module.exports.pluginManager = pluginManager
