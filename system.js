global.AdizaIndex = 0;
require('./settings')
const {
  generateWAMessageFromContent,
  proto,
  downloadContentFromMessage,
} = require("@whiskeysockets/baileys");
const { pluginManager } = require('./index');
const { xeon_antispam } = require('./lib/antispam.js');
const { exec, spawn, execSync } = require("child_process")
const spamTracker = new Map(); 
const AdmZip = require('adm-zip'); 
let chatHistory = {};
let lastProcessedMessageId = {};
const { jidDecode } = require("@whiskeysockets/baileys");
const { calculateExpiry, isPremium, checkCommandAccess } = require('./lib/premiumSystem');
const callCounts = {};
const handledCallIds = new Set();
const util = require('util')
const fetch = require('node-fetch')
const path = require('path')
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const mime = require('mime-types');
const { fromBuffer } = require('file-type'); 
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
const yts = require("yt-search")
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

// Gemini API key 

global.GEMINI_API_KEY = 'AIzaSyD83VaYyupAYuW2lntr4KQWHtY5ECf_OCA';
const geminiApiKey = global.GEMINI_API_KEY;

let genAI;
let geminiModel;

if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
  geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];
  geminiModel.safetySettings = safetySettings;
  console.log("✅ Gemini-1.5-flash model initialized with safety settings.");
} else {
  console.warn("⚠️ global.GEMINI_API_KEY is not set. Gemini multi-modal input features will be disabled.");
}


const {
    smsg,
    formatDate,
    getTime,
    getGroupAdmins,
    formatp,
    await,
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
const dlkey = '_0x5aff35,_0x1876stqr';

//badwords
const bad = JSON.parse(fs.readFileSync("./src/badwords.json")); 

//Shazam
const acr = new acrcloud({
    host: 'identify-eu-west-1.acrcloud.com',
    access_key: '882a7ef12dc0dc408f70a2f3f4724340',
    access_secret: 'qVvKAxknV7bUdtxjXS22b5ssvWYxpnVndhy2isXP'
});


// REMOVED DUPLICATE safeDecodeJid FUNCTION HERE
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



// Function to convert a Baileys message media to a Gemini Generative Part
// `m` here is the full Baileys message object (data.messages[0])
async function fileToGenerativePart(m, Matrix) {
    let mediaType; // 'image', 'video', 'document', 'audio'
    let mediaContent; // The specific message part (e.g., m.message.imageMessage)
    let messageTypeFromBaileys = m.mtype; // The message type from Baileys (e.g., 'imageMessage')

    console.log(`[Gemini-FileProcess] Starting processing for message type: ${messageTypeFromBaileys}`);

    // Identify the type of media message from the Baileys message object (m.message)
    if (m.message.imageMessage) {
        mediaType = 'image';
        mediaContent = m.message.imageMessage;
    } else if (m.message.videoMessage) {
        mediaType = 'video';
        mediaContent = m.message.videoMessage;
    } else if (m.message.documentMessage) {
        mediaType = 'document';
        mediaContent = m.message.documentMessage;
    } else if (m.message.audioMessage) {
        mediaType = 'audio';
        mediaContent = m.message.audioMessage;
    } else {
        console.warn(`[Gemini-FileMatrix] Unrecognized message type for multi-modal: ${messageTypeFromBaileys}. Returning null.`);
        await Matrix.sendMessage(m.chat, { text: `I cannot directly Matrix this type of media (\`${messageTypeFromBaileys}\`) with Gemini. I support images, videos, audio, and common documents.` }, { quoted: m });
        return null;
    }

    if (!mediaContent) {
        console.error(`[Gemini-FileMatrix] mediaContent is null for type ${messageTypeFromBaileys}. This should not happen.`);
        await Matrix.sendMessage(m.chat, { text: `Error: Media content missing for ${messageTypeFromBaileys}.` }, { quoted: m });
        return null;
    }
    console.log(`[Gemini-FileProcess] Identified mediaType: ${mediaType}`);

    let stream;
    try {
        stream = await downloadContentFromMessage(mediaContent, mediaType);
        console.log(`[Gemini-FileProcess] Stream received for download.`);
    } catch (error) {
        console.error(`[Gemini-FileProcess] Error downloading content from message (${mediaType}):`, error);
        await Matrix.sendMessage(m.chat, { text: `An error occurred while downloading your media: ${error.message}` }, { quoted: m });
        return null;
    }

    const bufferArray = [];
    try {
        for await (const chunk of stream) {
            bufferArray.push(chunk);
        }
        const buffer = Buffer.concat(bufferArray);
        console.log(`[Gemini-FileProcess] Buffer created. Size: ${buffer.length} bytes.`);

        if (buffer.length === 0) {
            console.error(`[Gemini-FileProcess] Downloaded buffer is empty for message ID: ${m.key.id}.`);
            await Matrix.sendMessage(m.chat, { text: `Downloaded media is empty. Cannot process for AI.` }, { quoted: m });
            return null;
        }

        let mimeType = mediaContent.mimetype;
        if (!mimeType) {
            console.log('[Gemini-FileProcess] Mimetype not found in message. Trying to infer from buffer.');
            try {
                const fileTypeResult = await fromBuffer(buffer);
                mimeType = fileTypeResult ? fileTypeResult.mime : 'application/octet-stream';
                console.log(`[Gemini-FileProcess] Inferred mimetype: ${mimeType}`);
            } catch (e) {
                console.warn("[Gemini-FileProcess] Could not determine MIME type from buffer, falling back to basic checks:", e);
                if (mediaType === 'image') mimeType = 'image/jpeg';
                else if (mediaType === 'video') mimeType = 'video/mp4';
                else if (mediaType === 'audio') mimeType = 'audio/mpeg';
                else if (mediaType === 'document') mimeType = 'application/octet-stream';
                console.log(`[Gemini-FileProcess] Fallback mimetype: ${mimeType}`);
            }
        } else {
            console.log(`[Gemini-FileProcess] Mimetype from message: ${mimeType}`);
        }

        // Supported MIME types
        const supportedImageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const supportedVideoMimes = ['video/mp4', 'video/webm'];
        const supportedAudioMimes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/webm', 'audio/ogg; codecs=opus'
        ];
        const supportedDocumentMimes = [
            'text/plain', 'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        // Add code/text file support
        const supportedTextMimes = [
            'text/plain', 'text/x-python', 'application/javascript', 'application/json',
            'text/csv', 'text/html', 'text/css', 'application/xml', 'application/x-sh', 'application/x-csh'
        ];

        // Supported text/code file extensions for ZIP extraction
        const supportedTextExtensions = /\.(txt|py|js|json|csv|md|html|css|xml)$/i;

        if (supportedImageMimes.includes(mimeType)) {
            console.log(`[Gemini-FileProcess] Returning image generative part with MIME: ${mimeType}`);
            return { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } };
        } else if (supportedVideoMimes.includes(mimeType)) {
            console.log(`[Gemini-FileProcess] Returning video generative part with MIME: ${mimeType}`);
            return { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } };
        } else if (supportedAudioMimes.includes(mimeType)) {
            console.log(`[Gemini-FileProcess] Returning audio generative part with MIME: ${mimeType}`);
            return { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } };
        } else if (mimeType === 'application/zip') {
            // --- ZIP Extraction Logic ---
            try {
                const zip = new AdmZip(buffer);
                const entries = zip.getEntries();
                let extractedTexts = [];
                for (const entry of entries) {
                    if (!entry.isDirectory && supportedTextExtensions.test(entry.entryName)) {
                        const fileContent = entry.getData().toString('utf8');
                        extractedTexts.push(`File: ${entry.entryName}\n${fileContent}`);
                    }
                }
                if (extractedTexts.length > 0) {
                    const combinedText = extractedTexts.join('\n\n');
                    console.log(`[Gemini-FileProcess] Returning extracted text from ZIP (${entries.length} files, ${extractedTexts.length} supported).`);
                    return { text: combinedText };
                } else {
                    await Matrix.sendMessage(m.chat, { text: `⚠️ ZIP file contains no supported text/code files (txt, py, js, json, csv, etc).` }, { quoted: m });
                    return null;
                }
            } catch (zipError) {
                console.error(`[Gemini-FileProcess] Error extracting ZIP:`, zipError);
                await Matrix.sendMessage(m.chat, { text: `⚠️ Failed to extract ZIP file: ${zipError.message}` }, { quoted: m });
                return null;
            }
        } else if (supportedDocumentMimes.includes(mimeType)) {
            console.log(`[Gemini-FileProcess] Returning document generative part with MIME: ${mimeType}`);
            return { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } };
        } else if (supportedTextMimes.includes(mimeType)) {
            // For code/text files, treat as text
            const textContent = buffer.toString('utf8');
            console.log(`[Gemini-FileProcess] Returning text part for code/text file with MIME: ${mimeType}`);
            return { text: textContent };
        } else {
            console.warn(`[Gemini] Unsupported MIME type for Gemini: ${mimeType} for message ID: ${m.key.id}`);
            await Matrix.sendMessage(m.chat, {
                text: `⚠️ Gemini does not fully support files of type \`${mimeType}\`. I can process common images, videos, audio, documents, and code/text files (js, py, txt, json, csv, etc.).`,
            }, { quoted: m });
            return null;
        }
    } catch (error) {
        console.error(`[Gemini-FileProcess] Critical error during buffer processing/base64 conversion:`, error);
        await Matrix.sendMessage(m.chat, { text: `A critical error occurred while processing your media for AI: ${error.message}` }, { quoted: m });
        return null;
    }
}





