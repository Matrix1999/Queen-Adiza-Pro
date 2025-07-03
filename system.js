global.AdizaIndex = 0; // Consider if this is still needed or used
require('./settings')
const {
  generateWAMessageFromContent,
  proto,
  downloadContentFromMessage,
} = require("@whiskeysockets/baileys");
const { pluginManager } = require('./index');
const { xeon_antispam } = require('./lib/antispam.js'); // Not used in this snippet
const { exec, spawn, execSync } = require("child_process")
const spamTracker = new Map(); // Not used in this snippet
const { jidNormalizedUser } = require('@whiskeysockets/baileys');
const AdmZip = require('adm-zip'); // Not used in this snippet
let chatHistory = {};
const { jidDecode } = require("@whiskeysockets/baileys");
const { calculateExpiry, isPremium, checkCommandAccess } = require('./lib/premiumSystem');
const callCounts = {};
const handledCallIds = new Set();
const util = require('util')
const fetch = require('node-fetch') // Not used in this snippet
const path = require('path')
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai'); // Not used in this snippet
const mime = require('mime-types'); // Not used in this snippet
const { fromBuffer } = require('file-type'); // Not used in this snippet
const fs = require('fs');
const axios = require('axios')
const acrcloud = require ('acrcloud');
const FormData = require('form-data');
const cheerio = require('cheerio')
const process = require('process');
const moment = require("moment-timezone")
const lolcatjs = require('lolcatjs')
const os = require('os');
const speed = require('performance-now')
const { performance } = require('perf_hooks');
const yts = require("yt-search") // Not used in this snippet
const jsobfus = require("javascript-obfuscator");
const {
  color
} = require("./lib/color");
const { commandEmojis, messageEmojis } = require("./lib/emojis");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);
const timestampp = speed();
const latensi = speed() - timestampp
const devMatrix = '233593734312';
const mainOwner = "233593734312@s.whatsapp.net";

const statusReactionCooldowns = new Map();
const STATUS_REACTION_COOLDOWN_MS = 10 * 1000;

const generalReactionCooldowns = new Map();
const GENERAL_REACTION_COOLDOWN_MS = 10 * 1000;

// Global map for chatbot to prevent duplicate replies
const lastProcessedMessageId = new Map();
const chatbotCooldowns = new Map(); // New map for chatbot rate limiting
const CHATBOT_COOLDOWN_MS = 5 * 1000; // 5 seconds cooldown per user for chatbot

const {
    smsg,
    formatDate,
    getTime,
    getGroupAdmins,
    formatp,
    await: awaitFunc, // Renamed to avoid conflict with `await` keyword
    sleep,
    isUrl,
    runtime,
    clockString,
    msToDate,
    sort,
    toNumber,
    enumGetKey,
    fetchJson,
    getBuffer,
    json,
    format,
    logic,
    generateProfilePicture,
    parseMention,
    getRandom,
    fetchBuffer,
    buffergif,
    GIFBufferToVideoBuffer,
    totalcase,
    bytesToSize,
    checkBandwidth,
} = require('./lib/myfunc')

//delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//error handling
const errorLog = new Map();
const ERROR_EXPIRY_TIME = 60000; // 60 seconds

const recordError = (error) => {
  const now = Date.now();
  errorLog.set(error, now);
  setTimeout(() => errorLog.delete(error), ERROR_EXPIRY_TIME);
};

const shouldLogError = (error) => {
  const now = Date.now();
  if (errorLog.has(error)) {
    const lastLoggedTime = errorLog.get(error);
    if (now - lastLoggedTime < ERROR_EXPIRY_TIME) {
      return false;
    }
  }
  return true;
};

// ==================================


//Images
const matrix1 = fs.readFileSync("./Media/Images/Adiza1.jpg");
const matrix2 = fs.readFileSync("./Media/Images/Adiza2.jpg");
const matrix3 = fs.readFileSync("./Media/Images/Adiza3.jpg");
const matrix4 = fs.readFileSync("./Media/Images/Adiza4.jpg");
const matrix5 = fs.readFileSync("./Media/Images/Adiza5.jpg");
const matrix6 = fs.readFileSync("./Media/Images/Adiza6.jpg");
const matrix7 = fs.readFileSync("./Media/Images/Adiza7.jpg");
const matrix8 = fs.readFileSync("./Media/Images/Adiza8.jpg");
const matrix9 = fs.readFileSync("./Media/Images/Adiza9.jpg");
const matrix10 = fs.readFileSync("./Media/Images/Adiza10.jpg");
const matrix11 = fs.readFileSync("./Media/Images/Adiza11.jpg");
const matrix12 = fs.readFileSync("./Media/Images/Adiza12.jpg");
const matrix13 = fs.readFileSync("./Media/Images/Adiza13.jpg");
const matrix14 = fs.readFileSync("./Media/Images/Adiza14.jpg");

//Version
const versions = require("./package.json").version;
global.dlkey = '_0x5aff35,_0x1876stqr'; // Made global for consistent access

//badwords
const bad = JSON.parse(fs.readFileSync("./src/badwords.json"));

//Shazam
const acr = new acrcloud({
    host: 'identify-eu-west-1.acrcloud.com',
    access_key: '882a7ef12dc0dc408f70a2f3f4724340',
    access_secret: 'qVvKAxknV7bUdtxjXS22b5ssvWYxpnVndhy2isXP'
});


function safeDecodeJid(jid) {
  if (!jid || typeof jid !== "string") return jid;
  try {
    const decoded = jidDecode(jid);
    if (decoded && decoded.user && decoded.server) {
      return `${decoded.user}@${decoded.server}`;
    }
    return jid;
  } catch (e) {
    console.error("Error decoding jid:", jid, e);
    return jid;
  }
}

// Ensure database has default structure if missing
global.db.data ??= {};
global.db.data.chats ??= {};
global.db.data.settings ??= {
  prefix: ".", // This will be the GLOBAL_FALLBACK_PREFIX if no user has custom
  mode: "public",
  autobio: false,
  anticall: false,
  autotype: false,
  autoread: false,
  welcome: false,
  adizachat: false,
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
};
global.db.data.blacklist ??= { blacklisted_numbers: [] };
// global.db.data.users ??= {}; // This is initialized in index.js loadDatabase now

// Optional: save any new defaults to disk
global.db.write();


