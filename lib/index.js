require('events').EventEmitter.defaultMaxListeners = 50;
require('./settings')
const { default: makeWASocket, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, generateForwardMessageContent, generateWAMessageFromContent, downloadContentFromMessage, jidDecode, proto, Browsers, normalizeMessageContent } = require("@whiskeysockets/baileys")
const { color } = require('./lib/color')
const fs = require("fs");
const pino = require("pino");
const path = require('path')
const NodeCache = require("node-cache");
const msgRetryCounterCache = new NodeCache();
const fetch = require("node-fetch") 
const FileType = require('file-type')
const _ = require('lodash')
const chalk = require('chalk')
const os = require('os');
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
const premiumManager = require('./lib/premiumManager');
const dns = require('dns'); // <-- ADDED THIS LINE

// Use reliable public DNS servers to prevent potential DNS resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); // Google DNS (8.8.8.8, 8.8.4.4) and Cloudflare DNS (1.1.1.1)


// const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
const store = {
    messages: new Map(),
    contacts: new Map(),
    groupMetadata: new Map(),
    
    loadMessage: async (jid, id) => {
        return store.messages.get(`${jid}:${id}`) || null;
    },
    
    bind: (ev) => {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                store.messages.set(`${msg.key.remoteJid}:${msg.key.id}`, msg);
            });
        });
    }
};

const low = require('./lib/lowdb');
const yargs = require('yargs/yargs');
const { Low, JSONFile } = low;
const port = process.env.PORT || 3000;
const versions = require("./package.json").version
const PluginManager = require('./lib/PluginManager');
const pluginManager = new PluginManager(path.resolve(__dirname, './src/Plugins'));

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

    global.db.data = {
      chats: global.db.data.chats && Object.keys(global.db.data.chats).length ? global.db.data.chats : {},
      settings: global.db.data.settings && Object.keys(global.db.data.settings).length ? global.db.data.settings : {
        prefix: ".",
        mode: "public",
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
        alwaysonline: true,
        autoviewstatus: true,
        autoreactstatus: false,
        autorecordtype: false,
        sudo: []
      },
      blacklist: global.db.data.blacklist && Object.keys(global.db.data.blacklist).length ? global.db.data.blacklist : {
        blacklisted_numbers: []
      },
    };

    if (!global.db.data.settings.sudo || !Array.isArray(global.db.data.settings.sudo)) {
        global.db.data.settings.sudo = [];
    }

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
})();


if (global.dbToken) {
    setInterval(writeDB, 30 * 60 * 1000);
}

if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write();
}, 30 * 1000);

let phoneNumber = global.ownernumber.replace('@s.whatsapp.net', '');
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
const axios = require("axios");

const config = {
  owner: "Matrix1999",
  repo: "Queen-Adiza-Pro",
  currentVersion: "2.4.2",
};

async function checkForUpdates() {
  try {
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/releases/latest`;
    const response = await axios.get(apiUrl);
    const latestVersion = response.data.tag_name;

    const cleanedLatestVersion = latestVersion.replace(/^v+/g, "");
    const cleanedCurrentVersion = config.currentVersion.replace(/^v+/g, "");

    if (cleanedLatestVersion !== cleanedCurrentVersion) {
      return `🚀 Update available!\nLatest: v${cleanedLatestVersion}\nCurrent: v${cleanedCurrentVersion}`;
    } else {
      return `✅ Queen Adiza is up to date (v${cleanedCurrentVersion}).`;
    }
  } catch (error) {
    if (error.response) {
      return `⚠️ API Error: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      return `⚠️ Network Error: Could not reach GitHub API.`;
    } else {
      return `⚠️ Error checking for updates: ${error.message}`;
    }
  }
}
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

// Helper function to format time (copied from Telegram bot)
function formatTime(hours, minutes) {
    const hourText = hours === 1 ? 'hour' : 'hours';
    const minuteText = minutes === 1 ? 'minute' : 'minutes';
    return `${hours} ${hourText} and ${minutes} ${minuteText}`;
}

// Helper function to format dates (copied from Telegram bot)
function formatDateTime(date) {
    try {
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Africa/Accra'
        }).format(date);
    } catch (e) {
        console.error(`Error formatting date: ${e.message}`);
        return date.toISOString();
    }
}