// New: Adizachat User States file
const ADIZACHAT_USER_STATES_FILE = path.join(__dirname, 'lib', 'adizachat_user_states.json');

// New: Global variable for Adizachat user states database
let adizaUserStatesDb;

// New: Function to load Adizachat user states
function loadAdizaUserStates() {
    try {
        fs.mkdirSync(path.dirname(ADIZACHAT_USER_STATES_FILE), { recursive: true });
        if (fs.existsSync(ADIZACHAT_USER_STATES_FILE)) {
            const data = fs.readFileSync(ADIZACHAT_USER_STATES_FILE, 'utf8');
            adizaUserStatesDb = JSON.parse(data);
            console.log('Adizachat user states loaded from:', ADIZACHAT_USER_STATES_FILE);
        } else {
            adizaUserStatesDb = { userApiStates: {} };
            fs.writeFileSync(ADIZACHAT_USER_STATES_FILE, JSON.stringify(adizaUserStatesDb, null, 2));
            console.warn('Adizachat user states file not found, created a new one at:', ADIZACHAT_USER_STATES_FILE);
        }
    } catch (err) {
        console.error('Error loading Adizachat user states:', err);
        adizaUserStatesDb = { userApiStates: {} }; // Fallback to empty if error
    }
    return adizaUserStatesDb;
}

// New: Function to save Adizachat user states
function saveAdizaUserStates() {
    try {
        fs.writeFileSync(ADIZACHAT_USER_STATES_FILE, JSON.stringify(adizaUserStatesDb, null, 2));
        console.log('Adizachat user states saved to:', ADIZACHAT_USER_STATES_FILE);
    } catch (err) {
        console.error('Error saving Adizachat user states:', err);
    }
}

// New: Helper function to get or initialize user API state
function getUserApiState(userId) {
    if (!adizaUserStatesDb.userApiStates[userId]) {
        adizaUserStatesDb.userApiStates[userId] = {
            currentApi: "gemini", // Default API
            isSelecting: false,
            enabled: false
        };
    }
    return adizaUserStatesDb.userApiStates[userId];
}

// New: Helper function to set current user API
function setCurrentUserApi(userId, modelKey) {
    if (AVAILABLE_APIS[modelKey]) {
        getUserApiState(userId).currentApi = modelKey;
        saveAdizaUserStates();
        return true;
    }
    return false;
}

// New: AVAILABLE_APIS object (copied from your group.js)
const AVAILABLE_APIS = {
    "gemini": {
        displayName: "Gemini (2.5 flash)", 
        type: "gemini_sdk" 
    },
    "gpt3": {
        displayName: "GPT-3 (Neo)",
        url: (conversation) => `https://api.siputzx.my.id/api/ai/gpt3?prompt=You%20are%20a%20helpful%20assistant&content=${encodeURIComponent(conversation)}`,
        type: "external_url",
        responseKey: "result",
        usesRawText: false
    },
    "llama3": {
        displayName: "Meta Llama 3 (Ultra)",
        url: (conversation) => `https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?content=${encodeURIComponent(conversation)}`,
        type: "external_url",
        responseKey: "data",
        usesRawText: false
    },
    "evilgpt": {
        displayName: "EvilGPT (WormGpt Mode)",
        url: (query) => `https://umar-wormgpt.ma-coder-x.workers.dev/?query=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "response", 
        usesRawText: true
    },
    "jarvis": {
        displayName: "Jarvis Chat (Prime)",
        url: (userTextContent) => `https://bk9.fun/ai/jeeves-chat?q=${encodeURIComponent(userTextContent)}`,
        type: "external_url",
        responseKey: "BK9",
        usesRawText: true
    },
    "chatgpt": {
        displayName: "ChatGPT (orion pro)",
        url: (query) => `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "result",
        usesRawText: true
    },
    "perplexity": {
        displayName: "Perplexity (advance)",
        url: (query) => `https://bk9.fun/ai/Perplexity?q=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "BK9.answer",
        usesRawText: true
    },
    "blackbox": {
        displayName: "Blackbox (ultra)",
        url: (query) => `https://bk9.fun/ai/gemini?q=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "BK9",
        usesRawText: true
    },
    "dbrx": {
        displayName: "DBRX (quantum)",
        url: (query) => `https://api.siputzx.my.id/api/ai/dbrx-instruct?content=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "data",
        usesRawText: true
    },
    "islamicai": {
        displayName: "Islamic AI (noor)",
        url: (query) => `https://bk9.fun/ai/Islam-ai?q=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "BK9",
        usesRawText: true
    },
    "openai": {
        displayName: "OpenAI (vapis)",
        url: (query) => `https://vapis.my.id/api/openai?q=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "result",
        usesRawText: true
    },
    "deepseekllm": {
        displayName: "DeepSeek (pro)",
        url: (query) => `https://api.siputzx.my.id/api/ai/deepseek-llm-67b-chat?content=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "data",
        usesRawText: true
    },
    "doppleai": {
        displayName: "DoppleAI (xploader)",
        url: (query) => `https://xploader-api.vercel.app/doppleai?prompt=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "response",
        usesRawText: true
    },
    "letterai": {
        displayName: "LetterAI (SiputzX)",
        url: (query) => `https://api.siputzx.my.id/api/ai/moshiai?input=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "data",
        usesRawText: true
    },
    "metaai": {
        displayName: "MetaAI (Meta)",
        url: (query) => `https://bk9.fun/ai/llama?q=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "BK9",
        usesRawText: true
    },
    "mistral": {
        displayName: "Mistral (storm)",
        url: (query) => `https://api.siputzx.my.id/api/ai/mistral-7b-instruct-v0.2?content=${encodeURIComponent(query)}`,
        type: "external_url",
        responseKey: "data",
        usesRawText: true
    },
    "generate": {
        displayName: "Image (GuruSensei)",
        url: (query) => `https://api.gurusensei.workers.dev/dream?prompt=${encodeURIComponent(query)}`,
        type: "external_url",
        responseType: "image",
        usesRawText: true,
        directImageUrl: true
    },
    "imagen": {
        displayName: "Photorealistic (Mastery)",
        url: (query) => `https://bk9.fun/ai/magicstudio?prompt=${encodeURIComponent(query)}`,
        type: "external_url",
        responseType: "image",
        usesRawText: true,
        directImageUrl: true
    },
    "imagine": {
        displayName: "Imagine X (Flux)",
        url: (query) => `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(query)}`,
        type: "external_url",
        responseType: "image",
        usesRawText: true,
        directImageUrl: true
    },
    "photoai": {
        displayName: "Realism (Dreamshaper)",
        url: (query) => `https://api.siputzx.my.id/api/ai/dreamshaper?prompt=${encodeURIComponent(query)}`,
        type: "external_url",
        responseType: "image",
        usesRawText: true,
        directImageUrl: true
    },
    "anime4k": {
        displayName: "Animes Image Generator",
        type: "hazex_multi_image",
        baseUrl: "https://img.hazex.workers.dev/",
        usesRawText: true
    }
};

// Call loadAdizaUserStates when the bot starts
loadAdizaUserStates();

// New: Helper function for typing presence
async function withTyping(Matrix, chatId, fn) {
    await Matrix.sendPresenceUpdate('composing', chatId); // Baileys specific 'composing'
    try {
        return await fn();
    } finally {
        // No explicit way to stop typing status in Baileys, it usually stops after sendMessage
    }
}

// New: Helper function to split long messages (adapted from group.js)
function splitMessage(text, maxLength = 4096) { // Max length for WhatsApp messages is higher, but 4096 is a good general split point
    if (text.length <= maxLength) {
        return [text];
    }

    const parts = [];
    let remainingText = text;
    let partNumber = 1;

    while (remainingText.length > 0) {
        const headerPlaceholderLength = 40; // For "(Part X of Y)\n\n"
        const effectiveChunkLength = maxLength - headerPlaceholderLength;

        let chunk = remainingText.substring(0, effectiveChunkLength);
        let lastSafeBreak = effectiveChunkLength;

        if (chunk.length === effectiveChunkLength) {
            let lastNewline = chunk.lastIndexOf('\n');
            let lastPeriod = chunk.lastIndexOf('.');
            let lastSpace = chunk.lastIndexOf(' ');

            const minBreakPoint = effectiveChunkLength * 0.8;

            if (lastNewline > minBreakPoint) {
                lastSafeBreak = lastNewline + 1;
            } else if (lastPeriod > minBreakPoint) {
                lastSafeBreak = lastPeriod + 1;
            } else if (lastSpace > minBreakPoint) {
                lastSafeBreak = lastSpace + 1;
            }
        }
        
        let actualChunk = remainingText.substring(0, lastSafeBreak);
        parts.push(actualChunk);
        remainingText = remainingText.substring(actualChunk.length).trimStart();
        partNumber++;
    }

    const totalParts = parts.length;
    for (let i = 0; i < totalParts; i++) {
        const partIndicator = `(Part ${i + 1} of ${totalParts})\n\n`;
        parts[i] = partIndicator + parts[i];
    }

    return parts;
}