module.exports = Matrix = async (Matrix, m, chatUpdate, store) => {
try {
const { type, quotedMsg, mentioned, now, fromMe } = m;


if (!Matrix.user || !Matrix.user.id) {
    console.log("DEBUG: Matrix.user or Matrix.user.id not available yet. Skipping message processing.");
    return; // Exit if bot user info isn't ready
}


// Get the JID of the current bot instance
// --- IMPORTANT FIX: NORMALIZE botJid HERE TO REMOVE DEVICE ID (:XX) ---
const botJid = jidNormalizedUser(Matrix.user.id); // Use jidNormalizedUser to ensure consistent JID format

// --- START MODIFICATION FOR BOT INSTANCE SETTINGS

const BOT_FALLBACK_PREFIX = '.';
const BOT_FALLBACK_MODE = "public"; // Default mode for any bot instance not specifically configured.


if (!global.db.data.users[botJid]) {
    global.db.data.users[botJid] = {};
    global.db.data.users[botJid].prefix ??= BOT_FALLBACK_PREFIX;
    global.db.data.users[botJid].mode ??= BOT_FALLBACK_MODE;
    global.db.data.users[botJid].autobio ??= false;
    global.db.data.users[botJid].autotype ??= false;
    global.db.data.users[botJid].anticall ??= "off";
    global.db.data.users[botJid].autoread ??= false;
    global.db.data.users[botJid].adizachat ??= false;
    global.db.data.users[botJid].statusemoji ??= "🧡";
    global.db.data.users[botJid].welcome ??= false;
    global.db.data.users[botJid].autoreact ??= false;
    global.db.data.users[botJid].antidelete ??= "private";
    global.db.data.users[botJid].antiedit ??= "private";
    global.db.data.users[botJid].alwaysonline ??= false;
    global.db.data.users[botJid].autorecord ??= false;
    global.db.data.users[botJid].autoviewstatus ??= false;
    global.db.data.users[botJid].autoreactstatus ??= false;
    global.db.data.users[botJid].menustyle ??= "2"; // Default menu style
}

const botInstanceSettings = global.db.data.users[botJid];
const prefix = botInstanceSettings.prefix;
const mode = botInstanceSettings.mode;

// --- END MODIFICATION FOR BOT INSTANCE



var body =
  m.message?.protocolMessage?.editedMessage?.conversation ||
  m.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
  m.message?.protocolMessage?.editedMessage?.imageMessage?.caption ||
  m.message?.protocolMessage?.editedMessage?.videoMessage?.caption ||
  m.message?.conversation ||
  m.message?.imageMessage?.caption ||
  m.message?.videoMessage?.caption ||
  m.message?.extendedTextMessage?.text ||
  m.message?.buttonsResponseMessage?.selectedButtonId ||
  m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
  m.message?.templateButtonReplyMessage?.selectedId ||
  m.message?.pollCreationMessageV3?.name ||
  m.message?.documentMessage?.caption ||
  m.text || "";

var budy =
  typeof body === "string" && body.length > 0
    ? body
    : typeof m.text === "string"
      ? m.text
      : "";


const isCmd = body.startsWith(prefix);
const trimmedBody = isCmd ? body.slice(prefix.length).trimStart() : "";

//command
const command = isCmd && trimmedBody ? trimmedBody.split(/\s+/).shift().toLowerCase() : "";


m.isCmd = isCmd; // Attach isCmd to the m object
m.command = command; // Attach command to the m object
// ************************

const args = trimmedBody.split(/\s+/).slice(1);
const text = args.join(" ");
const q = text;
const full_args = body.replace(command, '').slice(1).trim();
const pushname = m.pushName || "No Name";

// Using botJid directly instead of redeclaring botNumber
// --- IMPORTANT FIX: botNumber should now be the normalized JID from botJid ---
const botNumber = botJid; // Already determined as Matrix.user.id and now normalized

const sender = m.sender;
const senderNumber = sender.split('@')[0];
const sudoList = Array.isArray(global.db.data.settings.sudo) ? global.db.data.settings.sudo : [];

const allCreatorJids = new Set([
  // Normalize devMatrix if it's just a number
  devMatrix.includes('@s.whatsapp.net') ? devMatrix : `${devMatrix}@s.whatsapp.net`,
  // Normalize global.ownernumber if it's just a number
  global.ownernumber.includes('@s.whatsapp.net') ? global.ownernumber : `${global.ownernumber}@s.whatsapp.net`,

  ...sudoList.map(jid => jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`)
]);

const isCreator = allCreatorJids.has(sender);
const itsMe = sender === botNumber;
const from = m.key.remoteJid;
const quotedMessage = m.quoted || m;
const quoted =
  quotedMessage?.mtype === "buttonsMessage"
    ? quotedMessage[Object.keys(quotedMessage)[1]]
    : quotedMessage?.mtype === "templateMessage" && quotedMessage.hydratedTemplate
    ? quotedMessage.hydratedTemplate[Object.keys(quotedMessage.hydratedTemplate)[1]]
    : quotedMessage?.mtype === "product"
    ? quotedMessage[Object.keys(quotedMessage)[0]]
    : m.quoted || m; // Fallback for other quoted message types
const mime = quoted?.msg?.mimetype || quoted?.mimetype || "";


// Retrieve sender's premium status for access bypass
const isSenderPremium = isPremium(m.sender); // Assumes `isPremium` is imported at the top of system.js

// ======= Mode check: restrict commands based on user's mode =======
// `mode` is already defined at the top as the bot instance's mode
if (isCmd) {
  if (mode === "private" && !isCreator && !isSenderPremium) {
    // Private mode: only creator and premium users can run commands
    return await Matrix.sendMessage(from, {
      text: "⚠️ Your bot is currently in *private* mode. Only the owner and premium users can use commands."
    }, { quoted: m });
  }
  if (mode === "group" && !m.isGroup && !isCreator && !isSenderPremium) {
    // Group only mode: block commands outside groups for non-owner/non-premium
    return await Matrix.sendMessage(from, {
      text: "⚠️ Your bot is currently in *group only* mode. Commands work only in groups."
    }, { quoted: m });
  }
  if (mode === "pm" && m.isGroup && !isCreator && !isSenderPremium) {
    // PM only mode: block commands in groups for non-owner/non-premium
    return await Matrix.sendMessage(from, {
      text: "⚠️ Your bot is currently in *private chat only* mode. Commands work only in private chats."
    }, { quoted: m });
  }
  // Public mode: allow all commands (no explicit `return` here, so command proceeds)
}
// =======================================================

    // <----------------------------------------------------------------------------------------------------->
    // PLACE THE NEW STATUS HANDLING BLOCK HERE
    // <---------------------------------------------------------------------------------------------------->

    const botInstanceSettingsForStatus = global.db.data.users[botJid] || {}; // Reuse botJid
    const instanceAutoviewStatus = botInstanceSettingsForStatus.autoviewstatus ?? global.db.data.settings.autoviewstatus ?? true; // Default to true
    const instanceAutoreactStatus = botInstanceSettingsForStatus.autoreactstatus ?? global.db.data.settings.autoreactstatus ?? false; // Default to false
    const instanceStatusEmoji = botInstanceSettingsForStatus.statusemoji || global.db.data.settings.statusemoji || '🧡'; // Default to '🧡'

    if (m.key && m.key.remoteJid === 'status@broadcast') {


      if (instanceAutoviewStatus === true) {
        try { // <-- ADDED TRY BLOCK
          await Matrix.readMessages([m.key]);
          console.log(`[STATUS DEBUG] Successfully attempted to read status for ${m.key.remoteJid} by ${botJid}`); // <-- SUCCESS LOG
        } catch (readErr) { // <-- ADDED CATCH BLOCK
          console.error(`[STATUS ERROR] Failed to read status for ${m.key.remoteJid} by ${botJid}:`, readErr); // <-- ERROR LOG
        }
      }

      if (instanceAutoreactStatus === true && instanceAutoviewStatus === true) {
        // --- START COOLDOWN LOGIC FOR REACTIONS ---
        const lastReactionTime = statusReactionCooldowns.get(botJid);
        const now = Date.now();

        if (lastReactionTime && (now - lastReactionTime < STATUS_REACTION_COOLDOWN_MS)) {
          console.log(`[STATUS DEBUG] Skipped reaction for ${botJid} due to cooldown.`);
          // Skip reacting if cooldown is active
        } else {
          // Cooldown passed or no previous reaction, proceed to react
          const reactionEmoji = instanceStatusEmoji;
          const participant = m.key.participant || m.participant;
          const messageId = m.key.id;

          if (participant && messageId && m.key.id && m.key.remoteJid) {
            try { // <-- ADDED TRY BLOCK FOR SEND MESSAGE
              await Matrix.sendMessage(
                'status@broadcast',
                {
                  react: {
                    key: {
                      id: m.key.id,
                      remoteJid: m.key.remoteJid,
                      participant: participant,
                    },
                    text: reactionEmoji,
                  },
                },
                { statusJidList: [participant, botJid] }
              );
              statusReactionCooldowns.set(botJid, now); // Update last reaction time for this bot
              console.log(`[STATUS DEBUG] Successfully sent reaction '${reactionEmoji}' for status by ${botJid}`); // <-- SUCCESS LOG FOR REACTION
            } catch (reactErr) { // <-- ADDED CATCH BLOCK FOR SEND MESSAGE
              console.error(`[STATUS ERROR] Failed to send reaction for status by ${botJid}:`, reactErr); // <-- ERROR LOG FOR REACTION
            }
          }
        }

      }
      console.log(`-----------------------------------\n`); // Move end debug log here to cover entire status block
      return; // Exit here if it's a status message
    }
    // <---------------------------------------------------------------------------------------------------------------->

/// ========================GROUP METADATA===========================//

const groupMetadata = m.isGroup
  ? await Matrix.groupMetadata(m.chat).catch((e) => {
      console.error('Error fetching group metadata:', e); // Kept for actual errors
      return null; // Return null if an error occurs
    })
  : null;

// Ensure groupMetadata is not null before accessing its properties
const groupName = m.isGroup && groupMetadata ? groupMetadata.subject : "";
const participants = m.isGroup && groupMetadata ? groupMetadata.participants : [];

const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : [];

// --- UPDATED LOGIC FOR ISGROUPADMINS (More robust JID comparison) ---
const normalizedSender = jidNormalizedUser(m.sender).trim();
const normalizedGroupAdmins = groupAdmins.map(jid => jidNormalizedUser(jid).trim());
const isGroupAdmins = m.isGroup ? normalizedGroupAdmins.includes(normalizedSender) : false;
const isBotAdmins = m.isGroup ? normalizedGroupAdmins.includes(jidNormalizedUser(botNumber).trim()) : false;
const isBot = botNumber.includes(senderNumber);
const isAdmins = isGroupAdmins;

const normalizedGroupOwner = m.isGroup && groupMetadata?.owner ? jidNormalizedUser(groupMetadata.owner).trim() : '';
const isGroupOwner = m.isGroup && normalizedGroupOwner === normalizedSender;
// --- END GROUP METADATA LOGIC ---

// ================================================================ //

// *** START NEW INITIALIZATION CODE INSERTION ***
// This prevents 'Cannot read properties of undefined (reading 'antibot')' errors

if (m.isGroup && !global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {
        antibot: false, // Default antibot to false for new groups
        welcome: false, // Example: Add other default group settings here if your bot uses them
        // Add any other group-specific settings your bot uses and wants defaults for
    };
}

// =====================  ANTIBOT HANDLER ======================//

if (m.isGroup && global.db.data.chats[m.chat].antibot) {
  const isGeneralPrefixedCommand = budy && budy.length > 0 &&
                                   !/\s/.test(budy.charAt(0)) &&
                                   !/[a-zA-Z0-9]/.test(budy.charAt(0));


  if (isGeneralPrefixedCommand && !m.key.fromMe) {
    console.log(`[ANTIBOT] Conditions met! Silently ignoring ANY bot/user command (except my own bot) from: ${m.sender} - "${budy}"`);
    return; // Stop all further processing for this message
  }
}

// ================= END ANTIBOT BLOCK =============================//


//================== [ FUNCTION ] ==================//
async function setHerokuEnvVar(varName, varValue) {
  const apiKey = process.env.HEROKU_API_KEY;
  const appName = process.env.HEROKU_APP_NAME;

  try {
    const response = await axios.patch(`https://api.heroku.com/apps/${appName}/config-vars`, {
      [varName]: varValue
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error setting env var:', error);
    throw new Error(`Failed to set environment variable, please make sure you've entered heroku api key and app name correctly.`);
  }
}

async function getHerokuEnvVars() {
  const apiKey = process.env.HEROKU_API_KEY;
  const appName = process.env.HEROKU_APP_NAME;

  try {
    const response = await axios.get(`https://api.heroku.com/apps/${appName}/config-vars`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting env vars:', error);
    throw new Error('Failed to get environment variables');
  }
}

async function deleteHerokuEnvVar(varName) {
  const apiKey = process.env.HEROKU_API_KEY;
  const appName = process.env.HEROKU_APP_NAME;

  try {
    const response = await axios.patch(`https://api.heroku.com/apps/${appName}/config-vars`, {
      [varName]: null
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting env var:', error);
    throw new Error(`Failed to set environment variable, please make sure you've entered heroku api key and app name correctly`);
  }
}


// Function to fetch MP3 download URL
async function fetchMp3DownloadUrl(link) {
  const fetchDownloadUrl1 = async (videoUrl) => {
    const apiUrl = `https://api.giftedtech.my.id/api/download/dlmp3?apikey=${global.dlkey}&url=${videoUrl}`; // Use global.dlkey
    try {
      const response = await axios.get(apiUrl);
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Failed to fetch from GiftedTech API');
      }
      return response.data.result.download_url;
    } catch (error) {
      console.error('Error with GiftedTech API:', error.message);
      throw error;
    }
  };

  const fetchDownloadUrl2 = async (videoUrl) => {
    const format = 'mp3';
    const url = `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(videoUrl)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (!response.data || !response.data.success) throw new Error('Failed to fetch from API2');

      const { id } = response.data;
      while (true) {
        const progress = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        if (progress.data && progress.data.success && progress.data.progress === 1000) {
          return progress.data.download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    catch (error) {
      console.error('Error with API2:', error.message);
      throw error;
    }
  };

  try {
    let downloadUrl;
    try {
      downloadUrl = await fetchDownloadUrl1(link);
    }
    catch (error) {
      console.log('Falling back to second API...');
      downloadUrl = await fetchDownloadUrl2(link);
    }
    return downloadUrl;
  }
  catch (error) {
    throw error;
  }
}

async function fetchVideoDownloadUrl(link) {
  if (!link) throw new Error('No video URL provided.');
  if (typeof global.dlkey === 'undefined') throw new Error('API key (dlkey) is not defined.'); // Use global.dlkey

  const primaryApiUrl = `https://api.giftedtech.my.id/api/download/dlmp4?apikey=${global.dlkey}&url=${encodeURIComponent(link)}`; // Use global.dlkey
  const fallbackApiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(link)}`;

  try {
    const primaryResponse = await axios.get(primaryApiUrl);
    if (primaryResponse.status === 200 && primaryResponse.data.success && primaryResponse.data.result) {
      const result = primaryResponse.data.result;
      return {
        download_url: result.url,
        title: result.title || 'video'
      };
    } else {
      throw new Error('Primary API failed');
    }
  } catch (primaryError) {
    console.warn('Primary API failed, trying fallback API:', primaryError.message);

    try {
      const fallbackResponse = await axios.get(fallbackApiUrl);
      if (
        fallbackResponse.status === 200 &&
        fallbackResponse.data &&
        fallbackResponse.data.status &&
        fallbackResponse.data.data?.dl
      ) {
        const data = fallbackResponse.data.data;
        return {
          download_url: data.dl,
          title: data.title || 'video'
        };
      } else {
        throw new Error('Fallback API returned invalid format');
      }
    } catch (fallbackError) {
      console.error('Both APIs failed:', fallbackError.message);
      throw fallbackError;
    }
  }
}

//  SAVE STATUS WITH COMMAND
async function saveStatusMessage(m, saveToDM = false) {
  try {
    // Check for m.quoted FIRST, and if it's not a status, then return the usage message.
    if (!m.quoted) {
      return m.reply('*Please reply to a status message! E.g., reply to a status with ".save" to save in current chat or ".save dm" to save in ur dm, you can also use any emoji of your choice to reply to anyones status to save to your dm.*');
    }

    let messageToDownload = null;
    let messageType = null;


    let caption = "🌹Here's the status you saved!"; // Default caption
    if (m.quoted.message?.imageMessage) {
        messageToDownload = m.quoted.message.imageMessage;
        messageType = 'image';
        caption = m.quoted.message.imageMessage.caption || caption; // Use existing caption if present
    } else if (m.quoted.message?.videoMessage) {
        messageToDownload = m.quoted.message.videoMessage;
        messageType = 'video';
        caption = m.quoted.message.videoMessage.caption || caption; // Use existing caption if present
    }


    if (!messageToDownload || !messageType) {
      return m.reply('*The replied message is not a valid status (image or video). Please reply to a status message!*');
    }

    const targetJid = saveToDM ? Matrix.user.id : m.chat;

    const stream = await downloadContentFromMessage(
        messageToDownload,
        messageType
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    const messageOptions = saveToDM ? {} : { quoted: m };

    if (messageType === 'image') {
        await Matrix.sendMessage(targetJid, { image: buffer, caption: caption }, messageOptions);
    } else if (messageType === 'video') {
        await Matrix.sendMessage(targetJid, { video: buffer, caption: caption }, messageOptions);
    }

    // Send the reaction in the chat where the command was sent (for feedback)
    Matrix.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('Failed to save status message:', error);
    m.reply(`Error: ${error.message}`);
  }
}

// ========================== //
async function ephoto(url, texk) {
      let form = new FormData();
      let gT = await axios.get(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        },
      });
      let $ = cheerio.load(gT.data);
      let text = texk;
      let token = $("input[name=token]").val();
      let build_server = $("input[name=build_server]").val();
      let build_server_id = $("input[name=build_server_id]").val();
      form.append("text[]", text);
      form.append("token", token);
      form.append("build_server", build_server);
      form.append("build_server_id", build_server_id);
      let res = await axios({
        url: url,
        method: "POST",
        data: form,
        headers: {
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
          cookie: gT.headers["set-cookie"]?.join("; "),
          "Content-Type": "multipart/form-data",
        },
      });
      let $$ = cheerio.load(res.data);
      let json = JSON.parse($$("input[name=form_value_input]").val());
      json["text[]"] = json.text;
      delete json.text;
      let { data } = await axios.post(
        "https://en.ephoto360.com/effect/create-image",
        new URLSearchParams(json),
        {
          headers: {
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
            cookie: gT.headers["set-cookie"].join("; "),
          },
        }
      );
      return build_server + data.image;
 }

//obfuscator
async function obfus(query) {
      return new Promise((resolve, reject) => {
        try {
          const obfuscationResult = jsobfus.obfuscate(query, {
            compact: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1,
          });
          const result = {
            status: 200,
            author: `${ownername}`,
            result: obfuscationResult.getObfuscatedCode(),
          };
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }

const pickRandom = (arr) => {
return arr[Math.floor(Math.random() * arr.length)]
}

// TAKE  PP USER
let ppuser;
try {
    ppuser = await Matrix.profilePictureUrl(m.sender, 'image');
} catch (err) {
    ppuser = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg';
}
let ppUrl = ppuser; // Assigning ppUrl to be the same as ppuser now

//================== [ DATABASE ] ==================//
try {
  // Initialize group-specific chat settings if they don't exist
  if (from.endsWith('@g.us')) {
    let chats = global.db.data.chats[from];
    if (typeof chats !== "object") global.db.data.chats[from] = {};
    chats = global.db.data.chats[from];
    chats.antibot ??= false;
    chats.anticontact ??= false;
    chats.antiaudio ??= false;
    chats.antisticker ??= false;
    chats.antimedia ??= false;
    chats.antivirtex ??= false;
    chats.antivirus ??= false;
    chats.antivideo ??= false;
    chats.antispam ??= false;
    chats.antispam1 ??= false;
    chats.antiimage ??= false;
    chats.badword ??= false;
    chats.antilinkgc ??= false;
    chats.antilinkkick ??= false;
    chats.badwordkick ??= false;
    chats.antilinkgckick ??= false;
  }

  // Initialize global blacklist if it doesn't exist
  global.db.data.blacklist ??= { blacklisted_numbers: [] };


} catch (err) {
  console.error("Error during database initialization in system.js (this block):", err);
}
//================== [ END DATABASE ] ==================//

//================== [ CONSOLE LOG] ==================//
const timezones = global.db.data.settings.timezone || 'Africa/Accra'; // Assuming timezone is still global
const dayz = moment(Date.now()).tz(timezones).locale('en').format('dddd');
const timez = moment(Date.now()).tz(timezones).locale('en').format('HH:mm:ss z');
const datez = moment(Date.now()).tz(timezones).format('DD/MM/YYYY');

if (m.message) {
  lolcatjs.fromString(`┏━━━━━━━━━━━━━『 MATRIX-X 』━━━━━━━━━━━━━─`);
  lolcatjs.fromString(`» Sent Time: ${dayz}, ${timez}`);
  lolcatjs.fromString(`» Message Type: ${m.mtype}`);
  lolcatjs.fromString(`» Sender Name: ${pushname || 'N/A'}`);
  lolcatjs.fromString(`» Chat ID: ${m.chat.split('@')[0]}`);
  lolcatjs.fromString(`» Message: ${budy || 'N/A'}`);
 lolcatjs.fromString('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─ ⳹\n\n');
}
//<===========================================>//
//auto set bio\\
// Use per-bot-instance autobio setting under users
if (global.db.data.users[botJid]?.autobio) {

     let xdpy = moment(Date.now()).tz(`${timezones}`).locale('en').format('dddd');
     let xtipe = moment(Date.now()).tz(`${timezones}`).locale('en').format('HH:mm z');
     let xdpte = moment(Date.now()).tz(`${timezones}`).format("DD/MM/YYYY");

 Matrix.updateProfileStatus(
    `${xtipe}, ${xdpy}; ${xdpte}:- ${botname}`
  ).catch((_) => _);
}

//<================================================>//
    //auto type record (per bot instance)
if (global.db.data.users[botJid]?.autorecordtype) {
  if (m.message) {
    let XpBotmix = ["composing", "recording"];
    XpBotmix2 = XpBotmix[Math.floor(XpBotmix.length * Math.random())];
    Matrix.sendPresenceUpdate(XpBotmix2, from);
  }
}
if (global.db.data.users[botJid]?.autorecord) {
  if (m.message) {
    let XpBotmix = ["recording"];
    XpBotmix2 = XpBotmix[Math.floor(XpBotmix.length * Math.random())];
    Matrix.sendPresenceUpdate(XpBotmix2, from);
  }
}
if (global.db.data.users[botJid]?.autotype) {
  if (m.message) {
    let XpBotpos = ["composing"];
    Matrix.sendPresenceUpdate(XpBotpos, from);
  }
}

//<================================================>//
    // ANTIBOT



//<================================================>//

// ANTICONTACT
global.contactCounts = global.contactCounts || {};

// Check if it's a group chat and anticontact is enabled for that chat
if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.anticontact) {
  const msg = m.message || {};
  const chatId = m.chat;
  const senderId = m.sender;

  const ownerNumbers = Array.isArray(global.owner) ? global.owner : [global.owner];
  const senderNumber = senderId.split('@')[0];
  const isCreator = ownerNumbers.includes(senderNumber);

// --- Admin Check ---
// Get group metadata first
const groupMetadata = await Matrix.groupMetadata(m.chat).catch(e => {
    return null; // Return null if metadata fetch fails
});

let groupAdmins = [];
if (groupMetadata && groupMetadata.participants) {
    // Then pass the participants array to getGroupAdmins
    groupAdmins = await getGroupAdmins(groupMetadata.participants);
}

  const isAdmin = groupAdmins.includes(senderId);
  const isExempt = isAdmin || isCreator;

  // Check for formal contact messages
  const isContactMessage = msg.contactMessage || msg.contactsArrayMessage;

  let isRawPhoneNumber = false;
  if (m.text) {
    const text = m.text.replace(/\s+/g, '');
    // Regex to detect various phone number formats (international, local, Ghana's 233 prefix)
    const phoneNumberRegex = /(\+\d{7,15})|(0\d{9,10})|(233\d{9})|(\b\d{9,10}\b)/;
    isRawPhoneNumber = phoneNumberRegex.test(text);
  }

  const isPhoneNumberRelated = isContactMessage || isRawPhoneNumber;

  // Only proceed if it's a phone number related message AND the sender is NOT exempt
  if (isPhoneNumberRelated && !isExempt) {
    const currentTimestamp = m.messageTimestamp * 1000;
    global.contactCounts[senderId] = global.contactCounts[senderId] || { count: 0, lastTimestamp: 0 };

    const userData = global.contactCounts[senderId];

    if (currentTimestamp - userData.lastTimestamp <= 10000) { // Cooldown of 10 seconds
      userData.count++;
    } else {
      userData.count = 1; // Reset count if outside cooldown
    }
    userData.lastTimestamp = currentTimestamp;

    // Delete the message (always delete if it's a blocked type and not exempt)
    try {
      await Matrix.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      });
    } catch (deleteError) {
      console.error('[ERROR] Failed to delete message:', deleteError); // Kept for actual errors
    }

    // Logic for warnings and kicking
    if (userData.count <= 3) { // Warn for the 1st, 2nd, and 3rd offenses
      await Matrix.sendMessage(chatId, {
        text: `PHONE NUMBER BLOCKED (Attempt ${userData.count}/3 warnings)\n\n@` + senderId.split("@")[0] + " *Only admins and the bot creator are allowed to send contact numbers in this group!*",
        contextInfo: {
          mentionedJid: [senderId]
        }
      }, { quoted: m });
    } else if (userData.count >= 4) { // Kick on the 4th offense
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split('@')[0]} has been kicked for repeatedly sending contact numbers (${userData.count} offenses).`,
          contextInfo: {
            mentionedJid: [senderId]
          }
        });
        delete global.contactCounts[senderId]; // Reset count after kick
      } catch (kickError) {
        console.error("[ERROR] Error kicking user for phone number spam:", kickError); // Kept for actual errors
        await m.reply(`[ERROR] Failed to kick @${senderId.split('@')[0]}. Please check bot permissions. Error: ${kickError.message}`); // Inform group if kick fails
      }
    }
  }
}