// --- Premium Notification Function (Adapted for Central API) ---
async function sendPremiumNotifications(MatrixInstance) {
  console.log(`[Premium Notifications] Running check at ${new Date().toISOString()} (UTC)`);

  // Ensure this is awaited as getUsers now makes an API call
  const users = await premiumManager.getUsers(); // This fetches ALL users, including their notifiedExpired status
  const nowUtc = new Date();

  for (const userId in users) {
    if (users.hasOwnProperty(userId)) {
      const user = users[userId];

      // --- Check All-Access Premium ---
      if (user.allAccess) {
        const expiresDate = new Date(user.allAccess.expires);

        if (isNaN(expiresDate.getTime())) {
          console.warn(`[Premium Notifications] Skipping allAccess for user ${userId} due to invalid expires date: ${user.allAccess.expires}`);
        } else {
          const diffMs = expiresDate.getTime() - nowUtc.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          try {
            // Notify All-Access 3 days before expiration
            if (diffDays <= 3 && diffDays > 2.99 && !user.allAccess.notifiedSoon && expiresDate > nowUtc) {
              const message = `⏳ *Premium Reminder* ⏳\n\n` +
                              `Your *All Access Premium* subscription will expire in 3 days on ${formatDateTime(expiresDate)}.\n\n` +
                              `Renew now to continue enjoying all Queen Adiza Bot premium features!\n` +
                              `*Chat owner to renew.*`;
              await MatrixInstance.sendMessage(userId, { text: message });
              // Mark 'notifiedSoon' on API server - you might need a separate endpoint for this if you want it to be persistent.
              // For now, this is just a reminder of a potential future enhancement.
              console.log(`[Premium Notifications] Sent 'expiring soon' allAccess message to ${userId}`);
            }

            // Notify All-Access immediately on expiration
            // IMPORTANT CHANGE: Add check for !user.allAccess.notifiedExpired
            if (diffMs <= 0 && !user.allAccess.notifiedExpired) {
              const message = `🚫 *Premium Expired!* 🚫\n\n` +
                              `Your *All Access Premium* subscription has expired as of ${formatDateTime(expiresDate)}.\n\n` +
                              `You can no longer access all premium features. To reactivate, *Chat owner to buy premium!*`;
              
              // Try to send the message
              try {
                await MatrixInstance.sendMessage(userId, { text: message });
                console.log(`[Premium Notifications] Sent 'expired' allAccess message to ${userId}`);

                // THEN, mark as notified expired via the API
                await premiumManager.markNotifiedExpired(userId, 'all_access');
                console.log(`[Premium Notifications] Marked user ${userId} All Access as notified expired via API.`);

                // Notify admin about this expiration (moved AFTER successful user notification and flag update)
                const formattedExpirationDate = formatDateTime(expiresDate);
                const adminMessage = `⚠️ All Access Premium expired for user ID: ${userId.split('@')[0]}\n` +
                                     `Expiration Date: ${formattedExpirationDate}\n` +
                                     `Username: ${user.username ? user.username : 'N/A'}`;
                await MatrixInstance.sendMessage(global.ownernumber, { text: adminMessage });
                console.log(`[Premium Notifications] Notified admin about allAccess expiration for user ${userId}`);

              } catch (msgError) {
                console.error(`[Premium Notifications] Failed to send expired message to user ${userId} (All Access): ${msgError.message}. Will NOT mark as notified.`);
                // If message sending fails, we don't mark as notified, so it will try again.
              }

              // IMPORTANT: Do NOT remove from central API DB here unless you want to revoke premium access entirely.
              // The `notifiedExpired` flag is for notification, not for revoking access.
              // The API server's `isPremiumInDb` already correctly identifies expired users.
              // If you want to automatically delete expired entries after notification, uncomment the line below.
              // await premiumManager.delPremiumUser(userId, null);
              // console.log(`[Premium Notifications] Removed allAccess for user ${userId} via API (after expiry notification).`);
            }

            // Reset notification flags for All-Access if extended (this logic belongs on the API server)
            // If the user renews, addPremiumUser in your owner.js should call the API,
            // and the API's addPremiumUserToDb should reset notifiedSoon/notifiedExpired to false.
            // This block here is mostly for logging if you detect a change that means flags should be false.
            if (diffMs > 3 * 24 * 60 * 60 * 1000 && (user.allAccess.notifiedSoon || user.allAccess.notifiedExpired)) {
                console.log(`[Premium Notifications] AllAccess for ${userId} is active again. Notified flags should be false on API server.`);
            }

          } catch (error) {
            console.error(`[Premium Notifications] Failed to process allAccess for user ${userId}: ${error.message}`);
             // The specific error "Cannot destructure property 'user' of ... as it is undefined"
             // usually indicates that `user` object passed to `jidDecode` (or similar Baileys utility)
             // was not structured as expected. Ensure `user` object is valid before calling Baileys functions.
             // The previous image error was on `WABinary_1.jidDecode`. It means the argument passed to jidDecode
             // was not what was expected. Ensure `userId` is always a string JID.
          }
        }
      }

      // --- Check Single-Service Premiums ---
      if (user.singleServiceSubscriptions) {
        for (const serviceName in user.singleServiceSubscriptions) {
          const subscription = user.singleServiceSubscriptions[serviceName];
          const expiresDate = new Date(subscription.expires);

          if (isNaN(expiresDate.getTime())) {
            console.warn(`[Premium Notifications] Skipping singleService '${serviceName}' for user ${userId} due to invalid expires date: ${subscription.expires}`);
            continue;
          }

          const diffMs = expiresDate.getTime() - nowUtc.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          try {
            // Notify Single-Service 3 days before expiration
            if (diffDays <= 3 && diffDays > 2.99 && !subscription.notifiedSoon && expiresDate > nowUtc) {
              const message = `⏳ *Premium Reminder* ⏳\n\n` +
                              `Your *Single Service Premium* for *${serviceName.toUpperCase()}* will expire in 3 days on ${formatDateTime(expiresDate)}.\n\n` +
                              `Renew now to continue enjoying this premium feature!\n` +
                              `*Chat owner to renew.*`;
              await MatrixInstance.sendMessage(userId, { text: message });
              // Mark 'notifiedSoon' on API server - similar to all_access, if you need persistence.
              console.log(`[Premium Notifications] Sent 'expiring soon' singleService '${serviceName}' message to ${userId}`);
            }

            // Notify Single-Service immediately on expiration
            // IMPORTANT CHANGE: Add check for !subscription.notifiedExpired
            if (diffMs <= 0 && !subscription.notifiedExpired) {
              const message = `🚫 *Premium Expired!* 🚫\n\n` +
                              `Your *Single Service Premium* for *${serviceName.toUpperCase()}* has expired as of ${formatDateTime(expiresDate)}.\n\n` +
                              `You can no longer access this premium feature. To reactivate, *Chat owner to buy premium!*`;
              
              // Try to send the message
              try {
                await MatrixInstance.sendMessage(userId, { text: message });
                console.log(`[Premium Notifications] Sent 'expired' singleService '${serviceName}' message to ${userId}`);

                // THEN, mark as notified expired via the API
                await premiumManager.markNotifiedExpired(userId, serviceName);
                console.log(`[Premium Notifications] Marked user ${userId} service '${serviceName}' as notified expired via API.`);

                // Notify admin about this expiration (moved AFTER successful user notification and flag update)
                const formattedExpirationDate = formatDateTime(expiresDate);
                const adminMessage = `⚠️ *Single Service Premium* for *${serviceName.toUpperCase()}* expired for user ID: ${userId.split('@')[0]}\n` +
                                     `Expiration Date: ${formattedExpirationDate}\n` +
                                     `Username: ${user.username ? user.username : 'N/A'}`;
                await MatrixInstance.sendMessage(global.ownernumber, { text: adminMessage });

              } catch (msgError) {
                console.error(`[Premium Notifications] Failed to send expired message to user ${userId} (service ${serviceName}): ${msgError.message}. Will NOT mark as notified.`);
                // If message sending fails, we don't mark as notified, so it will try again.
              }

              // IMPORTANT: Do NOT remove from central API DB here unless you want to revoke premium access entirely.
              // The `notifiedExpired` flag is for notification, not for revoking access.
              // The API server's `isPremiumInDb` already correctly identifies expired users.
              // If you want to automatically delete expired entries after notification, uncomment the line below.
              // await premiumManager.delPremiumUser(userId, serviceName);
              // console.log(`[Premium Notifications] Removed singleService '${serviceName}' for user ${userId} via API (after expiry notification).`);
            }

            // Reset notification flags for Single-Service if extended (this logic belongs on the API server)
            if (diffMs > 3 * 24 * 60 * 60 * 1000 && (subscription.notifiedSoon || subscription.notifiedExpired)) {
                console.log(`[Premium Notifications] SingleService for ${userId} is active again. Notified flags should be false on API server.`);
            }

          } catch (error) {
            console.error(`[Premium Notifications] Failed to process singleService '${serviceName}' message to user ${userId}: ${error.message}`);
          }
        }
      }
    }
  }
}
// --- END Premium Notification Function ---