// Ensure database has default structure if missing
global.db.data ??= {};
global.db.data.chats ??= {};
global.db.data.settings ??= {
  prefix: ".",
  mode: "public",
  autobio: false,
  anticall: false,
  autotype: false,
  autoread: false,
  welcome: false,
  blackbox: false,   
  jarvis: false, 
  perplexity: false,
  gemini: false,
  generate: false,
  dbrx: false,
  chatgpt: false,
  anime4k: false, 
  evilgpt: false, 
  
  deepseekllm: false,
  doppleai: false,
  gpt: false,
  gpt2: false,
  openai: false,
  islamicAi: false,
  imagen: false,
  imagine: false,
  letterai: false,
  llama: false,
  metaai: false,
  mistral: false,
  photoai: false,
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
  sudo: []  // <-- add sudo array here inside settings
};

global.db.data.blacklist ??= { blacklisted_numbers: [] };

// Optional: save any new defaults to disk
global.db.write();


module.exports = Matrix = async (Matrix, m, chatUpdate, store) => {
try {
const { type, quotedMsg, mentioned, now, fromMe } = m;

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

//prefix   
const prefix = global.db?.data?.settings?.prefix || ".";



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

const botNumber = await safeDecodeJid(Matrix.user.id);
const sender = m.sender;
const senderNumber = sender.split('@')[0];
const sudoList = Array.isArray(global.db.data.settings.sudo) ? global.db.data.settings.sudo : [];


const isCreator = [devMatrix, global.ownernumber, ...sudoList] // Removed botNumber from this array
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(m.sender);
const itsMe = m.sender == botNumber ? true : false;
const from = m.key.remoteJid;
const quotedMessage = m.quoted || m;
const quoted =
  quotedMessage?.mtype === "buttonsMessage"
    ? quotedMessage[Object.keys(quotedMessage)[1]]
    : quotedMessage?.mtype === "templateMessage" && quotedMessage.hydratedTemplate
    ? quotedMessage.hydratedTemplate[Object.keys(quotedMessage.hydratedTemplate)[1]]
    : quotedMessage?.mtype === "product"
    ? quotedMessage[Object.keys(quotedMessage)[0]]
    : m.quoted || m;
const mime = quoted?.msg?.mimetype || quoted?.mimetype || "";

// ======= Mode check: restrict commands to owner in private mode =======

const mode = global.db.data.settings?.mode || "private";

//console.log("[DEBUG] Current mode:", mode, "BotNumber:", botNumber, "Sender:", m.sender);

if (isCmd) {
  if (mode === "private" && !isCreator) {
    // If bot is in private mode and sender is not the creator,
    // simply return to ignore the command without sending a message.
    return; // <--- CHANGE THIS LINE
  }
  if (mode === "group" && !m.isGroup && !isCreator) {
    return await Matrix.sendMessage(from, {
      text: "⚠️ Bot is currently in *group only* mode. Commands work only in groups."
    }, { quoted: m });
  }
  if (mode === "pm" && m.isGroup && !isCreator) {
    return await Matrix.sendMessage(from, {
      text: "⚠️ Bot is currently in *private chat only* mode. Commands work only in private chats."
    }, { quoted: m });
  }
  // Public mode: no restriction
}

// =====================================================================

// Group Metadata
const groupMetadata = m.isGroup
  ? await Matrix.groupMetadata(m.chat).catch((e) => {
      console.error('Error fetching group metadata:', e);
      return null; // Return null if an error occurs
    })
  : null;

// ... rest of your code


// Ensure groupMetadata is not null before accessing its properties
const groupName = m.isGroup && groupMetadata ? groupMetadata.subject : "";
const participants = m.isGroup && groupMetadata ? groupMetadata.participants : [];
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : [];
const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
const isBot = botNumber.includes(senderNumber);
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
const groupOwner = m.isGroup && groupMetadata ? groupMetadata.owner : "";
const isGroupOwner = m.isGroup
  ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender)
  : false;

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
    const apiUrl = `https://api.giftedtech.my.id/api/download/dlmp3?apikey=${dlkey}&url=${videoUrl}`;
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
  if (typeof dlkey === 'undefined') throw new Error('API key (dlkey) is not defined.');

  const primaryApiUrl = `https://api.giftedtech.my.id/api/download/dlmp4?apikey=${dlkey}&url=${encodeURIComponent(link)}`;
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

async function saveStatusMessage(m) {
  try {
    if (!m.quoted || m.quoted.chat !== 'status@broadcast') {
      return m.reply('*Please reply to a status message!*');
    }
    await m.quoted.copyNForward(m.chat, true);
    Matrix.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    console.log('Status saved successfully!');
  } catch (error) {
    console.error('Failed to save status message:', error);
    m.reply(`Error: ${error.message}`);
  }
}

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
try {
var ppuser = await Matrix.profilePictureUrl(m.sender, 'image')} catch (err) {
let ppuser = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg'}
let ppnyauser = await getBuffer(ppuser)
let ppUrl = await Matrix.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/6880771a42bad09dd6087.jpg')

//================== [ DATABASE ] ==================//
try {
  if (from.endsWith('@g.us')) { 
    let chats = global.db.data.chats[from];
    if (typeof chats !== "object") global.db.data.chats[from] = {};
    chats = global.db.data.chats[from]; 
    if (!("antibot" in chats)) chats.antibot = false;
    if (!("anticontact" in chats)) chats.anticontact = false;
    if (!("antiaudio" in chats)) chats.antiaudio = false;
     if (!("antisticker" in chats)) chats.antisticker = false;
    if (!("antimedia" in chats)) chats.antimedia = false;
    if (!("antivirtex" in chats)) chats.antivirtex = false;
    if (!("antivirus" in chats)) chats.antivirus = false;
    if (!("antivideo" in chats)) chats.antivideo = false;
    if (!("antispam" in chats)) chats.antispam = false;
    if (!("antispam1" in chats)) chats.antispam1 = false;  
    if (!("antiimage" in chats)) chats.antiimage = false;
    if (!("antilink" in chats)) chats.antilink = false;
    if (!("badword" in chats)) chats.badword = false; 
    if (!("antilinkgc" in chats)) chats.antilinkgc = false;
    if (!("antilinkkick" in chats)) chats.antilinkkick = false;
    if (!("badwordkick" in chats)) chats.badwordkick = false;   
    if (!("antilinkgckick" in chats)) chats.antilinkgckick = false;
  }

let setting = global.db.data.settings[botNumber];
if (typeof setting !== "object") global.db.data.settings[botNumber] = {};
setting = global.db.data.settings[botNumber];

if (!("autobio" in setting)) setting.autobio = false;
if (!("autotype" in setting)) setting.autotype = false;
if (!("anticall" in setting)) setting.anticall = "off";
if (!("autoread" in setting)) setting.autoread = false;
if (!("blackbox" in setting)) setting.blackbox = false;
if (!("jarvis" in setting)) setting.jarvis = false; 
if (!("perplexity" in setting)) setting.perplexity = false;
if (!("gemini" in setting)) setting.gemini = false;
if (!("generate" in setting)) setting.generate = false;
if (!("dbrx" in setting)) setting.dbrx = false;
if (!("chatgpt" in setting)) setting.chatgpt = false;
if (!("anime4k" in setting)) setting.anime4k = false;
if (!("evilgpt" in setting)) setting.evilgpt = false;
if (!("openai" in setting)) setting.openai = false;
if (!("IslamicAi" in setting)) setting.islamicAi = false;
if (!("deepseekllm" in setting)) setting.deepseekllm = false;
if (!("doppleai" in setting)) setting.doppleai = false;
if (!("gpt" in setting)) setting.gpt = false;
if (!("gpt2" in setting)) setting.gpt2 = false;
if (!("imagen" in setting)) setting.imagen = false;
if (!("imagine" in setting)) setting.imagine = false;
if (!("letterai" in setting)) setting.letterai = false;
if (!("llama" in setting)) setting.llama = false;
if (!("metaai" in setting)) setting.metaai = false;
if (!("mistral" in setting)) setting.mistral = false;
if (!("photoai" in setting)) setting.photoai = false;

if (!("statusemoji" in setting)) setting.statusemoji = "❤";
if (!("welcome" in setting)) setting.welcome = false;
if (!("autoreact" in setting)) setting.autoreact = false;
if (!("antidelete" in setting)) setting.antidelete = "private";
if (!("mode" in setting)) setting.mode = "private";
if (!("antiedit" in setting)) setting.antiedit = "private";
if (!("alwaysonline" in setting)) setting.alwaysonline = false;
if (!("autorecord" in setting)) setting.autorecord = false;
if (!("autoviewstatus" in setting)) setting.autoviewstatus = false;
if (!("autoreactstatus" in setting)) setting.autoreactstatus = false;
if (!("autorecordtype" in setting)) setting.autorecordtype = false;


  let blacklist = global.db.data.blacklist;
  if (!blacklist || typeof blacklist !== "object") global.db.data.blacklist = { blacklisted_numbers: [] };

} catch (err) {
  console.error("Error initializing database:", err);
}

//================== [ CONSOLE LOG] ==================//
const timezones = global.db.data.settings.timezone || 'Africa/Accra';
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
//<================================================>//
    //auto set bio\\
    if (db.data.settings[botNumber].autobio) {
    
         let xdpy = moment(Date.now()).tz(`${timezones}`).locale('en').format('dddd');
         let xtipe = moment(Date.now()).tz(`${timezones}`).locale('en').format('HH:mm z');
         let xdpte = moment(Date.now()).tz(`${timezones}`).format("DD/MM/YYYY");
        
     Matrix.updateProfileStatus(
        `${xtipe}, ${xdpy}; ${xdpte}:- ${botname}`
      ).catch((_) => _);
  }
//<================================================>//
    //auto type record
    if (db.data.settings[botNumber].autorecordtype) {
      if (m.message) {
        let XpBotmix = ["composing", "recording"];
        XpBotmix2 = XpBotmix[Math.floor(XpBotmix.length * Math.random())];
        Matrix.sendPresenceUpdate(XpBotmix2, from);
      }
    }
    if (db.data.settings[botNumber].autorecord) {
      if (m.message) {
        let XpBotmix = ["recording"];
        XpBotmix2 = XpBotmix[Math.floor(XpBotmix.length * Math.random())];
        Matrix.sendPresenceUpdate(XpBotmix2, from);
      }
    }
    if (db.data.settings[botNumber].autotype) {
      if (m.message) {
        let XpBotpos = ["composing"];
        Matrix.sendPresenceUpdate(XpBotpos, from);
      }
    }   
//<================================================>//
    if (from.endsWith('@g.us') && db.data.chats[m.chat].antibot) {
  if (m.isBaileys && (!isAdmins || !isCreator || isBotAdmins )) {
          m.reply(`*BOT DETECTED*\n\nGo away!`);
          await Matrix.groupParticipantsUpdate(
            m.chat,
            [m.sender],
            "remove"
          );
        }
    }
    
    
//<================================================>//
//Message Handler-mesaages.upsert//
//<================================================>//


//<================================================>//
//Message Handler-mesaages.upsert//
//<================================================>//

Matrix.ev.on("messages.upsert", async (data) => {
    const message = data.messages[0];
    if (!message || !message.message) return;

    const botNumber = safeDecodeJid(Matrix.user.id);
    const isGroup = message.key.remoteJid.endsWith("@g.us");
    const isSenderBot = message.key.participant === botNumber;
    const sender = message.sender || message.key.participant || message.key.remoteJid;
    const messageId = message.key.id;

    // Prevent duplicate replies
    if (lastProcessedMessageId[sender] === messageId) return;
    lastProcessedMessageId[sender] = messageId;

    const safeChatId = safeDecodeJid(message.chat);
    if (!safeChatId) return;

    const prefix = global.db?.data?.settings?.prefix || ".";

    // --- Extract text/caption ---
    const originalUserTextContent = (
        message.message.extendedTextMessage?.text ||
        message.message.conversation ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption ||
        message.message.documentMessage?.caption || ""
    ).trim();

    // Normalize message: lowercase, collapse spaces, trim
    const msgText = originalUserTextContent.toLowerCase().replace(/\s+/g, ' ').trim();

    // Regex: matches .adizachat off, . adizachat off, .   adizachat off, etc.
    const adizachatRegex = new RegExp(`^\\s*\\${prefix}\\s*adizachat\\s*(on|off)?\\s*$`, 'i');
    const adizachatMatch = msgText.match(adizachatRegex);

    if (adizachatMatch) {
        const action = adizachatMatch[1]?.toLowerCase();
        if (action === 'off') {
            await Matrix.sendMessage(safeChatId, { text: "❌ Adizachat disabled for you." }, { quoted: message });
            return;
        }
        if (action === 'on') {
            await Matrix.sendMessage(safeChatId, { text: "✅ Adizachat enabled for you." }, { quoted: message });
            return;
        }
        // Just ".adizachat" or ". adizachat"
        await Matrix.sendMessage(safeChatId, { text: "ℹ️ Use `.adizachat on` or `.adizachat off` to enable or disable Adizachat." }, { quoted: message });
        return;
    }
    // --- END COMMAND FILTER ---

    // --- AI LOGIC STARTS HERE ---
    const userState = getUserApiState(sender);

    // --- DEBUG LOGGING ---
    console.log("\n--- MESSAGE PROCESSING START ---");
    console.log(`[DEBUG] Sender: ${sender}`);
    console.log(`[DEBUG] Chat ID: ${safeChatId}`);
    console.log(`[DEBUG] Is Group: ${isGroup}`);
    console.log(`[DEBUG] Message Text (original): '${originalUserTextContent}'`);
    console.log(`[DEBUG] Message Text (normalized): '${msgText}'`);
    console.log(`[DEBUG] AdizaUserStates:`, userState);
    console.log(`[DEBUG] mainOwner: ${mainOwner}`);
    console.log(`[DEBUG] botNumber: ${botNumber}`);
    // --- END DEBUG LOGGING ---

    const selectedKey = msgText.startsWith(prefix) ? msgText.substring(prefix.length).toLowerCase() : null;
    const isOwnerSelfChat = !isGroup && sender === mainOwner && safeChatId === mainOwner;

    // --- RESET COMMAND (works anywhere, always confirms) ---
    if (
        (originalUserTextContent.trim().toLowerCase() === `${prefix}reset`) ||
        (msgText === "reset")
    ) {
        chatHistory[sender] = {};
        await Matrix.sendMessage(safeChatId, { text: "✅ Chat history has been reset!" }, { quoted: message });
        console.log(`[AI_RESPONSE] Chat history reset for ${sender}.`);
        return;
    }

    // --- Model selection block (unchanged, keep your own logic here) ---

    if (userState.enabled && message.chat === sender && !isSenderBot) {
        // --- Detect media/files ---
        const hasMedia =
            !!message.message.imageMessage ||
            !!message.message.videoMessage ||
            !!message.message.documentMessage ||
            !!message.message.audioMessage;
        console.log(`[DEBUG] hasMedia: ${hasMedia}`);
        if (hasMedia) {
            if (message.message.imageMessage) console.log("[DEBUG] Detected imageMessage");
            if (message.message.videoMessage) console.log("[DEBUG] Detected videoMessage");
            if (message.message.documentMessage) console.log("[DEBUG] Detected documentMessage");
            if (message.message.audioMessage) console.log("[DEBUG] Detected audioMessage");
        }

        if (!originalUserTextContent && !hasMedia) {
            console.log("[AI_RESPONSE] No text or processable media found for AI. Skipping.");
            return;
        }

        if (!chatHistory[sender]) chatHistory[sender] = {};
        if (!chatHistory[sender].conversations) chatHistory[sender].conversations = [];

        let responseText = null;
        const selectedApiInfo = AVAILABLE_APIS[userState.currentApi];
        const isGeminiSelected = (selectedApiInfo && selectedApiInfo.type === "gemini_sdk");

        let geminiInputParts = [];
        let generativePart = null;
        if (isGeminiSelected && geminiApiKey && geminiModel) {
            if (hasMedia) {
                console.log(`[Gemini] User sent media. Attempting fileToGenerativePart...`);
                generativePart = await fileToGenerativePart(message, Matrix);
                console.log("[DEBUG] generativePart:", generativePart);
            }
            // Build Gemini input parts: text first, then media/file
            if (originalUserTextContent) geminiInputParts.push({ text: originalUserTextContent });
            if (generativePart) geminiInputParts.push(generativePart);

            // --- DEBUG: Log Gemini input parts ---
            console.log("[DEBUG] Gemini input parts to send:", JSON.stringify(geminiInputParts, null, 2));

            if (geminiInputParts.length === 0) {
                console.log("[Gemini] No valid input for Gemini to process.");
                await Matrix.sendMessage(safeChatId, { text: "❌ I couldn't process your file or message. Try again with a supported file or a different question." }, { quoted: message });
                return;
            }
        } else if (!originalUserTextContent) {
            console.log("[AI_RESPONSE] No valid text or processable media for non-Gemini AI. Skipping.");
            return;
        }

        // Store user's current message in history.
        if (isGeminiSelected && geminiInputParts.length > 0) {
            chatHistory[sender].conversations.push({ role: "user", parts: geminiInputParts });
        } else if (originalUserTextContent) {
            chatHistory[sender].conversations.push({ role: "user", content: originalUserTextContent });
        }
        if (chatHistory[sender].conversations.length > 12) {
            chatHistory[sender].conversations = chatHistory[sender].conversations.slice(-12);
        }

        if (!selectedApiInfo) {
            await Matrix.sendMessage(safeChatId, { text: `❌ An internal error occurred: No valid AI model selected or configured. Please try \`${prefix}adizachat on\` to select one.` }, { quoted: message });
            return;
        }

        await withTyping(Matrix, safeChatId, async () => {
            try {
                if (selectedApiInfo.type === "gemini_sdk") {
                    if (!geminiApiKey || !geminiModel) {
                        throw new Error("Gemini API Key is not configured or model not initialized.");
                    }
                    if (geminiInputParts.length === 0) {
                        throw new Error("No valid input for Gemini to process.");
                    }

                    let historyForGemini = chatHistory[sender].conversations
                        .slice(0, -1)
                        .filter(entry => entry.role === "user" || entry.role === "assistant")
                        .map(entry => {
                            if (entry.parts) {
                                return { role: entry.role === "user" ? "user" : "model", parts: entry.parts };
                            } else if (entry.content) {
                                return { role: entry.role === "user" ? "user" : "model", parts: [{ text: entry.content }] };
                            }
                            return null;
                        })
                        .filter(entry => entry !== null);

                    while (historyForGemini.length > 0 && historyForGemini[0].role !== "user") {
                        historyForGemini.shift();
                    }

                    const chat = geminiModel.startChat({
                        history: historyForGemini.length > 0 ? historyForGemini : undefined,
                        safetySettings: geminiModel.safetySettings,
                    });

                    const currentUserInputParts = chatHistory[sender].conversations[chatHistory[sender].conversations.length - 1]?.parts;
                    if (!currentUserInputParts || currentUserInputParts.length === 0) {
                        throw new Error("No valid parts found in the current user message for Gemini.");
                    }

                    await Matrix.sendMessage(safeChatId, { react: { text: "✨", key: message.key } });
                    const result = await chat.sendMessage(currentUserInputParts);
                    const response = await result.response;
                    responseText = response.text();
                    console.log(`[Gemini] Response received for ${sender.split('@')[0]}: ${responseText.substring(0, Math.min(responseText.length, 50))}...`);

                } else if (selectedApiInfo.type === "external_url") {
                    let queryToSend = selectedApiInfo.usesRawText ? originalUserTextContent : chatHistory[sender].conversations.map(x => {
                        if (x.parts && x.parts[0] && x.parts[0].text) return `${x.role}: ${x.parts[0].text}`;
                        if (x.content) return `${x.role}: ${x.content}`;
                        return '';
                    }).filter(Boolean).join("\n");
                    let apiUrl = selectedApiInfo.url(queryToSend);

                    if (selectedApiInfo.responseType === "image") {
                        await Matrix.sendMessage(safeChatId, { react: { text: "🎨", key: message.key } });
                        if (selectedApiInfo.directImageUrl) {
                            await Matrix.sendMessage(safeChatId, { image: { url: apiUrl }, caption: `Image generated by *${selectedApiInfo.displayName}* for: "${originalUserTextContent}"` }, { quoted: message });
                        } else {
                            const res = await axios.get(apiUrl);
                            const data = res.data;
                            let imageUrl = selectedApiInfo.responseKey ? selectedApiInfo.responseKey.split('.').reduce((o, k) => (o || {})[k], data) : (data?.url || data?.image || data?.photo || data);
                            if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
                                await Matrix.sendMessage(safeChatId, { image: { url: imageUrl }, caption: `Image generated by *${selectedApiInfo.displayName}* for: "${originalUserTextContent}"` }, { quoted: message });
                            } else {
                                throw new Error("Image API returned invalid URL or no image.");
                            }
                        }
                        responseText = null;
                    } else {
                        await Matrix.sendMessage(safeChatId, { react: { text: "💬", key: message.key } });
                        const res = await axios.get(apiUrl);
                        const data = res.data;
                        let extractedResponse = selectedApiInfo.responseKey ? selectedApiInfo.responseKey.split('.').reduce((o, k) => (o || {})[k], data) : (data?.result || data?.response || data?.data || data?.BK9 || null);

                        if (extractedResponse) {
                            responseText = extractedResponse;
                        } else {
                            throw new Error("API returned empty or unparseable response.");
                        }
                    }
                } else if (selectedApiInfo.type === "hazex_multi_image") {
                    await Matrix.sendMessage(safeChatId, { react: { text: "🖼️", key: message.key } });
                    const numPhotos = 6;
                    const mediaMessages = [];
                    for (let i = 0; i < numPhotos; i++) {
                        const uniquePrompt = `${originalUserTextContent} - ${Date.now() + i}`;
                        const imageUrl = `${selectedApiInfo.baseUrl}?prompt=${encodeURIComponent(uniquePrompt)}`;
                        mediaMessages.push({ image: { url: imageUrl }, caption: i === 0 ? `🖼️ Generated by *${selectedApiInfo.displayName}* for: *${originalUserTextContent}*` : undefined });
                    }
                    for (const mediaMsg of mediaMessages) {
                        await Matrix.sendMessage(safeChatId, mediaMsg, { quoted: message });
                        await delay(500);
                    }
                    responseText = null;
                } else if (selectedApiInfo.type === "command_mode") {
                    await Matrix.sendMessage(safeChatId, { text: `*${selectedApiInfo.displayName}* mode is active. This mode might require a specific command. Please check bot commands.` }, { quoted: message });
                    responseText = null;
                }
            } catch (e) {
                let errorMessage = "Sorry, I couldn't process that. ";
                if (e.response && e.response.status === 429) {
                    errorMessage = "I'm receiving too many requests right now. Please try again in a moment!";
                } else if (e.message.includes("400 Bad Request") || e.message.includes("blocked") || e.message.includes("invalid input")) {
                    errorMessage += "It might contain content that violates safety guidelines, or there was an issue with the input. Please try a different query or file.";
                } else if (e.message.includes("No valid input") || e.message.includes("No valid parts")) {
                    errorMessage += "I couldn't process your input (maybe the file type isn't supported).";
                } else if (e.message.includes("Gemini API Key is not configured")) {
                    errorMessage = "My Gemini model is not configured. Please contact the bot owner.";
                } else {
                    errorMessage += `Error: \`${String(e.message).substring(0, 100)}\``;
                }
                // No model disabling/blocking! User can try again immediately.
                await Matrix.sendMessage(safeChatId, { text: errorMessage }, { quoted: message });
                return;
            }
        });

        if (responseText) {
            if (isGeminiSelected) {
                chatHistory[sender].conversations.push({ role: "assistant", parts: [{ text: responseText }] });
            } else {
                chatHistory[sender].conversations.push({ role: "assistant", content: responseText });
            }
            const messageParts = splitMessage(responseText);
            for (const part of messageParts) {
                await Matrix.sendMessage(safeChatId, { text: part }, { quoted: message });
                await delay(200);
            }
        } else if (responseText === null) {
            // Do nothing if responseText is null (e.g., for image generation or handled media replies)
        } else {
            await Matrix.sendMessage(safeChatId, { text: "❌ I'm having trouble generating a response right now. Please try again later!" }, { quoted: message });
        }
    }
    console.log("--- MESSAGE PROCESSING END ---\n");
});

//<================================================>//


//<================================================>//

global.contactCounts = global.contactCounts || {};

 if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.anticontact) {
  const msg = m.message || {};
  const chatId = m.chat;
  const senderId = m.sender;
  const isAdmin = (await getGroupAdmins(chatId)).includes(senderId);

  const isContact = msg.contactMessage || msg.contactsArrayMessage;

  if (isContact && !isAdmin) {
    const currentTimestamp = m.messageTimestamp * 1000;
    global.contactCounts[senderId] = global.contactCounts[senderId] || { count: 0, lastTimestamp: 0 };

    const userData = global.contactCounts[senderId];

    if (currentTimestamp - userData.lastTimestamp <= 10000) {
      userData.count++;
    } else {
      userData.count = 1;
    }
    userData.lastTimestamp = currentTimestamp;

    // Delete the contact message
    await Matrix.sendMessage(chatId, {
      delete: {
        remoteJid: chatId,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    });

    if (userData.count === 1) {
      await Matrix.sendMessage(chatId, {
        text: "CONTACT BLOCKED\n\n@" + senderId.split("@")[0] + " *Only admins are allowed to send contacts in this group!*",
        contextInfo: {
          mentionedJid: [senderId]
        }
      }, { quoted: m });
    } else if (userData.count >= 2) {
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split('@')[0]} has been kicked for repeatedly sending contacts.`,
          contextInfo: {
            mentionedJid: [senderId]
          }
        });
        delete global.contactCounts[senderId];
      } catch (kickError) {
        console.error("Error kicking user:", kickError);
      }
    }
  }
}
//<================================================>//
const storeFile = "./src/store.json";

function loadStoredMessages() {
    if (fs.existsSync(storeFile)) {
        return JSON.parse(fs.readFileSync(storeFile));
    }
    return {};
}

//*---------------------------------------------------------------*//

if (
    m.message?.protocolMessage?.type === 0 && 
    m.message?.protocolMessage?.key
) {
    if (global.antidelete === 'off') {
        // Anti-delete is disabled, do nothing
        return;
    }

    if (global.antidelete === 'private') {
        try {
            let messageId = m.message.protocolMessage.key.id;
            let chatId = m.chat;
            let deletedBy = m.sender;

            let storedMessages = loadStoredMessages();
            let deletedMsg = storedMessages[chatId]?.[messageId];

            if (!deletedMsg) {
                console.log("⚠️ Deleted message not found in database.");
                return;
            }

            let sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;

            let chatName;
            if (deletedMsg.key.remoteJid === 'status@broadcast') {
                chatName = "Status Update";
            } else if (m.isGroup) {
                try {
                    const groupInfo = await Matrix.groupMetadata(m.chat);
                    chatName = groupInfo.subject || "Group Chat";
                } catch {
                    chatName = "Group Chat";
                }
            } else {
                chatName = deletedMsg.pushName || m.pushName || "Private Chat";
            }

            let xtipes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).locale('en').format('HH:mm z');
            let xdptes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).format("DD/MM/YYYY");

            if (!deletedMsg.message.conversation && !deletedMsg.message.extendedTextMessage) {
                try {
                    let forwardedMsg = await Matrix.sendMessage(
                        Matrix.user.id,
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
                        Matrix.user.id, 
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
                        Matrix.user.id,
                        { text: replyText, mentions: [sender, deletedBy] },
                        { quoted: quotedMessage }
                    );
                }
            } 
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
                    Matrix.user.id,
                    { text: replyText, mentions: [sender, deletedBy] },
                    { quoted: quotedMessage }
                );
            }

        } catch (err) {
            console.error("❌ Error processing deleted message:", err);
        }
    } else if (
        m.sender !== botNumber &&
        global.antidelete === 'chat'
    ) {
        try {
            let messageId = m.message.protocolMessage.key.id;
            let chatId = m.chat;
            let deletedBy = m.sender;

            let storedMessages = loadStoredMessages();
            let deletedMsg = storedMessages[chatId]?.[messageId];

            if (!deletedMsg) {
                console.log("⚠️ Deleted message not found in database.");
                return;
            }

            let sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;

            let chatName;
            if (deletedMsg.key.remoteJid === 'status@broadcast') {
                chatName = "Status Update";
            } else if (m.isGroup) {
                try {
                    const groupInfo = await Matrix.groupMetadata(m.chat);
                    chatName = groupInfo.subject || "Group Chat";
                } catch {
                    chatName = "Group Chat";
                }
            } else {
                chatName = deletedMsg.pushName || m.pushName || "Private Chat";
            }

            let xtipes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).locale('en').format('HH:mm z');
            let xdptes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).format("DD/MM/YYYY");

            if (!deletedMsg.message.conversation && !deletedMsg.message.extendedTextMessage) {
                try {
                    let forwardedMsg = await Matrix.sendMessage(
                        m.chat,
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
                        m.chat, 
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
                        m.chat,
                        { text: replyText, mentions: [sender, deletedBy] },
                        { quoted: quotedMessage }
                    );
                }
            } 
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
                    m.chat,
                    { text: replyText, mentions: [sender, deletedBy] },
                    { quoted: quotedMessage }
                );
            }

        } catch (err) {
            console.error("❌ Error processing deleted message:", err);
        }
    }
}
//<================================================>//
// ==================== ANTI-EDIT FEATURE ====================

if (
  m.sender !== botNumber &&
  !m.id.startsWith("3EB0") &&
  (
    db.data.settings.antiedit === "private" ||
    db.data.settings.antiedit === "chat"
  ) &&
  (
    m.message?.protocolMessage?.editedMessage?.conversation ||
    m.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text
  )
) {
  try {
    const editedMsgId = m.message.protocolMessage.key.id;
    const chatId = m.chat;
    const editor = m.sender;

    // Get the original message from Baileys store
    const originalMsgObj = store.messages[chatId]?.get(editedMsgId);

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

    const chatType = chatId.endsWith("@g.us") ? "(Group Chat)" : "(Private Chat)";
    const editedTo =
      m.message.protocolMessage?.editedMessage?.conversation ||
      m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text;

    const antiEditMsg =
      `🚨 *EDITED MESSAGE!* 🚨\n${readmore}` +
      `\nCHAT: ${chatType}` +
      `\nSENT BY: @${originalSender.split("@")[0]}` +
      `\nSENT ON: ${timeSent}` +
      `\nDATE SENT: ${dateSent}` +
      `\nEDITED BY: @${editor.split("@")[0]}` +
      `\n\nORIGINAL MSG: ${originalText}` +
      `\n\nEDITED TO: ${editedTo}`;

    // === PRIVATE MODE: Send to yourself ===
    if (db.data.settings.antiedit === "private") {
      if (originalMsgObj) {
        const quotedObj = {
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
      } else {
        await Matrix.sendMessage(Matrix.user.id, {
          text: antiEditMsg,
          mentions: [originalSender, editor]
        });
      }
    }

    // === CHAT MODE: Send to the current chat (group or private) ===
    if (db.data.settings.antiedit === "chat") {
      if (originalMsgObj) {
        const quotedObj = {
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
      } else {
        await Matrix.sendMessage(chatId, {
          text: antiEditMsg,
          mentions: [originalSender, editor]
        });
      }
    }

    // === OFF MODE: Do nothing ===
    // (No code needed, as this block won't run if antiedit is "off")

  } catch (err) {
    console.error("❌ Error processing edited message:", err);
  }
}

//<================================================>//
Matrix.ev.on('call', async (callEvent) => {
  const mode = global.db.data.settings?.anticall;

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
  const isAdmin   = (await getGroupAdmins(chatId)).includes(senderId);

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

  // If there's no media or user is admin, do nothing
  if (!hasMedia || isAdmin) return;

  const now = m.messageTimestamp * 1000;
  global.mediaCounts[senderId] = global.mediaCounts[senderId] || { count: 0, lastTimestamp: 0 };
  const userData = global.mediaCounts[senderId];

  if (now - userData.lastTimestamp <= 10000) {
    userData.count++;
  } else {
    userData.count = 1;
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
  });

  if (userData.count === 1) {
    // First offense: warning
    await Matrix.sendMessage(chatId, {
      text: `🚫 MEDIA BLOCKED\n\n@${senderId.split('@')[0]} *Only admins are allowed to send media in this group!*`,
      contextInfo: { mentionedJid: [senderId] }
    }, { quoted: m });
  } else {
    // Second offense: kick
    try {
      await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
      await Matrix.sendMessage(chatId, {
        text: `@${senderId.split('@')[0]} has been removed for repeatedly sending media.`,
        contextInfo: { mentionedJid: [senderId] }
      });
      delete global.mediaCounts[senderId];
    } catch (err) {
      console.error('Error kicking user:', err);
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
  const isAdmin    = (await getGroupAdmins(chatId)).includes(senderId);

  if (isVideo && !isAdmin) {
    const now       = m.messageTimestamp * 1000;
    global.videoCounts[senderId] = global.videoCounts[senderId] || { count: 0, lastTimestamp: 0 };
    const userData  = global.videoCounts[senderId];

    if (now - userData.lastTimestamp <= 10000) {
      userData.count++;
    } else {
      userData.count = 1;
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
    });

    if (userData.count === 1) {
      // First offense: warning
      await Matrix.sendMessage(chatId, {
        text: `🚫 VIDEO BLOCKED\n\n@${senderId.split('@')[0]} *Only admins are allowed to send videos in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m });
    } else if (userData.count >= 2) {
      // Second offense: kick and announce
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split('@')[0]} has been removed for repeatedly sending videos.`,
          contextInfo: { mentionedJid: [senderId] }
        });
        delete global.videoCounts[senderId];
      } catch (kickError) {
        console.error('Error kicking user:', kickError);
      }
    }
  }
}
//<================================================>//
global.audioCounts = global.audioCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antiaudio) {
  const msg       = m.message || {};
  const chatId    = m.chat;
  const senderId  = m.sender;
  const isAudio   = msg.audioMessage;
  const isAdmin   = (await getGroupAdmins(chatId)).includes(senderId);

  if (isAudio && !isAdmin) {
    const now      = m.messageTimestamp * 1000;
    global.audioCounts[senderId] = global.audioCounts[senderId] || { count: 0, lastTimestamp: 0 };
    const userData = global.audioCounts[senderId];

    if (now - userData.lastTimestamp <= 10000) {
      userData.count++;
    } else {
      userData.count = 1;
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
    });

    if (userData.count === 1) {
      // First offense: warning
      await Matrix.sendMessage(chatId, {
        text: `🚫 AUDIO BLOCKED\n\n@${senderId.split('@')[0]} *Only admins are allowed to send audios in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m });
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
        console.error('Error kicking user:', kickError);
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
  const isAdmin   = (await getGroupAdmins(chatId)).includes(senderId);
  const isImage   = msg.imageMessage;

  if (isImage && !isAdmin && !isBotAdmins && !isCreator) {
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
    });

    if (userData.count === 1) {
      // First offense: warning
      await Matrix.sendMessage(chatId, {
        text: `🚫 IMAGE BLOCKED\n\n@${senderId.split('@')[0]} *Only admins are allowed to send images in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m });
    } else if (userData.count >= 2) {
      // Second offense: kick
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split('@')[0]} has been removed for repeatedly sending images.`,
          contextInfo: { mentionedJid: [senderId] }
        });
        delete global.imageCounts[senderId];
      } catch (err) {
        console.error('Error kicking user:', err);
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
  const isAdmin   = (await getGroupAdmins(chatId)).includes(senderId);

  const isSticker = msg.stickerMessage;
  if (isSticker && !isAdmin) {
    const now = m.messageTimestamp * 1000;
    global.stickerCounts[senderId] = global.stickerCounts[senderId] || { count: 0, lastTimestamp: 0 };

    const userData = global.stickerCounts[senderId];
    if (now - userData.lastTimestamp <= 10000) {
      userData.count++;
    } else {
      userData.count = 1;
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
    });

    if (userData.count === 1) {
      // First offense: warning
      await Matrix.sendMessage(chatId, {
        text: `STICKER BLOCKED\n\n@${senderId.split("@")[0]} *Only admins are allowed to send stickers in this group!*`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: m });
    } else if (userData.count >= 2) {
      // Second offense: kick
      try {
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        await Matrix.sendMessage(chatId, {
          text: `@${senderId.split("@")[0]} has been kicked for repeatedly sending stickers.`,
          contextInfo: { mentionedJid: [senderId] }
        });
        delete global.stickerCounts[senderId];
      } catch (kickError) {
        console.error("Error kicking user:", kickError);
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
  const isAdmin   = (await getGroupAdmins(chatId)).includes(senderId);

  // Suspicious virtex check: long text or zero-width chars
  const ZWS_REGEX = /[\u2060\u200b\u200e\u202e\u202d]/;
  if (!text || isAdmin || (text.length <= 4000 && !ZWS_REGEX.test(text))) return;

  // Track count (optional)
  global.antivirtexCounts[senderId] = (global.antivirtexCounts[senderId] || 0) + 1;

  try {
    // Delete the offending message
    await Matrix.sendMessage(chatId, {
      delete: {
        remoteJid: chatId,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant
      }
    });

    // Kick the sender
    await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');

    // Announce removal
    await Matrix.sendMessage(chatId, {
      text: `🚫 @${senderId.split('@')[0]} removed for sending a crash message.`,
      contextInfo: { mentionedJid: [senderId] }
    });
  } catch (err) {
    console.error('Error enforcing antivirtex:', err);
  }
}
//<================================================>/
global.spamCounts = global.spamCounts || {};

if (m.chat.endsWith('@g.us') && db.data.chats[m.chat]?.antispam) {
  const chatId   = m.chat;
  const senderId = m.sender;
  const now      = m.messageTimestamp * 1000;
  const isAdmin  = (await getGroupAdmins(chatId)).includes(senderId);

  if (!isAdmin) {
    global.spamCounts[senderId] = global.spamCounts[senderId] || {
      count: 0,
      lastTimestamp: 0,
      offenseCount: 0
    };
    const userData = global.spamCounts[senderId];

    // Count messages in 3-second windows
    if (now - userData.lastTimestamp <= 3000) {
      userData.count++;
    } else {
      userData.count = 1;
    }
    userData.lastTimestamp = now;

    if (userData.count >= 5) {
      userData.offenseCount++;

      // Delete the spam message
      await Matrix.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      });

      if (userData.offenseCount === 1) {
        // First offense: warning
        await Matrix.sendMessage(chatId, {
          text: `⚠️ SPAM WARNING\n\n@${senderId.split('@')[0]} You're sending messages too fast. Please slow down or you'll be removed.`,
          contextInfo: { mentionedJid: [senderId] }
        }, { quoted: m });

      } else {
        // Second offense: kick
        try {
          await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
          await Matrix.sendMessage(chatId, {
            text: `🚫 @${senderId.split('@')[0]} has been kicked for spamming.`,
            contextInfo: { mentionedJid: [senderId] }
          });
          delete global.spamCounts[senderId];
        } catch (err) {
          console.error('Error kicking user:', err);
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
  const isAdmin  = (await getGroupAdmins(chatId)).includes(senderId);

  if (!isAdmin) {
    const user = (global.antispam1Counts[senderId] =
      global.antispam1Counts[senderId] || {
        count: 0,
        lastTimestamp: 0,
        blockedUntil: 0,
        deleteCount: 0,
        unblockTimer: null
      });

    // Still in block window → delete 8th/9th or kick on 10th
    if (now <= user.blockedUntil) {
      if (user.deleteCount < 2) {
        await Matrix.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
          }
        });
        user.deleteCount++;
      } else {
        await Matrix.sendMessage(chatId, {
          text: `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  🚫 *KICKED FOR SPAMMING* 🚫  
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ @${senderId.split("@")[0]} has been
┃ removed for repeated spamming.
┗━━━━━━━━━━━━━━━━━━━━━━┛`,
          contextInfo: { mentionedJid: [senderId] }
        });
        await Matrix.groupParticipantsUpdate(chatId, [senderId], 'remove');
        clearTimeout(user.unblockTimer);
        delete global.antispam1Counts[senderId];
      }
      return;
    }

    // Rolling window count reset
    if (now - user.lastTimestamp > 10000) {
      user.count = 1;
      user.deleteCount = 0;
    } else {
      user.count++;
    }
    user.lastTimestamp = now;

    // 6th message → warn
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
      }, { quoted: m });
      return;
    }

    // 7th message → block for 10 min & schedule unblock
    if (user.count === 7) {
      user.blockedUntil = now + 10 * 60 * 1000;
      user.deleteCount = 0;
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
      });
      user.unblockTimer = setTimeout(async () => {
        const liftT = user.blockedUntil;
        const liftDate = new Date(liftT);
        const unblockDateStr = liftDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Accra' });
        const unblockTimeStr = liftDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Africa/Accra' });
        await Matrix.sendMessage(chatId, { text: `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✅ *BLOCK LIFTED* ✅  
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ @${senderId.split("@")[0]} is now unblocked.
┃ Please avoid spamming again.
┃
┃ 📅 ${unblockDateStr}
┃ ⏰ ${unblockTimeStr}
┗━━━━━━━━━━━━━━━━━━━━━━┛` });
        await Matrix.sendMessage(senderId, { text: `┏━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✅ *BLOCK LIFTED* ✅  
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ You're now unblocked.
┃ Please avoid spamming again.
┃
┃ 📅 ${unblockDateStr}
┃ ⏰ ${unblockTimeStr}
┗━━━━━━━━━━━━━━━━━━━━━━┛` });
        delete global.antispam1Counts[senderId];
      }, user.blockedUntil - now);
      return;
    }
  }
}
//<================================================>//
if (from.endsWith('@g.us') && db.data.chats[m.chat].antilinkgc) {
    const groupLinkRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/\S+/i; 

    if (m.message && groupLinkRegex.test(budy)) {
        if (isAdmins || isCreator || !isBotAdmins) return; 

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
//<================================================>//
const { commandEmojis, messageEmojis } = require("./lib/emojis");

const randomCommandEmoji = commandEmojis[Math.floor(Math.random() * commandEmojis.length)];
const randomMessageEmoji = messageEmojis[Math.floor(Math.random() * messageEmojis.length)];

// Cooldown map to track last reaction time per chat
const reactionCooldowns = new Map();
const REACTION_COOLDOWN_MS = 10000; // 10 seconds (10000 milliseconds)

if (isCmd && db.data.settings.autoreact === "command") {
  // Check cooldown before sending reaction
  if (!reactionCooldowns.has(m.chat) || (Date.now() - reactionCooldowns.get(m.chat) > REACTION_COOLDOWN_MS)) {
    try {
      await Matrix.sendMessage(m.key.remoteJid, {
        react: {
          text: randomCommandEmoji,
          key: m.key
        }
      });
      reactionCooldowns.set(m.chat, Date.now()); // Update last reaction time
    } catch (err) {
      console.error("❌ Error sending command reaction:", err);
    }
  }
} else if (m.message) {
  // Check cooldown before sending reaction
  if (!reactionCooldowns.has(m.chat) || (Date.now() - reactionCooldowns.get(m.chat) > REACTION_COOLDOWN_MS)) {
    try {
      const mode = db.data.settings.autoreact;
      if (
        mode === "all" ||
        (mode === "group" && m.isGroup) ||
        (mode === "pm" && !m.isGroup)
      ) {
        await Matrix.sendMessage(m.key.remoteJid, {
          react: {
            text: randomMessageEmoji,
            key: m.key
          }
        });
        reactionCooldowns.set(m.chat, Date.now()); // Update last reaction time
      }
    } catch (err) {
      console.error("❌ Error sending message reaction:", err);
    }
  }
}


//<================================================>//

if (from.endsWith('@g.us') && db.data.chats[m.chat].antilinkgckick) {
  const groupLinkRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/\S+/i; 
  
    if (m.message && groupLinkRegex.test(budy)) {
        if (isAdmins || isCreator || !isBotAdmins) return;
    {
        if (isAdmins || isCreator || !isBotAdmins) return;
        await Matrix.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant,
            },
        });
        Matrix.sendMessage(
            from,
            {
                text: `GROUP LINK DETECTED\n\n@${m.sender.split("@")[0]} *Beware, group links are not allowed in this group!*`,
                contextInfo: { mentionedJid: [m.sender] },
            },
            { quoted: m }
        );
      await Matrix.groupParticipantsUpdate(
            m.chat,
            [m.sender],
            "remove"
          );
    }
}
}
//<================================================>//
if (from.endsWith('@g.us') && db.data.chats[m.chat].antilink) {
    const linkRegex = /(?:https?:\/\/|www\.|t\.me\/|bit\.ly\/|tinyurl\.com\/|(?:[a-z0-9]+\.)+[a-z]{2,})(\/\S*)?/i;

    const messageContent = 
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        m.message?.pollCreationMessageV3?.name ||
        m.message?.protocolMessage?.editedMessage?.conversation ||
        m.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
        m.message?.protocolMessage?.editedMessage?.imageMessage?.caption ||
        m.message?.protocolMessage?.editedMessage?.videoMessage?.caption ||
        m.message?.protocolMessage?.editedMessage || 
        pollMessageData; 

    if (messageContent && linkRegex.test(messageContent)) {
        if (isAdmins || isCreator || !isBotAdmins) return; 

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
//<================================================>//
if (from.endsWith('@g.us') && db.data.chats[m.chat].antilinkkick) {
    const linkRegex = /(?:https?:\/\/|www\.|t\.me\/|bit\.ly\/|tinyurl\.com\/|(?:[a-z0-9]+\.)+[a-z]{2,})(\/\S*)?/i;

    if (m.message && linkRegex.test(budy)) {
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
                text: `LINK DETECTED\n\n@${m.sender.split("@")[0]} *Beware, links are not allowed in this group!*`,
                contextInfo: { mentionedJid: [m.sender] },
            },
            { quoted: m }
        );
     await Matrix.groupParticipantsUpdate(
            m.chat,
            [m.sender],
            "remove"
          );
    }
}
//<================================================>//
// Anti Bad Words
if (from.endsWith('@g.us') && db.data.chats[m.chat].badword) {
    for (let bak of bad) {
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
                    } *Beware, using bad words is prohibited in this group!*`,
                    contextInfo: { mentionedJid: [m.sender] },
                },
                { quoted: m }
            );
            break;
        }
    }
}
//<================================================>//
if (from.endsWith('@g.us') && db.data.chats[m.chat].badwordkick) {
    for (let bak of bad) {
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
}
//<================================================>//
//<================================================>//
if (global.alwaysonline === 'false') {
    if (m.message) {
        try {
            await Matrix.sendPresenceUpdate("unavailable", from);
            await delay(1000); // 1-second delay
        } catch (error) {
            console.error('Error sending unavailable presence update:', error);
        }
    }
} else if (global.alwaysonline === 'true') {
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
if (global.autoread === 'true') {
  Matrix.readMessages([m.key]);
}
//<================================================>//
if (
    m.quoted && // Ensure m.quoted exists
    (m.quoted.viewOnce || m.msg?.contextInfo?.quotedMessage) &&
    (m.message?.conversation || m.message?.extendedTextMessage) &&
    isCreator &&
    ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🫣", "🤗", "🫡", "🤔", "🫢", "🤭", "🤫", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫠", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🫥", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🫶", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "🫦", "👶", "🧒", "👦", "👧", "🧑", "👱", "👨", "🧔", "🧔‍♂️", "🧔‍♀️", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", "👩", "👩‍🦰", "👩‍🦱", "👩‍🦳", "👩‍🦲", "🧓", "👴", "👵", "🙍", "🙍‍♂️", "🙍‍♀️", "🙎", "🙎‍♂️", "🙎‍♀️", "🙅", "🙅‍♂️", "🙅‍♀️", "🙆", "🙆‍♂️", "🙆‍♀️", "💁", "💁‍♂️", "💁‍♀️", "🙋", "🙋‍♂️", "🙋‍♀️", "🧏", "🧏‍♂️", "🧏‍♀️", "🙇", "🙇‍♂️", "🙇‍♀️", "🤦", "🤦‍♂️", "🤦‍♀️", "🤷", "🤷‍♂️", "🤷‍♀️", "👮", "👮‍♂️", "👮‍♀️", "🕵️", "🕵️‍♂️", "🕵️‍♀️", "💂", "💂‍♂️", "💂‍♀️", "🥷", "👷", "👷‍♂️", "👷‍♀️", "🫅", "🤴", "👸", "👳", "👳‍♂️", "👳‍♀️", "👲", "🧕", "🤵", "🤵‍♂️", "🤵‍♀️", "👰", "👰‍♂️", "👰‍♀️", "🫃", "🫄", "🤰", "🤱", "👩‍🍼", "👨‍🍼", "🧑‍🍼", "👼", "🎅", "🧑‍🎄", "🦸", "🦸‍♂️", "🦸‍♀️", "🦹", "🦹‍♂️", "🦹‍♀️", "🧙", "🧙‍♂️", "🧙‍♀️", "🧚", "🧚‍♂️", "🧚‍♀️", "🧛", "🧛‍♂️", "🧛‍♀️", "🧜", "🧜‍♂️", "🧜‍♀️", "🧝", "🧝‍♂️", "🧝‍♀️", "🧞", "🧞‍♂️", "🧞‍♀️", "🧟", "🧟‍♂️", "🧟‍♀️", "🧌", "💆", "💆‍♂️", "💆‍♀️", "💇", "💇‍♂️", "💇‍♀️", "🚶", "🚶‍♂️", "🚶‍♀️", "🧍", "🧍‍♂️", "🧍‍♀️", "🧎", "🧎‍♂️", "🧎‍♀️", "🏃", "🏃‍♂️", "🏃‍♀️", "💃", "🕺", "🕴️", "👯", "👯‍♂️", "👯‍♀️", "🧖", "🧖‍♂️", "🧖‍♀️", "🧗", "🧗‍♂️", "🧗‍♀️", "🤺", "🏇", "⛷️", "🏂", "🏌️", "🏌️‍♂️", "🏌️‍♀️", "🏄", "🏄‍♂️", "🏄‍♀️", "🚣", "🚣‍♂️", "🚣‍♀️", "🏊", "🏊‍♂️", "🏊‍♀️", "⛹️", "⛹️‍♂️", "⛹️‍♀️", "🏋️", "🏋️‍♂️", "🏋️‍♀️", "🚴", "🚴‍♂️", "🚴‍♀️", "🚵", "🚵‍♂️", "🚵‍♀️", "🤸", "🤸‍♂️", "🤸‍♀️", "🤼", "🤼‍♂️", "🤼‍♀️", "🤽", "🤽‍♂️", "🤽‍♀️", "🤾", "🤾‍♂️", "🤾‍♀️", "🤹", "🤹‍♂️", "🤹‍♀️", "🧘", "🧘‍♂️", "🧘‍♀️", "🛀", "🛌", "🧑‍🤝‍🧑", "👭", "👫", "👬", "💏", "👩‍❤️‍💋‍👨", "👨‍❤️‍💋‍👨", "👩‍❤️‍💋‍👩", "💑", "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", "👪", "🧑‍👦", "🧑‍👧", "🧑‍👧‍👦", "🧑‍👦‍👦", "🧑‍👧‍👧", "👨‍👦", "👨‍👧", "👨‍👧‍👦", "👨‍👦‍👦", "👨‍👧‍👧", "👩‍👦", "👩‍👧", "👩‍👧‍👦", "👩‍👦‍👦", "👩‍👧‍👧", "🗣️", "👤", "👥", "🫂", "👣", "🧳", "🌂", "☂️", "🎃", "🧵", "🧶", "👓", "🕶️", "🥽", "🥼", "🦺", "👔", "👕", "👖", "🧣", "🧤", "🧥", "🧦", "👗", "👘", "🥻", "🩱", "🩲", "🩳", "👙", "👚", "👛", "👜", "👝", "🎒", "🩴", "👞", "👟", "🥾", "🥿", "👠", "👡", "👢", "👑", "👒", "🎩", "🎓", "🧢", "🪖", "⛑️", "📿", "💄", "💍", "💎", "🐵", "🐒", "🦍", "🦧", "🐶", "🐕", "🦮", "🐕‍🦺", "🐩", "🐺", "🦊", "🦝", "🐱"].some((emoji) => m.body.startsWith(emoji))
) {
    (async () => {
        try {
            let msg = m.msg?.contextInfo?.quotedMessage;
            if (!msg) return console.log('Quoted message not found.');

            let type = Object.keys(msg)[0];
            if (!type || !/image|video/.test(type)) {
                console.log('*Invalid media type!*');
                return;
            }

            const media = await downloadContentFromMessage(
                msg[type],
                type === 'imageMessage' ? 'image' : 'video'
            );

            const bufferArray = [];
            for await (const chunk of media) {
                bufferArray.push(chunk);
            }

            const buffer = Buffer.concat(bufferArray);

            await Matrix.sendMessage(
                Matrix.user.id,
                type === 'videoMessage'
                    ? { video: buffer, caption: global.wm }
                    : { image: buffer, caption: global.wm },
                { quoted: m }
            );

            bufferArray.length = 0;
            buffer.fill(0);
            msg = null;

        } catch (err) {
            console.error('Error processing media:', err);
        }
    })();
} else if (
   m.message &&
   m.message.extendedTextMessage?.contextInfo?.quotedMessage &&
   m.quoted && 
    !command &&
    isCreator &&
    m.quoted.chat === 'status@broadcast' // This line can now safely access m.quoted.chat
) {
    try {
        await m.quoted.copyNForward(Matrix.user.id, true);

        console.log('Status forwarded successfully!');
    } catch (err) {
        console.error('Error forwarding status:', err);
    }
}
//=================================================//;


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
  if (mode === "private" && !isCreator) {
    // Private mode: only owner can run commands
    return await Matrix.sendMessage(from, {
      text: "⚠️ Bot is currently in *private* mode. Only the owner can use commands."
    }, { quoted: m });
  }
  if (mode === "group" && !m.isGroup && !isCreator) {
    // Group only mode: block commands outside groups for non-owner
    return await Matrix.sendMessage(from, {
      text: "⚠️ Bot is currently in *group only* mode. Commands work only in groups."
    }, { quoted: m });
  }
  if (mode === "pm" && m.isGroup && !isCreator) {
    // PM only mode: block commands in groups for non-owner
    return await Matrix.sendMessage(from, {
      text: "⚠️ Bot is currently in *private chat only* mode. Commands work only in private chats."
    }, { quoted: m });
  }
  // Public mode: allow all commands
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
  from, // Redundant, 'from' is already in m, but kept for consistency
  pushname,
  ephoto,
  loadBlacklist,
  mainOwner,
  // ADD THESE NEW CONTEXT VARIABLES FOR ADIZACHAT MANAGEMENT --> START OF ADDITIONS
  adizaUserStatesDb, // The global variable for user states
  getUserApiState,   // The helper function to get user state
  saveAdizaUserStates, // The helper function to save user states
  AVAILABLE_APIS,    // The global object with all AI models
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
        menu += "│⚡ *ᴘʀᴇғɪx* : [ " + global.db.data.settings.prefix + " ]\n";
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
    await m.reply("🚀Loading...Adiza-Bot🌹");
    const endTime = performance.now();
    const latensie = endTime - startTime;

    // Load plugins
    const plugins = loadMenuPlugins(path.resolve(__dirname, './src/Plugins'));

    const menulist = generateMenu(plugins, ownername, global.db.data.settings.prefix, modeStatus, versions, latensie, readmore);

    const menustyle = global.db.data.settings.menustyle || '2';


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