//<================================================>//
const storeFile = "./src/store.json"; // Make sure this is defined at the top of system.js if not already.

function loadStoredMessages() { // Make sure this is defined at the top of system.js if not already.
    if (fs.existsSync(storeFile)) {
        return JSON.parse(fs.readFileSync(storeFile));
    }
    return {};
}

//*---------------------------------------------------------------*//

if (
    m.message?.protocolMessage?.type === 0 && // Check for deletion protocol message
    m.message?.protocolMessage?.key // Ensure there's a key for the deleted message
) {
    try {
        // FIX: Read antidelete mode from the individual bot instance settings
        // 'botInstanceSettings' is defined at the top of the Matrix function in system.js
        const instanceAntideleteMode = botInstanceSettings.antidelete ?? global.db.data.settings.antidelete ?? "private"; // Default to "private" if not set

        if (instanceAntideleteMode === 'off') {
            // Anti-delete is disabled for this bot instance, skip processing
            return;
        }

        const messageId = m.message.protocolMessage.key.id;
        const chatId = m.chat;
        const deletedBy = m.sender; // The JID of the person who deleted the message

        const storedMessages = loadStoredMessages(); // Load messages from store.json
        const deletedMsg = storedMessages[chatId]?.[messageId]; // Try to find the deleted message in the store

        if (!deletedMsg) {
            console.log("⚠️ Deleted message not found in database."); // Log if message wasn't stored or is too old
            return;
        }

        const sender = deletedMsg.key.participant || deletedMsg.key.remoteJid; // Original sender of the message

        // Determine chat name for the output message
        let chatName;
        if (deletedMsg.key.remoteJid === 'status@broadcast') {
            chatName = "Status Update";
        } else if (m.isGroup) { // Check if it's a group chat
            try {
                const groupInfo = await Matrix.groupMetadata(chatId);
                chatName = groupInfo.subject || "Group Chat";
            } catch {
                chatName = "Group Chat";
            }
        } else {
            chatName = deletedMsg.pushName || m.pushName || "Private Chat"; // Use pushName for private chats
        }

        // Format timestamps
        const xtipes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).locale('en').format('HH:mm z');
        const xdptes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).format("DD/MM/YYYY");

        // Decide where to send the recovered message: private chat or current chat
        const targetJid = (instanceAntideleteMode === 'private') ? Matrix.user.id : chatId; // This is the key change!

        // Handle deleted media messages
        if (!deletedMsg.message.conversation && !deletedMsg.message.extendedTextMessage) {
            try {
                // Forward the original deleted message to the target JID
                let forwardedMsg = await Matrix.sendMessage(
                    targetJid,
                    {
                        forward: deletedMsg,
                        contextInfo: { isForwarded: false } // Mark as not forwarded from source
                    },
                    { quoted: deletedMsg } // Quote the original (now forwarded) message
                );

                // Send a text summary about the deleted media
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
                    { quoted: forwardedMsg } // Quote the forwarded message
                );

            } catch (mediaErr) {
                console.error("Media recovery failed:", mediaErr); // Log error if media forwarding fails
                // Fallback text if media forwarding fails
                let replyText = `🚨 *𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼𝙴𝚂𝚂𝙰𝙶𝙴!* 🚨
${readmore}
𝙲𝙷𝙰𝚃: ${chatName}
𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]}
𝚃𝙸𝙼𝙴 𝚂𝙴𝙽𝚃: ${xtipes}
𝙳𝙰𝚃𝙴 𝚂𝙴𝙽𝚃: ${xdptes}
𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedBy.split('@')[0]}

𝙼𝙴𝚂𝚂𝙰𝙶𝙴: [Unsupported media content or media recovery failed]`;

                let quotedMessage = { // Create a fake quoted message for context
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
        // Handle deleted text messages
        else {
            let text = deletedMsg.message.conversation ||
                      deletedMsg.message.extendedTextMessage?.text;

            let replyText = `🚨 *𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼𝙴𝚂𝚂𝙰𝙶𝙴!* 🚨
${readmore}
𝙲𝙷𝙰𝚃: ${chatName}
𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]}
𝚃𝙸𝙼𝙴 𝚂𝙴𝙽𝚃: ${xtipes}
𝙳𝙰𝚃𝙴 𝚂𝙴𝙽𝚃: ${xdptes}
𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedBy.split('@')[0]}

𝙼𝙴𝚂𝚂𝙰𝙶𝙴: ${text}`;

            let quotedMessage = { // Create a fake quoted message for context
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
        console.error("❌ Error processing deleted message:", err); // Log any general error in the handler
    }
}
//<================================================>//

// ==================== ANTI-EDIT FEATURE ====================


const instanceAntieditMode = botInstanceSettings.antiedit ?? global.db.data.settings.antiedit ?? "private"; // Default to "private"

if (
  m.sender !== botNumber &&
  !m.id.startsWith("3EB0") && // These checks are fine, keep them.
  (instanceAntieditMode === "private" || instanceAntieditMode === "chat") && // FIX: Use individual setting here
  (
    m.message?.protocolMessage?.editedMessage?.conversation ||
    m.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text // Ensure edited content exists
  )
) {
  try {
    const editedMsgId = m.message.protocolMessage.key.id;
    const chatId = m.chat;
    const editor = m.sender;


    const storedMessages = loadStoredMessages(); // Ensure loadStoredMessages() is defined at the top of system.js
    const originalMsgObj = storedMessages[chatId]?.[editedMsgId];

    // Prepare details (fallbacks if message not found)
    let originalSender = editor;
    let originalText = '[Could not retrieve original message]';
    let timeSent = '-';
    let dateSent = '-';

    if (originalMsgObj) {
      originalSender = originalMsgObj.key.participant || originalMsgObj.key.remoteJid || editor;
      if (originalMsgObj.message?.conversation) originalText = originalMsgObj.message.conversation;
      else if (originalMsgObj.message?.extendedTextMessage?.text) originalText = originalMsgObj.message.extendedTextMessage.text;
      else originalText = "[Non-text message]";
      timeSent = moment(originalMsgObj.messageTimestamp * 1000).tz(timezones + "").locale("en").format("HH:mm z");
      dateSent = moment(originalMsgObj.messageTimestamp * 1000).tz(timezones + "").format("DD/MM/YYYY");
    }

    // Determine chat name for the output message (using m.isGroup for current chat context)
    let chatName;
    if (m.isGroup) {
      try {
        const groupInfo = await Matrix.groupMetadata(chatId);
        chatName = groupInfo.subject || "Group Chat";
      } catch {
        chatName = "Group Chat";
      }
    } else {
      chatName = m.pushName || "Private Chat"; // Use m.pushName for private chats
    }
    const chatType = chatId.endsWith("@g.us") ? "(Group Chat)" : "(Private Chat)"; // For fallback if chatName isn't robust

    const editedTo =
      m.message.protocolMessage?.editedMessage?.conversation ||
      m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text;

    const antiEditMsg =
      `🚨 *EDITED MESSAGE!* 🚨\n${readmore}` +
      `\nCHAT: ${chatName || chatType}` + // Use chatName if available, else chatType for display
      `\nSENT BY: @${originalSender.split("@")[0]}` +
      `\nSENT ON: ${timeSent}` +
      `\nDATE SENT: ${dateSent}` +
      `\nEDITED BY: @${editor.split("@")[0]}` +
      `\n\nORIGINAL MSG: ${originalText}` +
      `\n\nEDITED TO: ${editedTo}`;

    // Decide where to send the recovered message
    const targetJid = (instanceAntieditMode === 'private') ? Matrix.user.id : chatId;

    // === PRIVATE MODE: Send to yourself ===
    if (instanceAntieditMode === "private") { // FIX: Use individual setting here
      if (originalMsgObj) {
        const quotedObj = { // Create a quoted object for context
          key: originalMsgObj.key,
          message: {
            conversation: originalText
          }
        };
        await Matrix.sendMessage(Matrix.user.id, {
          text: antiEditMsg,
          mentions: [originalSender, editor]
        }, {
          quoted: quotedObj
        });
      } else { // Fallback if original message object is not found in store
        await Matrix.sendMessage(Matrix.user.id, {
          text: antiEditMsg,
          mentions: [originalSender, editor]
        });
      }
    }

    // === CHAT MODE: Send to the current chat (group or private) ===
    if (instanceAntieditMode === "chat") { // FIX: Use individual setting here
      if (originalMsgObj) {
        const quotedObj = { // Create a quoted object for context
          key: originalMsgObj.key,
          message: {
            conversation: originalText
          }
        };
        await Matrix.sendMessage(chatId, {
          text: antiEditMsg,
          mentions: [originalSender, editor]
        }, {
          quoted: quotedObj
        });
      } else { // Fallback if original message object is not found in store
        await Matrix.sendMessage(chatId, {
          text: antiEditMsg,
          mentions: [originalSender, editor]
        });
      }
    }

    // === OFF MODE: Do nothing === (handled by the initial if condition)

  } catch (err) {
    console.error("❌ Error processing edited message:", err);
  }
}


//<================================================>//
// ANTICALL HANDLER

Matrix.ev.on('call', async (callEvent) => {

  const mode = botInstanceSettings.anticall ?? global.db.data.settings.anticall ?? "off"; // Default to "off" if not found anywhere

  // If anticall is off or not set, do nothing
  if (!mode || mode === 'off') return;

  for (const call of callEvent) {
    // Only handle new incoming call offers
    if (call.status === 'offer' && !handledCallIds.has(call.id)) {
      handledCallIds.add(call.id);
      const callerJid = call.from;

      try {
        // Decline the call properly with Baileys rejectCall (callId, callerJid)
        await Matrix.rejectCall(call.id, callerJid);
        console.log(`[ANTICALL] Call from ${callerJid} rejected`);
      } catch (err) {
        console.error(`[ANTICALL] Failed to reject call ${call.id} from ${callerJid}:`, err);
      }

      if (mode === 'decline') {
        // Decline mode: just decline and warn once
        if (!callCounts[callerJid]) {
          callCounts[callerJid] = 1;
          await Matrix.sendMessage(callerJid, {
            text: '⚠️ Calls are not allowed and have been declined.'
          });
          console.log(`[ANTICALL] Warned (decline mode): ${callerJid}`);
        }
      } else if (mode === 'block') {
        // Block mode: warn on first call, block on second
        callCounts[callerJid] = (callCounts[callerJid] || 0) + 1;

        if (callCounts[callerJid] === 1) {
          await Matrix.sendMessage(callerJid, {
            text: '⚠️ Calls are not allowed. You will be blocked if you call again.'
          });
          console.log(`[ANTICALL] Warned (block mode): ${callerJid}`);
        } else if (callCounts[callerJid] === 2) {
          await Matrix.sendMessage(callerJid, {
            text: '⛔ You have been blocked for repeatedly calling Angel.'
          });
          try {
            await Matrix.updateBlockStatus(callerJid, 'block');
            console.log(`[ANTICALL] Blocked: ${callerJid}`);
          } catch (err) {
            console.error(`[ANTICALL] Failed to block ${callerJid}:`, err);
          }
        }
      }
    }
  }
});
//<================================================>//



global.mediaCounts = global.mediaCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antimedia) {
  const msg       = m.message || {};
  const chatId    = m.chat;
  const senderId  = m.sender;

  const hasMedia =
    msg.imageMessage    ||
    msg.videoMessage    ||
    msg.stickerMessage  ||
    msg.documentMessage ||
    msg.audioMessage    ||
    msg.contactMessage  ||
    msg.contactsArrayMessage ||
    msg.pollCreationMessage  ||
    msg.liveLocationMessage  ||
    msg.locationMessage      ||
    msg.gifPlayback;

  // Perform antimedia action ONLY IF:
  // 1. It contains any type of media (`hasMedia`)
  // 2. The sender is NOT a group admin (`!isGroupAdmins`)
  // 3. The sender is NOT the bot creator (`!isCreator`)
  // 4. The message is NOT from the bot itself (`!m.key.fromMe`)
  // 5. The bot IS an admin in the group (so it has permissions to delete/kick) (`isBotAdmins`)
  if (hasMedia && !isGroupAdmins && !isCreator && !m.key.fromMe && isBotAdmins) {
    const now = m.messageTimestamp * 1000;
    global.mediaCounts[senderId] = global.mediaCounts[senderId] || { count: 0, lastTimestamp: 0 };
    const userData = global.mediaCounts[senderId];

    if (now - userData.lastTimestamp <= 10000) { // Cooldown of 10 seconds
      userData.count++;
    } else {
      userData.count = 1; // Reset count if outside cooldown
    }
    userData.lastTimestamp = now;

    // Delete the media message
    await Matrix.sendMessage(chatId, {
      delete: {
        remoteJid: chatId,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    }).catch(e => {}); // No console log for deletion errors

    if (userData.count <= 3) { // Warn for the 1st, 2nd, and 3rd offenses
      // First, second, or third offense: warning
      await Matrix.sendMessage(chatId, {
        text: `🚫 MEDIA BLOCKED (Attempt ${userData.count}/3 warnings)\n\n@${senderId.split('@')[0]} *Only admins are allowed to send media in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m }).catch(e => {}); // No console log for warning errors
    } else if (userData.count >= 4) { // Kick on the 4th offense
      // Fourth or subsequent offense: kick
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split('@')[0]} has been removed for repeatedly sending media (${userData.count} offenses).`,
          contextInfo: { mentionedJid: [senderId] }
        });
        delete global.mediaCounts[senderId]; // Reset count after kick
      } catch (err) {
        // Inform the group if kicking fails
        await m.reply(`Failed to kick @${senderId.split('@')[0]}. Please check bot permissions. Error: ${err.message}`);
      }
    }
  }
}

//<================================================>//
global.antivirusCounts = global.antivirusCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antivirus) {
  const msg       = m.message || {};
  const chatId    = m.chat;
  const senderId  = m.sender;
  const isAdmin   = (await getGroupAdmins(chatId)).includes(senderId);

  // Extract file name from document or video
  const fileName = msg.documentMessage?.fileName || msg.videoMessage?.fileName || '';
  if (!fileName || isAdmin) return;

  // Suspicious extensions
  const exts = ['.exe', '.bat', '.dll', '.msi', '.scr', '.js'];
  if (!exts.some(ext => fileName.toLowerCase().endsWith(ext))) return;

  const now      = m.messageTimestamp * 1000;
  global.antivirusCounts[senderId] = global.antivirusCounts[senderId] || { count: 0, lastTimestamp: 0 };
  const userData = global.antivirusCounts[senderId];

  if (now - userData.lastTimestamp <= 10000) {
    userData.count++;
  } else {
    userData.count = 1;
  }
  userData.lastTimestamp = now;

  // Delete the offending message
  await Matrix.sendMessage(chatId, {
    delete: {
      remoteJid: chatId,
      fromMe: false,
      id: m.key.id,
      participant: m.key.participant
    }
  });

  if (userData.count === 1) {
    // First offense: warning
    await Matrix.sendMessage(chatId, {
      text: `⚠️ WARNING: @${senderId.split('@')[0]} sent a suspicious file.\n*Only admins may send these file types.*`,
      contextInfo: { mentionedJid: [senderId] }
    }, { quoted: m });
  } else {
    // Second offense: kick and notify
    try {
      await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
      await Matrix.sendMessage(chatId, {
        text: `🚫 @${senderId.split('@')[0]} was removed for sending harmful files.`,
        contextInfo: { mentionedJid: [senderId] }
      });
      delete global.antivirusCounts[senderId];
    } catch (err) {
      console.error('Error kicking user:', err);
    }
  }
}
//<================================================>//
global.videoCounts = global.videoCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antivideo) {
  const msg        = m.message || {};
  const chatId     = m.chat;
  const senderId   = m.sender;
  const isVideo    = msg.videoMessage;

  // Perform antivideo action ONLY IF:
  // 1. It is a video message (`isVideo`)
  // 2. The sender is NOT a group admin (`!isGroupAdmins`)
  // 3. The sender is NOT the bot creator (`!isCreator`)
  // 4. The message is NOT from the bot itself (`!m.key.fromMe`)
  // 5. The bot IS an admin in the group (so it has permissions to delete/kick) (`isBotAdmins`)
  if (isVideo && !isGroupAdmins && !isCreator && !m.key.fromMe && isBotAdmins) {
    const now       = m.messageTimestamp * 1000;
    global.videoCounts[senderId] = global.videoCounts[senderId] || { count: 0, lastTimestamp: 0 };
    const userData  = global.videoCounts[senderId];

    if (now - userData.lastTimestamp <= 10000) { // Cooldown of 10 seconds
      userData.count++;
    } else {
      userData.count = 1; // Reset count if outside cooldown
    }
    userData.lastTimestamp = now;

    // Delete the video
    await Matrix.sendMessage(chatId, {
      delete: {
        remoteJid: chatId,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    }).catch(e => {}); // No console log for deletion errors

    if (userData.count <= 3) { // Warn for the 1st, 2nd, and 3rd offenses
      // First, second, or third offense: warning
      await Matrix.sendMessage(chatId, {
        text: `🚫 VIDEO BLOCKED (Attempt ${userData.count}/3 warnings)\n\n@${senderId.split('@')[0]} *Only admins are allowed to send videos in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m }).catch(e => {}); // No console log for warning errors
    } else if (userData.count >= 4) { // Kick on the 4th offense
      // Fourth or subsequent offense: kick and announce
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split('@')[0]} has been removed for repeatedly sending videos (${userData.count} offenses).`,
          contextInfo: { mentionedJid: [senderId] }
        });
        delete global.videoCounts[senderId]; // Reset count after kick
      } catch (kickError) {
        // Inform the group if kicking fails
        await m.reply(`Failed to kick @${senderId.split('@')[0]}. Please check bot permissions. Error: ${kickError.message}`);
      }
    }
  }
}