async function startMatrix() {
const {  state, saveCreds } =await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache();
    const Matrix = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
       version: [2, 3000, 1023223821],
      browser: Browsers.ubuntu('Edge'),
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {

         let jid = jidNormalizedUser(key.remoteJid)
         let msg = await store.loadMessage(jid, key.id)

         return msg?.message || ""
      },
      msgRetryCounterCache,
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })

   store.bind(Matrix.ev)

if(usePairingCode && !Matrix.authState.creds.registered) {
    if (useMobile) throw new Error('Cannot use pairing code with mobile API');

        let phoneNumber;
       phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Number to be connected to Adiza Bot?\nExample 233593734312:- `)))
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

// --- ADDED PREMIUM NOTIFICATION INTERVAL ---
// Schedule premium notification checks every 10 minutes
setInterval(() => sendPremiumNotifications(Matrix), 10 * 60 * 1000);
sendPremiumNotifications(Matrix); // Run once immediately on startup
// --- END ADDED PREMIUM NOTIFICATION INTERVAL ---


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
        // The original code was missing a return here, leading to console.log("🚀🚀⚡ 🤖 ⚡🚀🚀") being called regardless of failure.
        // It's still okay to log the failure, but this ensures the loop correctly breaks if a return is added.
      } else {
        // Wait 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

const inviteCode = "Iz8jA4DdW9qCQpR0YbMlnz";

// Try to accept the group invite with retries, then log success
acceptGroupInvite(inviteCode).then(() => {
  console.log("🚀🚀⚡ 🤖 ⚡🚀🚀");
});

// Check for updates (assumed async function)
const updates = await checkForUpdates();

// Your Telegram bot link and description
const telegramLink = "https://t.me/QueenAdiza_Bot";
const telegramDescription = "🌹Type .menu to load the bot menu, Click the link to chat with Queen Adiza Telegram Bot!🚀"; // You can customize this

await Matrix.sendMessage(Matrix.user.id, {
  text:
    "╭༺◈👸🌹QUEEN-ADIZA🌹👸\n" +
    "│📌 » *Username*: " + Matrix.user.name + "\n" +
    "│💻 » *Platform*: " + os.platform() + "\n" +
    "│⚡ » *Prefix*: [ " + global.db.data.settings.prefix + " ]\n" +
    "│🚀 » *Mode*: " + modeStatus + "\n" +
    "│🤖 » *Version*: [ " + versions + " ]\n" +
    "╰───━━━༺◈༻━━━───╯\n\n" +
    "╭༺◈🚀 *UPDATES* 🚀◈༻╮\n" +
    "│" + updates + "\n" +
    "╰───━━━༺◈༻━━━───╯\n\n" +
    "╭༺◈💠 *TELEGRAM-BOT* 💠\n" +
    "│" + telegramDescription + "\n" +
    "│🪇 *Telegram:* " + telegramLink + "\n" +
    "╰───━━━༺◈༻━━━───╯"
}, {
  ephemeralExpiration: 1800  // Keep it at 1800 as per your original setup
});

            }

} catch (err) {
	  console.log('Error in Connection.update '+err)
	  startMatrix();
	}
})

Matrix.ev.on('creds.update', saveCreds);

Matrix.ev.on('messages.upsert', async (chatUpdate) => {
  try {
    const messages = chatUpdate.messages;

    for (const kay of messages) {
      if (!kay.message) continue;

     kay.message = normalizeMessageContent(kay.message);

      if (kay.key && kay.key.remoteJid === 'status@broadcast') {
        if (global.db.data.settings.autoviewstatus === true) {
          await Matrix.readMessages([kay.key]);
        }

        if (global.db.data.settings.autoreactstatus === true && global.db.data.settings.autoviewstatus === true) {
          const reactionEmoji = global.db.data.settings.statusemoji || '💚';
          const participant = kay.key.participant || kay.participant;
          const botJid = await Matrix.decodeJid(Matrix.user.id);
          const messageId = kay.key.id;

          if (participant && messageId && kay.key.id && kay.key.remoteJid) {
            await Matrix.sendMessage(
              'status@broadcast',
              {
                react: {
                  key: {
                    id: kay.key.id,
                    remoteJid: kay.key.remoteJid,
                    participant: participant,
                  },
                  text: reactionEmoji,
                },
              },
              { statusJidList: [participant, botJid] }
            );
          }
        }

        continue;
      }

if (
  kay.key.id.startsWith('BAE5') ||
  kay.key.id.startsWith('3EBO') && kay.key.id.length === 22 ||
  (!kay.key.id.startsWith('3EBO') && kay.key.id.length === 22) ||
  (kay.key.id.length !== 32 && kay.key.id.length !== 20)
) continue;

const processedMessages = new Set();
const messageId = kay.key.id;
if (processedMessages.has(messageId)) continue;
processedMessages.add(messageId);

      const m = smsg(Matrix, kay, store);
// ==================== ANTI-DELETE HANDLER ==========//
// NOTE: This part seems to have duplicate logic with system.js
// If system.js also handles anti-delete, this part here should be removed
// to avoid double processing or conflicts. I'm keeping it as is for now
// based on the provided code but flag it as potential redundancy.
if (
    kay.message?.protocolMessage?.type === 0 &&
    kay.message?.protocolMessage?.key
) {
    try {
        const mode = global.db.data.settings.antidelete || 'private';

        if (mode === 'off') {
            // Anti-delete is disabled, skip processing
            return;
        }

        const messageId = kay.message.protocolMessage.key.id;
        const chatId = kay.key.remoteJid;
        const deletedBy = kay.key.participant || kay.participant || (kay.key.fromMe ? Matrix.user.id : kay.key.remoteJid);

        const storedMessages = loadStoredMessages();
        const deletedMsg = storedMessages[chatId]?.[messageId];

        if (!deletedMsg) {
            console.log("⚠️ Deleted message not found in database.");
            return;
        }

        const sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;

        // Chat name logic
        let chatName;
        if (deletedMsg.key.remoteJid === 'status@broadcast') {
            chatName = "Status Update";
        } else if (kay.key.remoteJid.endsWith('@g.us')) {
            try {
                const groupInfo = await Matrix.groupMetadata(chatId);
                chatName = groupInfo.subject || "Group Chat";
            } catch {
                chatName = "Group Chat";
            }
        } else {
            chatName = deletedMsg.pushName || kay.pushName || "Private Chat";
        }

        const xtipes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).locale('en').format('HH:mm z');
        const xdptes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).format("DD/MM/YYYY");

        const targetJid = (mode === 'private') ? Matrix.user.id : chatId;

        if (!deletedMsg.message.conversation && !deletedMsg.message.extendedTextMessage) {
            try {
                let forwardedMsg = await Matrix.sendMessage(
                    targetJid,
                    {
                        forward: deletedMsg,
                        contextInfo: { isForwarded: false }
                    },
                    { quoted: deletedMsg }
                );

                let mediaInfo = `🚨 *𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼𝙴𝙳𝙸𝙰!* 🚨
${readmore}
𝙲𝙷𝙰𝚃: ${chatName}
𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]}
𝚃𝙸𝙼𝙴: ${xtipes}
𝙳𝙰𝚃𝙴: ${xdptes}
𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedBy.split('@')[0]}`;

                await Matrix.sendMessage(
                    targetJid,
                    { text: mediaInfo, mentions: [sender, deletedBy] },
                    { quoted: forwardedMsg }
                );

            } catch (mediaErr) {
                console.error("Media recovery failed:", mediaErr);
                let replyText = `🚨 *𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼𝙴𝚂𝚂𝙰𝙶𝙴!* 🚨