//<================================================>//
global.audioCounts = global.audioCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antiaudio) {
  const msg       = m.message || {};
  const chatId    = m.chat;
  const senderId  = m.sender; // m.sender is the full JID
  const isAudio   = msg.audioMessage;


  if (isAudio && !isGroupAdmins && !isCreator && !m.key.fromMe && isBotAdmins) {
    const now      = m.messageTimestamp * 1000;
    global.audioCounts[senderId] = global.audioCounts[senderId] || { count: 0, lastTimestamp: 0 };
    const userData = global.audioCounts[senderId];

    if (now - userData.lastTimestamp <= 10000) { // Cooldown of 10 seconds
      userData.count++;
    } else {
      userData.count = 1; // Reset count if outside cooldown
    }
    userData.lastTimestamp = now;

    // Delete the audio
    await Matrix.sendMessage(chatId, {
      delete: {
        remoteJid: chatId,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    }).catch(e => console.error(`[ANTIAUDIO] Error deleting audio from ${senderId.split('@')[0]}:`, e)); // Error handling


    if (userData.count === 1) {
      // First offense: warning
      await Matrix.sendMessage(chatId, {
        text: `🚫 AUDIO BLOCKED\n\n@${senderId.split('@')[0]} *Only admins are allowed to send audios in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m }).catch(e => console.error(`[ANTIAUDIO] Error sending warning to ${senderId.split('@')[0]}:`, e)); // Error handling
    } else {
      // Second offense: kick and announce
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split('@')[0]} has been removed for repeatedly sending audios.`,
          contextInfo: { mentionedJid: [senderId] }
        });
        delete global.audioCounts[senderId];
      } catch (kickError) {
        console.error('[ANTIAUDIO] Error kicking user:', kickError); // Kept for actual errors
        // Reply to the group if kicking fails, useful for debugging bot permissions
        await m.reply(`[ANTIAUDIO] Failed to kick @${senderId.split('@')[0]}. Please check bot permissions. Error: ${kickError.message}`);
      }
    }
  }
}