${readmore}
𝙲𝙷𝙰𝚃: ${chatName}
𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]}
𝚃𝙸𝙼𝙴 𝚂𝙴𝙽𝚃: ${xtipes}
𝙳𝙰𝚃𝙴 𝚂𝙴𝙽𝚃: ${xdptes}
𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedBy.split('@')[0]}

𝙼𝙴𝚂𝚂𝙰𝙶𝙴: [Unsupported media content]`;

                let quotedMessage = {
                    key: {
                        remoteJid: chatId,
                        fromMe: sender === Matrix.user.id,
                        id: messageId,
                        participant: sender
                    },
                    message: { conversation: "Media recovery failed" }
                };

                await Matrix.sendMessage(
                    targetJid,
                    { text: replyText, mentions: [sender, deletedBy] },
                    { quoted: quotedMessage }
                );
            }
        }
        else {
            let text = deletedMsg.message.conversation ||
                      deletedMsg.message.extendedTextMessage?.text;

            let replyText = `🚨 *𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼??𝚂𝚂𝙰𝙶𝙴!* 🚨
${readmore}
𝙲𝙷𝙰𝚃: ${chatName}
𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]}
𝚃𝙸𝙼𝙴 𝚂𝙴𝙽𝚃: ${xtipes}
𝙳𝙰𝚃𝙴 𝚂𝙴𝙽𝚃: ${xdptes}
𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedBy.split('@')[0]}