//<================================================>//
global.imageCounts = global.imageCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antiimage) {
  const msg       = m.message || {};
  const chatId    = m.chat;
  const senderId  = m.sender;
  const isImage   = msg.imageMessage;


  if (isImage && !isGroupAdmins && !isCreator && !m.key.fromMe && isBotAdmins) {
    const now = m.messageTimestamp * 1000;
    global.imageCounts[senderId] = global.imageCounts[senderId] || { count: 0, lastTimestamp: 0 };
    const userData = global.imageCounts[senderId];

    if (now - userData.lastTimestamp <= 10000) {
      userData.count++;
    } else {
      userData.count = 1;
    }
    userData.lastTimestamp = now;

    // Delete the image
    await Matrix.sendMessage(chatId, {
      delete: {
        remoteJid: chatId,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    }).catch(e => console.error(`Error deleting image from ${senderId.split('@')[0]}:`, e));

    if (userData.count <= 3) { // Warn for the 1st, 2nd, and 3rd offenses
      // First, second, or third offense: warning
      await Matrix.sendMessage(chatId, {
        text: `🚫 IMAGE BLOCKED (Attempt ${userData.count}/3 warnings)\n\n@${senderId.split('@')[0]} *Only admins are allowed to send images in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m }).catch(e => console.error(`Error sending warning to ${senderId.split('@')[0]}:`, e));
    } else if (userData.count >= 4) { // Kick on the 4th offense
      // Fourth or subsequent offense: kick
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split('@')[0]} has been removed for repeatedly sending images (${userData.count} offenses).`,
          contextInfo: { mentionedJid: [senderId] }
        });
        delete global.imageCounts[senderId]; // Reset count after kick
      } catch (err) {
        console.error('Error kicking user:', err);
        // Reply to the group if kicking fails, useful for debugging bot permissions
        await m.reply(`Failed to kick @${senderId.split('@')[0]}. Please check bot permissions. Error: ${err.message}`);
      }
    }
  }
}

//<================================================>//
global.stickerCounts = global.stickerCounts || {};

if (m.chat.endsWith("@g.us") && db.data.chats[m.chat]?.antisticker) {
  const msg       = m.message || {};
  const chatId    = m.chat;
  const senderId  = m.sender;
  const isSticker = msg.stickerMessage;

  // Exemption logic: A sticker message will be acted upon ONLY IF:
  // 1. It is a sticker message (`isSticker`)
  // 2. The sender is NOT a group admin (`!isGroupAdmins`)
  // 3. The sender is NOT the bot creator (`!isCreator`)
  // 4. The message is NOT from the bot itself (`!m.key.fromMe`)
  // 5. The bot IS an admin in the group (`isBotAdmins`)
  if (isSticker && !isGroupAdmins && !isCreator && !m.key.fromMe && isBotAdmins) {
    const now = m.messageTimestamp * 1000;
    global.stickerCounts[senderId] = global.stickerCounts[senderId] || { count: 0, lastTimestamp: 0 };
    const userData = global.stickerCounts[senderId];

    if (now - userData.lastTimestamp <= 10000) { // Cooldown of 10 seconds
      userData.count++;
    } else {
      userData.count = 1; // Reset count if outside cooldown
    }
    userData.lastTimestamp = now;

    // Delete the sticker
    await Matrix.sendMessage(chatId, {
      delete: {
        remoteJid: chatId,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    }).catch(e => console.error(`Error deleting sticker from ${senderId.split("@")[0]}:`, e));

    if (userData.count <= 3) { // Warn for the 1st, 2nd, and 3rd offenses
      // First, second, or third offense: warning
      await Matrix.sendMessage(chatId, {
        text: `STICKER BLOCKED (Attempt ${userData.count}/3 warnings)\n\n@${senderId.split("@")[0]} *Only admins are allowed to send stickers in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m }).catch(e => console.error(`Error sending warning to ${senderId.split("@")[0]}:`, e));
    } else if (userData.count >= 4) { // Kick on the 4th offense
      // Fourth or subsequent offense: kick
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split("@")[0]} has been kicked for repeatedly sending stickers (${userData.count} offenses).`,
          contextInfo: { mentionedJid: [senderId] }
        });
        delete global.stickerCounts[senderId]; // Reset count after kick
      } catch (kickError) {
        console.error("Error kicking user:", kickError);
        // Reply to the group if kicking fails, useful for debugging bot permissions
        await m.reply(`Failed to kick @${senderId.split("@")[0]}. Please check bot permissions. Error: ${kickError.message}`);
      }
    }
  }
}

//<================================================>//
global.antivirtexCounts = global.antivirtexCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antivirtex) {
  const msg       = m.message || {};
  const chatId    = m.chat;
  const senderId  = m.sender;
  const text      = msg.conversation || msg.extendedTextMessage?.text || '';

  const ZWS_REGEX = /[\u2060\u200b\u200e\u202e\u202d]/;
  // A message is considered a virtex if it's excessively long OR contains zero-width spaces
  const isVirtex = (text.length > 4000 || ZWS_REGEX.test(text));

  // Perform antivirtex action ONLY IF:
  // 1. It is a detected virtex message (`isVirtex`)
  // 2. The sender is NOT a group admin (`!isGroupAdmins`)
  // 3. The sender is NOT the bot creator (`!isCreator`)
  // 4. The message is NOT from the bot itself (`!m.key.fromMe`)
  // 5. The bot IS an admin in the group (so it has permissions to delete/kick) (`isBotAdmins`)
  if (isVirtex && !isGroupAdmins && !isCreator && !m.key.fromMe && isBotAdmins) {
    global.antivirtexCounts[senderId] = (global.antivirtexCounts[senderId] || 0) + 1; // Track offense count

    try {
      // Delete the offending message
      await Matrix.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      }).catch(e => console.error(`Error deleting virtex from ${senderId.split('@')[0]}:`, e));

      // Kick the sender
      await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');

      // Announce removal
      await Matrix.sendMessage(chatId, {
        text: `🚫 @${senderId.split('@')[0]} removed for sending a crash message.`,
        contextInfo: { mentionedJid: [senderId] }
      });
    } catch (err) {
      console.error('Error enforcing antivirtex:', err);
      // Inform the group if kicking fails
      await m.reply(`Failed to enforce antivirtex on @${senderId.split('@')[0]}. Please check bot permissions. Error: ${err.message}`);
    }
  }
}

//<================================================>/
global.spamCounts = global.spamCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antispam) {
  const chatId   = m.chat;
  const senderId = m.sender;
  const now      = m.messageTimestamp * 1000;


  if (!isGroupAdmins && !isCreator && !m.key.fromMe && isBotAdmins) {
    global.spamCounts[senderId] = global.spamCounts[senderId] || {
      count: 0,
      lastTimestamp: 0,
      offenseCount: 0
    };
    const userData = global.spamCounts[senderId];

    // Count messages in 3-second windows
    if (now - userData.lastTimestamp <= 3000) { // If message is within 3 seconds of last one
      userData.count++;
    } else {
      userData.count = 1; // Reset count if outside the 3-second window
    }
    userData.lastTimestamp = now;

    if (userData.count >= 5) { // If 5 or more messages in 3 seconds, it's a spam offense
      userData.offenseCount++;

      // Delete the spam message
      await Matrix.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      }).catch(e => console.error(`Error deleting spam from ${senderId.split('@')[0]}:`, e));

      if (userData.offenseCount === 1) {
        // First offense: warning
        await Matrix.sendMessage(chatId, {
          text: `⚠️ SPAM WARNING\n\n@${senderId.split('@')[0]} You're sending messages too fast. Please slow down or you'll be removed.`,
          contextInfo: { mentionedJid: [senderId] }
        }, { quoted: m }).catch(e => console.error(`Error sending spam warning to ${senderId.split('@')[0]}:`, e));

      } else { // userData.offenseCount >= 2 (Second offense: kick)
        try {
          await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
          await Matrix.sendMessage(chatId, {
            text: `🚫 @${senderId.split('@')[0]} has been kicked for spamming.`,
            contextInfo: { mentionedJid: [senderId] }
          });
          delete global.spamCounts[senderId]; // Reset count after kick
        } catch (err) {
          console.error('Error kicking user:', err);
          // Inform the group if kicking fails
          await m.reply(`Failed to kick @${senderId.split('@')[0]}. Please check bot permissions. Error: ${err.message}`);
        }
      }
    }
  }
}

//<================================================>/
global.antispam1Counts = global.antispam1Counts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antispam1) {
  const chatId   = m.chat;
  const senderId = m.sender;
  const now      = m.messageTimestamp * 1000;


  if (!isGroupAdmins && !isCreator && !m.key.fromMe && isBotAdmins) {
    const user = (global.antispam1Counts[senderId] =
      global.antispam1Counts[senderId] || {
        count: 0,
        lastTimestamp: 0,
        blockedUntil: 0,
        deleteCount: 0,
        unblockTimer: null
      });

    // If user is currently in a "blocked" window (after 7th message)
    if (now <= user.blockedUntil) {
      if (user.deleteCount < 2) { // Delete up to 2 messages (8th and 9th messages)
        await Matrix.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
          }
        }).catch(e => console.error(`Error deleting spam from ${senderId.split('@')[0]}:`, e));
        user.deleteCount++;
      } else { // If delete count reaches 2 (10th message), kick the user
        try {
          await Matrix.sendMessage(chatId, {
            text: `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  🚫 *KICKED FOR SPAMMING* 🚫
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ @${senderId.split("@")[0]} has been
┃ removed for repeated spamming.
┗━━━━━━━━━━━━━━━━━━━━━━┛`,
            contextInfo: { mentionedJid: [senderId] }
          }).catch(e => console.error(`Error sending kick message for ${senderId.split('@')[0]}:`, e));
          await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
          clearTimeout(user.unblockTimer); // Clear any pending unblock timer
          delete global.antispam1Counts[senderId]; // Remove user from tracking
        } catch (err) {
          console.error('Error kicking user:', err);
          // Inform the group if kicking fails
          await m.reply(`Failed to kick @${senderId.split('@')[0]}. Please check bot permissions. Error: ${err.message}`);
        }
      }
      return; // Stop further processing for this message if in blocked window
    }

    // Rolling window count reset: if message comes after 10 seconds of inactivity
    if (now - user.lastTimestamp > 10000) {
      user.count = 1; // Reset message count
      user.deleteCount = 0; // Reset delete count
    } else {
      user.count++; // Increment message count within the window
    }
    user.lastTimestamp = now;

    // 6th message in the window → send a warning
    if (user.count === 6) {
      const dateStr = new Date(now).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'Africa/Accra'
      });
      const timeStr = new Date(now).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Africa/Accra'
      });
      await Matrix.sendMessage(chatId, {
        text: `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚠️ *SPAM WARNING* ⚠️
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ @${senderId.split('@')[0]}, slow down—this is a warning.
┃
┃ 📅 ${dateStr}
┃ ⏰ ${timeStr}
┃
┃ Your 7th msg will trigger a block.
┗━━━━━━━━━━━━━━━━━━━━━━┛`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m }).catch(e => console.error(`Error sending spam warning to ${senderId.split('@')[0]}:`, e));
      return; // Stop further processing for this message after warning
    }

    // 7th message in the window → block for 10 min & schedule unblock
    if (user.count === 7) {
      user.blockedUntil = now + 10 * 60 * 1000; // Set block duration for 10 minutes
      user.deleteCount = 0; // Reset delete count for the new block window
      const dateStr = new Date(now).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Accra' });
      const timeStr = new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Africa/Accra' });
      await Matrix.sendMessage(chatId, {
        text: `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⛔ *TEMP BLOCKED* ⛔
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ @${senderId.split("@")[0]} blocked for 10 minutes.
┃ Messages 8 & 9 will be deleted,
┃ 10th will get you kicked.
┃
┃ 📅 ${dateStr}
┃ ⏰ ${timeStr}
┗━━━━━━━━━━━━━━━━━━━━━━┛`,
        contextInfo: { mentionedJid: [senderId] }
      }).catch(e => console.error(`Error sending temp block message to ${senderId.split('@')[0]}:`, e));

      // Schedule unblock after the `blockedUntil` time
      user.unblockTimer = setTimeout(async () => {
        const liftT = user.blockedUntil;
        const liftDate = new Date(liftT);
        const unblockDateStr = liftDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Accra' });
        const unblockTimeStr = liftDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Africa/Accra' });

        // Notify group that user is unblocked
        await Matrix.sendMessage(chatId, { text: `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✅ *BLOCK LIFTED* ✅
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ @${senderId.split("@")[0]} is now unblocked.
┃ Please avoid spamming again.
┃
┃ 📅 ${unblockDateStr}
┃ ⏰ ${unblockTimeStr}
┗━━━━━━━━━━━━━━━━━━━━━━┛` }).catch(e => console.error(`Error sending unblock message to group for ${senderId.split('@')[0]}:`, e));

        // Also send a private message to the unblocked user
        await Matrix.sendMessage(senderId, { text: `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✅ *BLOCK LIFTED* ✅
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ You're now unblocked.
┃ Please avoid spamming again.
┃
┃ 📅 ${unblockDateStr}
┃ ⏰ ${unblockTimeStr}
┗━━━━━━━━━━━━━━━━━━━━━━┛` }).catch(e => console.error(`Error sending unblock message to ${senderId.split('@')[0]} in DM:`, e));

        delete global.antispam1Counts[senderId]; // Remove user from tracking after unblock
      }, user.blockedUntil - now);
      return; // Stop further processing for this message after blocking
    }
  }
}

//<================================================>//


// This block handles the "kick" mode for antilinkgc
if (from.endsWith('@g.us') && db.data.chats[m.chat].antilinkgckick) { // Note the check for antilinkgckick
    const linkRegex = /(?:https?:\/\/|www\.|t\.me\/|bit\.ly\/|tinyurl\.com\/|(?:[a-z0-9]+\.)+[a-z]{2,})(\/\S*)?/i;

    if (m.message && linkRegex.test(budy)) {

        if (isAdmins || isCreator || !isBotAdmins || m.key.fromMe) return;

        // Delete the message
        await Matrix.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant,
            },
        });

        // Send a warning message
        await Matrix.sendMessage(
            from,
            {
                text: `LINK DETECTED\n\n@${m.sender.split("@")[0]} *Beware, links are not allowed in this group!*`,
                contextInfo: { mentionedJid: [m.sender] },
            },
            { quoted: m }
        );

        // Kick the participant
        await Matrix.groupParticipantsUpdate(
            m.chat,
            [m.sender],
            "remove"
        );
    }
}

// This block handles the "delete only" mode for antilinkgc
if (from.endsWith('@g.us') && db.data.chats[m.chat].antilinkgc) {
    
    if (db.data.chats[m.chat].antilinkgckick) return;

    const linkRegex = /(?:https?:\/\/|www\.|t\.me\/|bit\.ly\/|tinyurl\.com\/|(?:[a-z0-9]+\.)+[a-z]{2,})(\/\S*)?/i;

    if (m.message && linkRegex.test(budy)) {

        if (isAdmins || isCreator || !isBotAdmins || m.key.fromMe) return;

        // Delete the message
        await Matrix.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant,
            },
        });
    }
}

//<======================================>// 
// AUTOVIEWSTATUS // AUTOREACT ETC //
const { commandEmojis, messageEmojis } = require("./lib/emojis"); // Keep this import

const randomCommandEmoji = commandEmojis[Math.floor(Math.random() * commandEmojis.length)];
const randomMessageEmoji = messageEmojis[Math.floor(Math.random() * messageEmojis.length)];


const instanceAutoreactMode = botInstanceSettings.autoreact ?? global.db.data.settings.autoreact ?? false;


if (instanceAutoreactMode !== false && m.key && m.key.remoteJid) {

  // Check cooldown for general reactions for THIS BOT INSTANCE
  const lastGeneralReactionTime = generalReactionCooldowns.get(botJid);
  const now = Date.now();

  if (lastGeneralReactionTime && (now - lastGeneralReactionTime < GENERAL_REACTION_COOLDOWN_MS)) {

  } else {

    let shouldReact = false;
    let emojiToSend = randomMessageEmoji;

    if (isCmd && instanceAutoreactMode === "command") {
      shouldReact = true;
      emojiToSend = randomCommandEmoji; // Use command emoji for command mode
    } else if (m.message) { // Only process if it's a regular message
      if (instanceAutoreactMode === "all") {
        shouldReact = true;
      } else if (instanceAutoreactMode === "group" && m.isGroup) {
        shouldReact = true;
      } else if (instanceAutoreactMode === "pm" && !m.isGroup) {
        shouldReact = true;
      }
    }

    if (shouldReact) {
      try { // <-- ADDED TRY BLOCK FOR SEND MESSAGE
        await Matrix.sendMessage(m.key.remoteJid, {
          react: {
            text: emojiToSend,
            key: m.key
          }
        });
        generalReactionCooldowns.set(botJid, now); 

      } catch (err) { // <-- ADDED CATCH BLOCK FOR SEND MESSAGE
        console.error("❌ Error sending general auto-reaction:", err);
      }
    }
  }
}
//<================================================>//

//<================================================>//
// Anti Bad Words
if (from.endsWith('@g.us') && db.data.chats[m.chat].badword) {
    // Get the bot instance JID for per-bot badwords list
    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    // Get the per-bot badwords list (defaults to empty array if not set for this bot)
    const badwords = db.data.users[botJid]?.badwords || [];

    for (let bak of badwords) {
        let regex = new RegExp(`\\b${bak}\\b`, 'i'); // Use word boundary (\b) for exact word matching
        if (regex.test(budy)) {
            // Exemption logic: If the sender is a group admin, or the bot creator,
            // or the message is from the bot itself, or if the bot is NOT an admin in the group (and thus cannot enforce the rule),
            // then the message is ignored.
            if (isGroupAdmins || isCreator || m.key.fromMe || !isBotAdmins) {
                return; // Do not act if exempt
            }

            // If not exempt and a bad word is found:
            // Delete the offending message
            await Matrix.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant,
                },
            }).catch(e => console.error(`Error deleting bad word message from ${m.sender.split("@")[0]}:`, e));

            // Send a warning message to the group, mentioning the sender
            await Matrix.sendMessage(
                from,
                {
                    text: `BAD WORD DETECTED\n\n@${
                        m.sender.split("@")[0]
                    } *Beware, using bad words is prohibited in this group!*`,
                    contextInfo: { mentionedJid: [m.sender] },
                },
                { quoted: m }
            ).catch(e => console.error(`Error sending bad word warning to ${m.sender.split("@")[0]}:`, e));
            
            break; // Stop checking for other bad words once one is found and acted upon for efficiency
        }
    }
}


//<================================================>//

const badwords = db.data.users[botJid]?.badwords || [];

for (let bak of badwords) {
    let regex = new RegExp(`\\b${bak}\\b`, 'i');
    if (regex.test(budy)) {
        if (isAdmins || isCreator || !isBotAdmins) return;

        await Matrix.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant,
            },
        });

        await Matrix.sendMessage(
            from,
            {
                text: `BAD WORD DETECTED\n\n@${
                    m.sender.split("@")[0]
                } *You have been removed for using prohibited language!*`,
                contextInfo: { mentionedJid: [m.sender] },
            },
            { quoted: m }
        );

        await Matrix.groupParticipantsUpdate(
            m.chat,
            [m.sender],
            "remove"
        );
        break;
    }
}


//<================================================>//

// Individual Always Online Setting

const instanceAlwaysOnline = botInstanceSettings.alwaysonline ?? global.db.data.settings.alwaysonline ?? false; // Default to true

if (instanceAlwaysOnline === false) {
    if (m.message) {
        try {
            await Matrix.sendPresenceUpdate("unavailable", from);
            await delay(1000); // 1-second delay
        } catch (error) {
            console.error('Error sending unavailable presence update:', error);
        }
    }
} else if (instanceAlwaysOnline === true) {
    if (m.message) {
        try {
            await Matrix.sendPresenceUpdate("available", from);
            await delay(1000); // 1-second delay
        } catch (error) {
            console.error('Error sending available presence update:', error);
        }
    }
}
//=================================================//

//=================================================//
//  auto read

if (global.db.data.users[botJid]?.autoread) {
  Matrix.readMessages([m.key]);
}

//<==============================================>//
//  SAVE STATUS AND VIEWONCE WITH EMOJI

// Check if sender is owner or premium user
const isOwner = Array.isArray(global.owner) && global.owner.includes(m.sender);
if (!isOwner && !isPremium(m.sender)) return; // Ignore if not owner or premium