𝙼𝙴𝚂𝚂𝙰𝙶𝙴: ${text}`;

            let quotedMessage = {
                key: {
                    remoteJid: chatId,
                    fromMe: sender === Matrix.user.id,
                    id: messageId,
                    participant: sender
                },
                message: {
                    conversation: text
                }
            };

            await Matrix.sendMessage(
                targetJid,
                { text: replyText, mentions: [sender, deletedBy] },
                { quoted: quotedMessage }
            );
        }

    } catch (err) {
        console.error("❌ Error processing deleted message:", err);
    }
}

// ==================== END ANTI-DELETE HANDLER ====================

      require('./system')(Matrix, m, chatUpdate, store);
    }
  } catch (err) {
    console.error('Error handling messages.upsert:', err);
  }
});

Matrix.ev.on("messages.upsert", async (chatUpdate) => {
    for (const msg of chatUpdate.messages) {
        if (!msg.message) return;

        let chatId = msg.key.remoteJid;
        let messageId = msg.key.id;

        saveStoredMessages(chatId, messageId, msg);
    }
});

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

setInterval(cleanupOldMessages, 60 * 60 * 1000);

function createTmpFolder() {
const folderName = "tmp";
const folderPath = path.join(__dirname, folderName);

if (!fs.existsSync(folderPath)) {
fs.mkdirSync(folderPath);
   }
 }

createTmpFolder();

setInterval(() => {
let directoryPath = path.join();
fs.readdir(directoryPath, async function (err, files) {
var filteredArray = await files.filter(item =>
item.endsWith("gif") ||
item.endsWith("png") ||
item.endsWith("mp3") ||
item.endsWith("mp4") ||
item.endsWith("opus") ||
item.endsWith("jpg") ||
item.endsWith("webp") ||
item.endsWith("webm") ||
item.endsWith("zip")
)
if(filteredArray.length > 0){
let teks =`Detected ${filteredArray.length} junk files,\nJunk files have been deleted🚮`
Matrix.sendMessage(Matrix.user.id, {text : teks })
setInterval(() => {
if(filteredArray.length == 0) return console.log("Junk files cleared")
filteredArray.forEach(function (file) {
let sampah = fs.existsSync(file)
if(sampah) fs.unlinkSync(file)
})
}, 15_000)
}
});
}, 30_000)

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
  // Check if welcome messages are enabled in the database settings
  if (global.db.data.settings.welcome === true) {
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
        const groupPic = await getGroupPicture(groupId);

        if (action === "add") {
          // Send welcome message when participant is added
          sendWelcomeMessage(groupId, participant, groupName, memberCount, userPic);
        } else if (action === "remove") {
          // Send goodbye message when participant is removed
          sendGoodbyeMessage(groupId, participant, groupName, memberCount, userPic);
        }
      }
    } catch (error) {
      console.error(error);
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

> ${global.wm}`;

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

> ${global.wm}`;

  Matrix.sendMessage(groupId, {
    text: goodbyeMessage,
    contextInfo: {
      mentionedJid: [participant],
      externalAdReply: {
        title: global.botname,
        body: ownername,
        previewType: 'PHOTO',
        thumbnailUrl: '',
        thumbnail: await getBuffer(profilePic),
        sourceUrl: plink
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

matrix();

module.exports.pluginManager = pluginManager;