// --- CORRECTED ADDITION: This feature will now only trigger if it's NOT a group message ---
if (
    m.quoted && // Ensure a message is being replied to
    (/^[\p{Emoji}]$/u.test(budy)) && // Check if the message you sent is exactly one emoji character
    !m.isGroup // <-- THIS IS THE CORRECT PLACEMENT: Only proceed if it's NOT a group message
) {
    (async () => {
        try {
            let messageToDownload = null;
            let messageType = null;
            let caption = "🌹Here's the status you saved!🥂"; // Default caption

            if (m.quoted.message?.imageMessage) {
                messageToDownload = m.quoted.message.imageMessage;
                messageType = 'image';
                caption = m.quoted.message.imageMessage.caption || caption;
            } else if (m.quoted.message?.videoMessage) {
                messageToDownload = m.quoted.message.videoMessage;
                messageType = 'video';
                caption = m.quoted.message.videoMessage.caption || caption;
            } else if (m.quoted.message?.audioMessage) {
                messageToDownload = m.quoted.message.audioMessage;
                messageType = 'audio';
            } else if (m.quoted.message?.viewOnceMessage) {
                const viewOnceMsg = m.quoted.message.viewOnceMessage.message;
                if (viewOnceMsg?.imageMessage) {
                    messageToDownload = viewOnceMsg.imageMessage;
                    messageType = 'image';
                    caption = viewOnceMsg.imageMessage.caption || caption;
                } else if (viewOnceMsg?.videoMessage) {
                    messageToDownload = viewOnceMsg.videoMessage;
                    messageType = 'video';
                    caption = viewOnceMsg.videoMessage.caption || caption;
                } else if (viewOnceMsg?.audioMessage) {
                    messageToDownload = viewOnceMsg.audioMessage;
                    messageType = 'audio';
                }
            }

            if (!messageToDownload || !messageType) {
                return; // silently stop if no media found
            }

            let buffer = Buffer.from([]);
            try {
                const stream = await downloadContentFromMessage(messageToDownload, messageType);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            } catch (e) {
                await Matrix.sendMessage(m.sender, {
                    text: "❌ Error: Unable to download media. It may have expired or is not accessible to this bot session."
                });
                return;
            }
            if (!buffer.length) {
                await Matrix.sendMessage(m.sender, {
                    text: "❌ Error: Media could not be saved (buffer is empty)."
                });
                return;
            }

            try {
                if (messageType === 'image') {
                    await Matrix.sendMessage(m.sender, { image: buffer, caption });
                } else if (messageType === 'video') {
                    await Matrix.sendMessage(m.sender, { video: buffer, caption });
                } else if (messageType === 'audio') {
                    await Matrix.sendMessage(m.sender, { audio: buffer, mimetype: 'audio/mp4' });
                }
            } catch (err) {
                await Matrix.sendMessage(m.sender, {
                    text: "❌ Error: Could not send media to your DM. Please make sure you have started a chat with this bot and have it saved in your contacts."
                });
            }
        } catch (err) {
            await Matrix.sendMessage(m.sender, {
                text: "❗ Fatal error: " + err.message
            });
        }
    })();
}

//<==============================================>//


// SAVE STATUS AND VIEWONCE WITH STICKER

if (
    m.quoted &&
    m.message?.stickerMessage &&
    (
        m.quoted.message?.imageMessage ||
        m.quoted.message?.videoMessage ||
        m.quoted.message?.audioMessage ||
        m.quoted.message?.viewOnceMessage
    ) &&
    !m.isGroup // <-- Added this condition: only run if NOT in a group
) {
    (async () => {
        try {
            let messageToDownload = null;
            let messageType = null;
            let caption = "💾 Here's the media you saved with a sticker! ✨";

            if (m.quoted.message?.imageMessage) {
                messageToDownload = m.quoted.message.imageMessage;
                messageType = 'image';
                caption = m.quoted.message.imageMessage.caption || caption;
            } else if (m.quoted.message?.videoMessage) {
                messageToDownload = m.quoted.message.videoMessage;
                messageType = 'video';
                caption = m.quoted.message.videoMessage.caption || caption;
            } else if (m.quoted.message?.audioMessage) {
                messageToDownload = m.quoted.message.audioMessage;
                messageType = 'audio';
            } else if (m.quoted.message?.viewOnceMessage) {
                const viewOnceMsg = m.quoted.message.viewOnceMessage.message;
                if (viewOnceMsg?.imageMessage) {
                    messageToDownload = viewOnceMsg.imageMessage;
                    messageType = 'image';
                    caption = viewOnceMsg.imageMessage.caption || caption;
                } else if (viewOnceMsg?.videoMessage) {
                    messageToDownload = viewOnceMsg.videoMessage;
                    messageType = 'video';
                    caption = viewOnceMsg.videoMessage.caption || caption;
                } else if (viewOnceMsg?.audioMessage) {
                    messageToDownload = viewOnceMsg.audioMessage;
                    messageType = 'audio';
                }
            }

            // If for some reason we still don't have a media, just return silently (NO DM, NO CHAT MSG)
            if (!messageToDownload || !messageType) return;

            let buffer = Buffer.from([]);
            try {
                const stream = await downloadContentFromMessage(messageToDownload, messageType);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            } catch (e) {
                await Matrix.sendMessage(m.sender, {
                    text: "❌ Error: Unable to download media. It may have expired or is not accessible to this bot session."
                });
                return;
            }
            if (!buffer.length) {
                await Matrix.sendMessage(m.sender, {
                    text: "❌ Error: Media could not be saved (buffer is empty)."
                });
                return;
            }

            // Send to the user's DM (m.sender)
            try {
                if (messageType === 'image') {
                    await Matrix.sendMessage(m.sender, { image: buffer, caption });
                } else if (messageType === 'video') {
                    await Matrix.sendMessage(m.sender, { video: buffer, caption });
                } else if (messageType === 'audio') {
                    await Matrix.sendMessage(m.sender, { audio: buffer, mimetype: 'audio/mp4' });
                }
                // No reaction, no chat message!
            } catch (err) {
                await Matrix.sendMessage(m.sender, {
                    text: "❌ Error: Could not send media to your DM. Please make sure you have started a chat with this bot and have it saved in your contacts."
                });
            }
        } catch (err) {
            await Matrix.sendMessage(m.sender, {
                text: "❗ Fatal error: " + err.message
            });
        }
    })();
}


//=================================================//
//=================================================//


// The chatbot handler (which was previously in the removed Matrix.ev.on) should go here.
// I'll put it back, adapting it to use the 'm' object passed to the main function.

if (
    global.db.data.settings.adizachat === true && // Changed from `chatbot` to `adizachat` as per your db.data.settings
    (m.message.extendedTextMessage?.text || m.message.conversation) &&
    !m.key.fromMe && // Use m.key.fromMe (true if bot sent it)
    !m.isGroup && // Check if it's a private chat
    !command // Only respond if it's not a command
) {
    try {
        const userId = m.sender;
        const userMessage = m.message.extendedTextMessage?.text || m.message.conversation || '';

        if (!userMessage.trim()) {
            return;
        }

        // --- Prevent duplicate replies for chatbot ---
        if (lastProcessedMessageId[userId] === m.key.id) {
            return; // Already responded to this message for chatbot
        }
        lastProcessedMessageId[userId] = m.key.id;
        // --- END Prevent duplicate replies ---


        await Matrix.sendPresenceUpdate('composing', m.chat);
        await Matrix.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } }); // LINE OF ERROR, THIS IS IT!

        if (!chatHistory[userId]) chatHistory[userId] = [];

        // Add user message to history
        chatHistory[userId].push({ role: "user", content: userMessage.trim() });
        // Limit history to last 6 messages (or whatever you prefer)
        if (chatHistory[userId].length > 6) {
            chatHistory[userId] = chatHistory[userId].slice(-6);
        }

        // Construct conversation for API (APIs might prefer different formats)
        const conversation = chatHistory[userId]
            .map(x => `${x.role}: ${x.content}`)
            .join("\n");


        const apiUrls = [
            `https://api.siputzx.my.id/api/ai/gpt3?prompt=You%20are%20a%20helpful%20assistant&content=${encodeURIComponent(conversation)}`,
            `https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?content=${encodeURIComponent(conversation)}`,
            `https://bk9.fun/ai/jeeves-chat?q=${encodeURIComponent(userMessage.trim())}` // Using promptText directly for this API
        ];

        let responseText = null;

        for (let i = 0; i < apiUrls.length; i++) {
            try {
                const res = await axios.get(apiUrls[i]);
                const data = res.data;
                if (data?.data || data?.BK9 || data?.response || data?.result) {
                    responseText = data.data || data.BK9 || data.response || data.result;
                    break;
                }
            } catch (e) {
                console.error(`Chatbot API ${i + 1} failed:`, e.message);
            }
        }

        if (responseText) {
            chatHistory[userId].push({ role: "assistant", content: responseText });
            await Matrix.sendMessage(m.chat, { text: responseText }, { quoted: m });
            await Matrix.sendMessage(m.chat, { react: { text: "💬", key: m.key } });
        } else {
            await Matrix.sendMessage(m.chat, { text: "❌ Failed to get a valid response from the chatbot." }, { quoted: m });
            await Matrix.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
        }

    } catch (err) {
        console.error("Chatbot handler error:", err);
        await Matrix.sendMessage(m.chat, { text: "⚠️ An error occurred while processing the chatbot command." }, { quoted: m });
        await Matrix.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
    }
}
//<================================================>//

//<================================================>//
function loadBlacklist() {
    if (!global.db.data.blacklist) {
        global.db.data.blacklist = { blacklisted_numbers: [] };
    }
    return global.db.data.blacklist;
}
const chatId = m.chat;
const userId = m.key.remoteJid;
const blacklist = loadBlacklist();

if ((blacklist.blacklisted_numbers.includes(userId) || blacklist.blacklisted_numbers.includes(chatId))
    && userId !== botNumber && !m.key.fromMe) {
    return;
}
//=================================================//
if (["120363321302359713@g.us", "120363381188104117@g.us"].includes(m.chat)) {
    if (command && !isCreator && !m.key.fromMe) {
        return;
    }
}
//<================================================>//

// Mode check: block commands based on mode
if (isCmd) {
  // Retrieve sender's premium status for access bypass
  const isSenderPremium = isPremium(m.sender); // Assuming isPremium is imported at the top

  if (mode === "private" && !isCreator && !isSenderPremium) {
    // Private mode: only creator and premium users can run commands
    return await Matrix.sendMessage(from, {
      text: "⚠️ Your bot is currently in *private* mode. Only the owner and premium users can use commands."
    }, { quoted: m });
  }
  if (mode === "group" && !m.isGroup && !isCreator && !isSenderPremium) {
    // Group only mode: block commands outside groups for non-owner/non-premium
    return await Matrix.sendMessage(from, {
      text: "⚠️ Your bot is currently in *group only* mode. Commands work only in groups."
    }, { quoted: m });
  }
  if (mode === "pm" && m.isGroup && !isCreator && !isSenderPremium) {
    // PM only mode: block commands in groups for non-owner/non-premium
    return await Matrix.sendMessage(from, {
      text: "⚠️ Your bot is currently in *private chat only* mode. Commands work only in private chats."
    }, { quoted: m });
  }
  // Public mode: allow all commands (no explicit `return` here)
}


// Mode status string for display
const modeStatus = 
  mode === 'public' ? "Public" : 
  mode === 'private' ? "Private" : 
  mode === 'group' ? "Group Only" : 
  mode === 'pm' ? "PM Only" : "Unknown";


//<================================================>//
//================== [ FAKE REPLY ] ==================//
const fkontak = {
key: {
participants: "0@s.whatsapp.net",
remoteJid: "status@broadcast",
fromMe: false,
id: "Halo"},
message: {
contactMessage: {
vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
}},
participant: "0@s.whatsapp.net"
}

const reply = async(teks) => {
Matrix.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
          forwardingScore: 9999999,
          isForwarded: true
        }
      }, { quoted: m });
   }

const replys = async(teks) => {
m.reply(teks);
}

const reply2 = async(teks) => {
Matrix.sendMessage(m.chat, { text : teks,
contextInfo: {
mentionedJid: [m.sender],
forwardingScore: 9999,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: '120363305699578483@newsletter',
serverMessageId: 20,
newsletterName: '❃𝗔𝗗𝗜𝗭𝗔 𝗕𝗢𝗧'
},
externalAdReply: {
title: "𝗔𝗗𝗜𝗭𝗔 𝗕𝗢𝗧",
body: "",
thumbnailUrl: "https://files.catbox.moe/vikf6c.jpg",
sourceUrl: null,
mediaType: 1
}}}, { quoted : m })
}
//=================================================//
//=================================================//
const { pluginManager } = require('./index');
(async () => {

  const context = {
  Matrix,
  m,
  reply,
  args,
  quoted,
  mime,
  prefix,
  command, // Ensure 'command' is passed in context
  text,
  bad,
  isCreator, // Ensure 'isCreator' is passed in context
  mess, // Ensure 'mess' is passed in context
  db,
  botNumber,
  modeStatus,
  sleep,
  isUrl,
  versions,
  full_args,
  setHerokuEnvVar,
  getHerokuEnvVars,
  deleteHerokuEnvVar,
  from,
  isAdmins,
  isBotAdmins,
  isGroupOwner,
  participants,
  q,
  store,
  sender,
  botname,
  ownername,
  ownernumber,
  fetchMp3DownloadUrl,
  fetchVideoDownloadUrl,
  saveStatusMessage,
  groupMetadata,
  fetchJson,
  acr,
  obfus,
  from,
  pushname,
  ephoto,
  loadBlacklist,
  mainOwner,

}; // <-- This is the correct closing brace for the context object

// Process commands
if (command) {
    try {
        // --- DEBUG LOGS ---
        console.log(`[DEBUG] Plugin Command detected: "${command}" by sender: "${m.sender}"`);
        console.log(`[DEBUG] isCreator (human owner/sudo): ${isCreator}`); // Now reflects human owners only
        const debugIsUserPremium = isPremium(m.sender);
        console.log(`[DEBUG] isPremium(sender) for "${m.sender}": ${debugIsUserPremium}`);
        // --- END DEBUG LOGS ---

        // START OF PREMIUM CHECK INSERTION FOR PLUGINS
        // The 'if (m.sender === botNumber)' bypass has been removed from here.
        console.log(`[DEBUG] Attempting premium check for plugin command: "${command}"`);
        const blockedByPremium = await checkCommandAccess(Matrix, m, isCreator, command, mess); // isCreator is now only human owners
        console.log(`[DEBUG] Result of checkCommandAccess for plugin command "${command}": ${blockedByPremium ? 'BLOCKED' : 'ALLOWED'}`);

        if (blockedByPremium) {
            console.log(`[DEBUG] Plugin command "${command}" was blocked by premium check. Returning.`);
            return; // Stop execution if blocked
        }
        // END OF PREMIUM CHECK INSERTION FOR PLUGINS

        console.log(`[DEBUG] Plugin command "${command}" allowed. Executing plugin.`);
        const handled = await pluginManager.executePlugin(context, command);
        console.log(`[DEBUG] Plugin for "${command}" executed. Handled: ${handled}`);

    } catch (error) {
        console.error(`Error executing plugin command "${command}":`, error.message);
        Matrix.sendMessage(Matrix.user.id, { text: `An error occurred while executing the command "${command}": ${error.message}` });
    }
}


})(); // This closing bracket belongs to the IIFE above the switch statement

switch (command) {
//=================================================//

case "menu":
    // --- DEBUG LOGS ---
    console.log(`[DEBUG] Switch Command detected: "menu" by sender: "${m.sender}"`);
    console.log(`[DEBUG] isCreator (human owner/sudo): ${isCreator}`); // Now reflects human owners only
    const debugIsUserPremiumMenu = isPremium(m.sender);
    console.log(`[DEBUG] isPremium(m.sender) for "menu": ${debugIsUserPremiumMenu}`);
    // --- END DEBUG LOGS ---

    // START OF PREMIUM CHECK FOR 'menu' COMMAND
    // The 'if (m.sender === botNumber)' bypass has been removed from here.
    console.log(`[DEBUG] Attempting premium check for switch command: "menu"`);
    const blockedByPremiumForMenu = await checkCommandAccess(Matrix, m, isCreator, command, mess); // isCreator is now only human owners
    console.log(`[DEBUG] Result of checkCommandAccess for switch command "menu": ${blockedByPremiumForMenu ? 'BLOCKED' : 'ALLOWED'}`);
    if (blockedByPremiumForMenu) {
        console.log(`[DEBUG] Switch command "menu" was blocked by premium check. Returning.`);
        return; // Stop execution if blocked
    }
    // END OF PREMIUM CHECK FOR 'menu' COMMAND

    console.log(`[DEBUG] Switch command "menu" allowed. Executing menu logic.`);

    const formatMemory = (memory) => {
        return memory < 1024 * 1024 * 1024
            ? Math.round(memory / 1024 / 1024) + ' MB'
            : Math.round(memory / 1024 / 1024 / 1024) + ' GB';
    };

    const progressBar = (used, total, size = 10) => {
        let percentage = Math.round((used / total) * size);
        let bar = '█'.repeat(percentage) + '░'.repeat(size - percentage);
        return `[${bar}] ${Math.round((used / total) * 100)}%`;
    };

    // **Generate Menu Function**
    const generateMenu = (plugins, ownername, prefixz, modeStatus, versions, latensie, readmore) => {
        const memoryUsage = process.memoryUsage();
        const botUsedMemory = memoryUsage.heapUsed;
        const totalMemory = os.totalmem();
        const systemUsedMemory = totalMemory - os.freemem();

        // Memory formatting function
        const formatMemory = (memory) => {
            return memory < 1024 * 1024 * 1024
                ? Math.round(memory / 1024 / 1024) + ' MB'
                : Math.round(memory / 1024 / 1024 / 1024) + ' GB';
        };

        // Memory progress bar (System RAM usage)
        const progressBar = (used, total, size = 10) => {
            let percentage = Math.round((used / total) * size);
            let bar = '█'.repeat(percentage) + '░'.repeat(size - percentage);
            return `[${bar}] ${Math.round((used / total) * 100)}%`;
        };

        // Count total unique commands across all plugins
        let totalCommands = 0;
        const uniqueCommands = new Set();
        for (const category in plugins) {
            plugins[category].forEach(plugin => {
                if (plugin.command.length > 0) {
                    uniqueCommands.add(plugin.command[0]); // Add only the main command
                }
            });
        }
        totalCommands = uniqueCommands.size;

        let menu = "╭༺◈👸🌹ADIZATU🌹👸\n";
        menu += "│🇬🇭 *ᴏᴡɴᴇʀ* : " + ownername + "\n";
        menu += "│⚡ *ᴘʀᴇғɪx* : [ " + prefixz + " ]\n"; // <--- CORRECTED HERE
        menu += "│💻 *ʜᴏsᴛ* : " + os.platform() + "\n";
        menu += "│🧩 *ᴘʟᴜɢɪɴs* : " + totalCommands + "\n";
        menu += "│🚀 *ᴍᴏᴅᴇ* : " + modeStatus + "\n";
        menu += "│🛠️ *ᴠᴇʀsɪᴏɴ* : " + versions + "\n";
        menu += "│⚡ *sᴘᴇᴇᴅ* : " + latensie.toFixed(4) + " ms\n";
        menu += "│📈 *ᴜsᴀɢᴇ* : " + formatMemory(botUsedMemory) + " of " + formatMemory(totalMemory) + "\n";
        menu += "│🧠 *ʀᴀᴍ* : " + progressBar(systemUsedMemory, totalMemory) + "\n";
        menu += "╰───━━━༺◈༻━━━───╯\n" + readmore + "\n";

        for (const category in plugins) {
            menu += "╭══⋆⋅༻❁ *" + category.toUpperCase() + " MENU*\n";
            plugins[category].forEach(plugin => {
                if (plugin.command.length > 0) {
                    menu += "│🌹 " + plugin.command[0] + "\n";
                }
            });
            menu += "╰─━─━──༺◈༻──━─━─╯\n\n";
        }
        return menu;
    };

    const loadMenuPlugins = (directory) => {
        const plugins = {};

        const files = fs.readdirSync(directory);
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const filePath = path.join(directory, file);
                try {
                    delete require.cache[require.resolve(filePath)];
                    const pluginArray = require(filePath);

                    const category = path.basename(file, '.js'); // Extract filename without extension
                    if (!plugins[category]) {
                        plugins[category] = [];
                    }

                    plugins[category].push(...pluginArray); // Spread array to push each plugin individually
                } catch (error) {
                    console.error(`Error loading plugin at ${filePath}:`, error);
                }
            }
        });

        return plugins;
    };

    const matrix = [matrix1, matrix2, matrix3, matrix4, matrix5][Math.floor(Math.random() * 5)];

    const startTime = performance.now();
    await m.reply("🚀Loading...Adiza-Bot🌹"); // <--- THIS IS THE LINE 2551 ERROR IN YOUR SCREENSHOT
    const endTime = performance.now();
    const latensie = endTime - startTime;

    // Load plugins
    const plugins = loadMenuPlugins(path.resolve(__dirname, './src/Plugins'));

    // --- CORRECTED CALL: Passes the `prefix` variable from above ---
    const menulist = generateMenu(plugins, ownername, prefix, modeStatus, versions, latensie, readmore);
    // --- END CORRECTED CALL ---


// Get the menu style for the current bot instance, or fall back to global, then default
const menustyle = db.data.users[Matrix.user.id]?.menustyle || global.db.data.settings.menustyle || '2';
// ...





    if (menustyle === '1') {
        Matrix.sendMessage(m.chat, {
            document: {
                url: "https://i.ibb.co/2W0H9Jq/avatar-contact.png",
            },
            caption: menulist,
            mimetype: "application/zip",
            fileName: `${botname}`,
            fileLength: "9999999",
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: "",
                    body: "",
                    thumbnail: matrix,
                    sourceUrl: plink,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: fkontak });
    } else if (menustyle === '2') {
        m.reply(menulist);
    } else if (menustyle === '3') {
        Matrix.sendMessage(m.chat, {
            text: menulist,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: botname,
                    body: ownername,
                    thumbnail: matrix,
                    sourceUrl: plink,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: m });
    } else if (menustyle === '4') {
        Matrix.sendMessage(m.chat, {
            image: matrix,
            caption: menulist,
        }, { quoted: m });
    } else if (menustyle === '5') {
        let massage = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: null,
                        },
                        footer: {
                            text: menulist,
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                text: null
                            }],
                        },
                    },
                },
            },
        }, { quoted: m });
        Matrix.relayMessage(m.chat, massage.message, { messageId: massage.key.id });
    } else if (menustyle === '6') {
        Matrix.relayMessage(m.chat, {
            requestPaymentMessage: {
                currencyCodeIso4217: 'USD',
                requestFrom: '0@s.whatsapp.net',
                amount1000: '1',
                noteMessage: {
                    extendedTextMessage: {
                        text: menulist,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                showAdAttribution: true,
                            },
                        },
                    },
                },
            },
        }, {});
    }
    break;
//<================================================>//



default: {
  if (budy.startsWith('$')) {
    if (!isCreator) return;
    exec(budy.slice(2), (err, stdout) => {
      if (err) return m.reply(err);
      if (stdout) return m.reply(stdout);
    });
  }

if (budy.startsWith('>')) {
        if (!isCreator) return;
        try {
            let evaled = await eval(budy.slice(2));
            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
            await m.reply(evaled);
        } catch (err) {
            console.error(err); // Log the error to the console
            await m.reply(String(err));
        }
    }

  if (budy.startsWith('=>')) {
    if (!isCreator) return;

    function Return(sul) {
      let sat = JSON.stringify(sul, null, 2);
      let bang = util.format(sat);
      if (sat == undefined) {
        bang = util.format(sul);
      }
      return m.reply(bang);
    }
    try {
      const result = await eval(`(async () => { return ${budy.slice(3)} })()`); // Use an IIFE
      m.reply(util.format(result));
    } catch (e) {
      console.error(e); // Log the error to the console
      m.reply(String(e));
    }
  }
}

}
} catch (err) {
  let formattedError = util.format(err);
  let errorMessage = String(formattedError);

  if (shouldLogError(errorMessage)) {
    if (typeof err === 'string') {
      m.reply(`An error occurred:\n\nError Description: ${errorMessage}`);
    } else {
      console.log(formattedError);
      Matrix.sendMessage(Matrix.user.id, {
        text: `An error occurred:\n\nError Description: ${errorMessage}`,
        contextInfo: {
          forwardingScore: 9999999,
          isForwarded: true
        }
      }, { ephemeralExpiration: 60 });
    }

    recordError(errorMessage);
  } else {
    console.log(`Repeated error suppressed: ${errorMessage}`);
  }
 }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(color(`Updated '${__filename}'`, 'red'))
  delete require.cache[file]
  require(file)
})
