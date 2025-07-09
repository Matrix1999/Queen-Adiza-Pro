const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const pairingPath = path.join(__dirname, 'lib', 'pairing');

if (!fs.existsSync(pairingPath)) {
    fs.mkdirSync(pairingPath, { recursive: true });
    console.log(`[ADIZA] Created missing directory: ${pairingPath}`);
}


process.on('uncaughtException', console.error)
require("./settings") // Ensure settings.js is properly required to access global.DEVELOPER and global.OWNER

// --- START: This entire block should be present and correct ---
const adminfile = path.join(__dirname, 'lib', 'premium.json');
let adminIDs = JSON.parse(fs.readFileSync(adminfile, 'utf8'));

fs.watchFile(adminfile, () => {
  adminIDs = JSON.parse(fs.readFileSync(adminfile, 'utf8'));
  console.log('Premium user list updated dynamically');
});

// This is the function that checks if a TELEGRAM USER ID is premium
function isTelegramPremiumUser(userId) { // <--- ENSURE THIS FUNCTION IS HERE
  return adminIDs.includes(userId);
}
// --- END of block ---


const {
    Telegraf,
    Context,
    Markup
} = require('telegraf')
const {
    message,
    editedMessage,
    channelPost,
    editedChannelPost,
    callbackQuery
} = require("telegraf/filters");
const {
    toFirstCase,
    isNumber,
    formatp,
    parseMention,
    resize,
    getRandom,
    generateProfilePicture,
    getCase,
    runtime, // Used from here
    FileSize,
    h2k,
    makeid,
    kyun,
    randomNomor,
    jsonformat,
    // isUrl, // isUrl might be needed, but will handle if it causes new errors
    fetchJson,
    sleep, // Used from here
    getBuffer
} = require("./lib/myfunc2");
const {
    formatSize
} = require("./lib/myfunc3"); // Used from here

const fetch = require('node-fetch')
const os = require('os')
const speed = require('performance-now')
const util = require('util')
const yts = require('yt-search')
const moment = require('moment-timezone'); 
const timezones = "Africa/Accra";
const axios = require('axios');
const crypto = require('crypto');
const {
    webcrack
} = require('webcrack');
const JSConfuser = require("js-confuser");

const cooldowns = new Map(); // Create a map to track cooldowns



// Explicitly define the 'range' function here for use in the 'reply' function
function range(start, stop, step) {
    if (stop == null) {
        stop = start || 0;
        start = 0;
    }
    if (step == null) {
        step = stop > start ? 1 : -1;
    }
    var toReturn = [];
    for (; (step > 0 ? stop > start : stop < start); start += step) {
        toReturn.push(start);
    }
    return toReturn;
}


// Define escapeMarkdownV2 function locally in adiza.js
function escapeMarkdownV2(text) {
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

module.exports = AdizaBotInc = async (AdizaBotInc, bot) => {
    //console.log(AdizaBotInc)
    try {
        const body = AdizaBotInc.message.text || AdizaBotInc.message.caption || ''
        const budy = (typeof AdizaBotInc.message.text == 'string' ? AdizaBotInc.message.text : '')

        const isCmd = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#/$%^&.+-,\\\©^]/.test(body)
        const args = body.trim().split(/ +/).slice(1);
        const text = q = args.join(" ");
        // --- CORRECTED ORDER ---
        // 1. Get the user object first.
        const user = AdizaBotInc.message.from;
        // 2. Now that 'user' exists, create other variables from it.
        const pushname = user.first_name; // Use first_name as pushname
        const fullName = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
        const userId = user.id.toString();

        const isCreator = global.OWNER.includes(AdizaBotInc.update.message.from.username ? `https://t.me/${AdizaBotInc.update.message.from.username}` : '') || global.DEVELOPER.includes(userId);
        const from = AdizaBotInc.message.chat.id
        const prefix = isCmd ? body[0] : ''
        const command = isCreator ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : isCmd ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : '';
        const isGroup = AdizaBotInc.chat.type.includes('group')
        const groupName = isGroup ? AdizaBotInc.chat.title : ''

        const isImage = AdizaBotInc.message.hasOwnProperty('photo')
        const isVideo = AdizaBotInc.message.hasOwnProperty('video')
        const isAudio = AdizaBotInc.message.hasOwnProperty('audio')
        const isSticker = AdizaBotInc.message.hasOwnProperty('sticker')
        const isContact = AdizaBotInc.message.hasOwnProperty('contact')
        const isLocation = AdizaBotInc.message.hasOwnProperty('location')
        const isDocument = AdizaBotInc.message.hasOwnProperty('document')
        const isAnimation = AdizaBotInc.message.hasOwnProperty('animation')
        const isMedia = isImage || isVideo || isAudio || isSticker || isContact || isLocation || isDocument || isAnimation
        const quotedMessage = AdizaBotInc.message.reply_to_message || {}
        const isQuotedImage = quotedMessage.hasOwnProperty('photo')
        const isQuotedVideo = quotedMessage.hasOwnProperty('video')
        const isQuotedAudio = quotedMessage.hasOwnProperty('audio')
        const isQuotedSticker = quotedMessage.hasOwnProperty('sticker')
        const isQuotedContact = quotedMessage.hasOwnProperty('contact')
        const isQuotedLocation = quotedMessage.hasOwnProperty('location')
        const isQuotedDocument = quotedMessage.hasOwnProperty('document')
        const isQuotedAnimation = quotedMessage.hasOwnProperty('animation')
        const isQuoted = AdizaBotInc.message.hasOwnProperty('reply_to_message')
        const timestampi = speed();
        const latensii = speed() - timestampi

        const reply = async (text) => {
            // Uses the locally defined 'range' function
            for (var x of range(0, text.length, 4096)) { //maks 4096 character, jika lebih akan eror
                return await AdizaBotInc.replyWithMarkdown(text.substr(x, 4096), {
                    disable_web_page_preview: true
                })
            }
        }
        const getStyle = (style_, style, style2) => {
            // Assuming lang.getStyle is available globally or imported
            listt = `${lang.getStyle(style, style2)}`
            for (var i = 0; i < 300; i++) {
                listt += '» `' + style_[i] + '`\n'
            }
            reply(listt)
        }

        //get type message
        var typeMessage = body.substr(0, 50).replace(/\n/g, '')
        if (isImage) typeMessage = 'Image'
        else if (isVideo) typeMessage = 'Video'
        else if (isAudio) typeMessage = 'Audio'
        else if (isSticker) typeMessage = 'Sticker'
        else if (isContact) typeMessage = 'Contact'
        else if (isLocation) typeMessage = 'Location'
        else if (isDocument) typeMessage = 'Document'
        else if (isAnimation) typeMessage = 'Animation'

        //push message to console
        if (AdizaBotInc.message) {
            console.log(chalk.black(chalk.bgWhite('[ CMD ]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(body || typeMessage)) + '\n' + chalk.magenta('=> From'), chalk.green(pushname) + '\n' + chalk.blueBright('=> In'), chalk.green(isGroup ? groupName : 'Private Chat', AdizaBotInc.message.chat.id))
        }

        const sendMessage = (chatId, text) => bot.sendMessage(chatId, text);

        function generateRandomPassword() {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#%^&*';
            const length = 10;
            let password = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                password += characters[randomIndex];
            }
            return password;
        }

        switch (command) {
            case 'enc':
            case 'immortal': {
                // Check if the user is a developer
                if (!DEVELOPER.includes(userId)) {
                    // Cooldown check for non-developer users
                    if (cooldowns.has(userId)) {
                        const lastUsed = cooldowns.get(userId);
                        const now = Date.now();
                        const timeLeft = 30000 - (now - lastUsed); // 30 seconds cooldown

                        if (timeLeft > 0) {
                            return AdizaBotInc.reply(`Please wait ${Math.ceil(timeLeft / 1000)} seconds before using the command again.`);
                        }
                    }
                }

                const isOwner = global.DEVELOPER.includes(AdizaBotInc.message.from.id.toString());
                if (!isOwner) {
                    return AdizaBotInc.reply(`Please use the command /pair and connect the bot to your messenger whatsapp.`);
                }

                const JSConfuser = require("js-confuser");

                const usage = `Usage Example:
${prefix + command} (Input text or reply text to obfuscate code)
${prefix + command} doc (Reply to a document)`;

                let text;
                if (args.length >= 1) {
                    text = args.join(" ");
                } else if (AdizaBotInc.message.reply_to_message && AdizaBotInc.message.reply_to_message.text) {
                    text = AdizaBotInc.message.reply_to_message.text;
                } else {
                    return reply(usage);
                }

                // Define the temporary directory path
                const tmpDir = './tmp';
                // Create the tmp directory if it doesn't exist
                if (!fs.existsSync(tmpDir)) {
                    fs.mkdirSync(tmpDir);
                }

                // Define the full path for the encrypted file inside tmp
                const encryptedFilePath = path.join(tmpDir, 'enc_by_@Matrixxxxxxxxx.js');

                try {
                    let code;
                    if (text === 'doc' && AdizaBotInc.message.reply_to_message && AdizaBotInc.message.reply_to_message.document) {
                        const fileLink = await bot.telegram.getFileLink(AdizaBotInc.message.reply_to_message.document.file_id);
                        const response = await axios.get(fileLink.href, {
                            responseType: 'arraybuffer'
                        });
                        code = Buffer.from(response.data).toString('utf-8');
                    } else {
                        code = text;
                    }

                    const optionsObf6 = {
                        target: "node",
                        preset: "high",
                        compact: true,
                        minify: true,
                        flatten: true,

                        identifierGenerator: function() {
                            const originalString =
                                "素晴座素晴難ADIZA素晴座素晴難" +
                                "素晴座素晴難ADIZA素晴座素晴難";

                            // Fungsi untuk menghapus karakter yang tidak diinginkan
                            function removeUnwantedChars(input) {
                                return input.replace(
                                    /[^a-zA-Z座Nandokuka素Muzukashī素晴]/g, ''
                                );
                            }

                            // Fungsi untuk menghasilkan string acak
                            function randomString(length) {
                                let result = '';
                                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; // Hanya simbol
                                const charactersLength = characters.length;

                                for (let i = 0; i < length; i++) {
                                    result += characters.charAt(
                                        Math.floor(Math.random() * charactersLength)
                                    );
                                }
                                return result;
                            }

                            return removeUnwantedChars(originalString) + randomString(2);
                        },

                        renameVariables: true,
                        renameGlobals: true,

                        stringEncoding: true,
                        stringSplitting: 0.0,
                        stringConcealing: true,
                        stringCompression: true,
                        duplicateLiteralsRemoval: 1.0,

                        shuffle: {
                            hash: 0.0,
                            true: 0.0
                        },

                        stack: true,
                        controlFlowFlattening: 1.0,
                        opaquePredicates: 0.9,
                        deadCode: 0.0,
                        dispatcher: true,
                        rgf: false,
                        calculator: true,
                        hexadecimalNumbers: true,
                        movedDeclarations: true,
                        objectExtraction: true,
                        globalConcealing: true
                    };

                    const obfuscatedCode = await JSConfuser.obfuscate(code, optionsObf6);

                    // Write the encrypted code to the file in the tmp directory
                    fs.writeFileSync(encryptedFilePath, obfuscatedCode);

                    // Send the document
                    await bot.telegram.sendDocument(AdizaBotInc.message.chat.id, {
                        source: encryptedFilePath,
                        filename: 'Encrypted By @Matrixxxxxxxxx.js'
                    });

                    // Clean up the temporary file immediately after sending
                    fs.unlinkSync(encryptedFilePath);


                } catch (error) {
                    console.error('Error during encryption:', error);
                    // Ensure the temporary file is deleted even if an error occurs during processing or sending
                    if (fs.existsSync(encryptedFilePath)) {
                        fs.unlinkSync(encryptedFilePath);
                    }
                    return reply(`Error: ${error.message}`);
                }
                // Set cooldown for non-developer users
                if (!DEVELOPER.includes(userId)) {
                    cooldowns.set(userId, Date.now());
                    setTimeout(() => cooldowns.delete(userId), 30000); // Clear the cooldown after 30 seconds
                }
                break; // ADDED break statement
            }

            // =========== DECRYPT ========= //

            case 'dec':
            case 'decrypt': {
                // Check if the user is a developer
                if (!DEVELOPER.includes(userId)) {
                    // Cooldown check for non-developer users
                    if (cooldowns.has(userId)) {
                        const lastUsed = cooldowns.get(userId);
                        const now = Date.now();
                        const timeLeft = 30000 - (now - lastUsed); // 30 seconds cooldown

                        if (timeLeft > 0) {
                            return AdizaBotInc.reply(`Please wait ${Math.ceil(timeLeft / 1000)} seconds before using the command again.`);
                        }
                    }
                }

                const isOwner = global.DEVELOPER.includes(AdizaBotInc.message.from.id.toString());
                if (!isOwner) {
                    return AdizaBotInc.reply(`Please use the command /pair and connect the bot to your messenger whatsapp.`);
                }

                // Ensure webcrack is imported if this block is uncommented
                const {
                    webcrack
                } = await import('webcrack'); // This requires Node.js v14+ and appropriate module setup

                const usage = `Usage Example:
${prefix + command} (Input text or reply text to decrypt code)
${prefix + command} doc (Reply to a document)`;

                let text;
                if (args.length >= 1) {
                    text = args.join(" ");
                } else if (quotedMessage?.text) {
                    text = quotedMessage.text;
                } else if (isQuotedDocument) {
                    const fileId = quotedMessage.document.file_id;
                    const fileLink = await bot.telegram.getFileLink(fileId);
                    const fileBuffer = await axios.get(fileLink.href, {
                        responseType: 'arraybuffer'
                    });
                    text = fileBuffer.data.toString('utf-8');
                } else {
                    return reply(usage);
                }

                // Define the temporary directory path
                const tmpDir = './tmp';
                // Create the tmp directory if it doesn't exist
                if (!fs.existsSync(tmpDir)) {
                    fs.mkdirSync(tmpDir);
                }

                // Define the full path for the decrypted file inside tmp
                const decryptedFilePath = path.join(tmpDir, 'dec_by_bot.js');

                try {
                    const decryptedCode = await webcrack(text);

                    // Write the decrypted code to the file in the tmp directory
                    fs.writeFileSync(decryptedFilePath, decryptedCode.code);

                    // Send the document
                    await bot.telegram.sendDocument(from, {
                        source: decryptedFilePath,
                        filename: 'Decrypted_By_Adiza.js'
                    });

                    // Clean up the temporary file immediately after sending
                    fs.unlinkSync(decryptedFilePath);

                } catch (error) {
                    console.error('Error during decryption:', error);
                    // Ensure the temporary file is deleted even if an error occurs during processing or sending
                    if (fs.existsSync(decryptedFilePath)) {
                        fs.unlinkSync(decryptedFilePath);
                    }
                    return reply(`There was an error: ${error.message}`);
                }
                // Set cooldown for non-developer users
                if (!DEVELOPER.includes(userId)) {
                    cooldowns.set(userId, Date.now());
                    setTimeout(() => cooldowns.delete(userId), 30000); // Clear the cooldown after 30 seconds

                }
                break; // ADDED break statement
            }

            case 'listpair': {
                const isOwner = global.DEVELOPER.includes(AdizaBotInc.message.from.id.toString()); // Re-using isOwner for developer check
                if (!isOwner) {
                    return AdizaBotInc.reply(`This command is only for owner.`);
                }

                const pairingPath = './lib/pairing';

                try {
                    // Check if the directory exists
                    if (!fs.existsSync(pairingPath)) {
                        return AdizaBotInc.reply('No paired devices found.');
                    }

                    // Read all directories (and files) inside ./lib/pairing
                    const entries = fs.readdirSync(pairingPath, {
                        withFileTypes: true
                    });

                    // Filter for directories (paired device IDs)
                    const pairedDevices = entries
                        .filter(entry => entry.isDirectory())
                        .map(entry => entry.name.replace('@s.whatsapp.net', '')); // Extract only numbers

                    // Handle if no paired devices are found
                    if (pairedDevices.length === 0) {
                        return AdizaBotInc.reply('No paired devices found.');
                    }

                    // Count total paired devices
                    const totalUsers = pairedDevices.length;

                    // Format the list of paired devices for the response
                    const deviceList = pairedDevices
                        .map((device, index) => `${index + 1}. ${device}`)
                        .join('\n');

                    AdizaBotInc.reply(`Total Rent Bot Users: ${totalUsers}\n\nPaired Devices:\n${deviceList}`);
                } catch (err) {
                    console.error('Error reading paired devices directory:', err);
                    return AdizaBotInc.reply('Failed to load paired devices data.');
                }
                break;
            }

            case 'listprem': {
                const isOwner = global.DEVELOPER.includes(userId) || global.OWNER.includes(
                    AdizaBotInc.message.from.username ? `https://t.me/${AdizaBotInc.message.from.username}` : ''
                );
                if (!isOwner) return reply('Only owners can list premium users.');
                if (adminIDs.length === 0) return reply('No premium users.');
                reply('Premium Users:\n' + adminIDs.map((id, i) => `${i+1}. <code>${id}</code>`).join('\n'), {
                    parse_mode: "HTML"
                });
                break;
            }



            case 'delpair': {

    const isAuthorized = global.DEVELOPER.includes(userId) ||
                         global.OWNER.includes(AdizaBotInc.message.from.username ? `https://t.me/${AdizaBotInc.message.from.username}` : '') ||
                         isTelegramPremiumUser(userId);

    if (!isAuthorized) {
        // Updated reply message to reflect broader authorization
        return AdizaBotInc.reply(`This command is only for authorized users (Owner/Developer/Premium).`);
    }

    if (!text) return AdizaBotInc.reply(`Example:\n ${prefix + command} 91xxx`)
    target = text.split("|")[0]
    const Xreturn = AdizaBotInc.message.reply_to_message ? AdizaBotInc.message.reply_to_message.from.id + "@s.whatsapp.net"
        : target.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    const targetID = Xreturn;
    const pairingPath = './lib/pairing';
    const targetPath = `${pairingPath}/${targetID}`;

    try {
        if (!fs.existsSync(targetPath)) {
            return AdizaBotInc.reply(`Paired device with ID "${targetID}" does not exist.`);
        }

        fs.rmSync(targetPath, {
            recursive: true,
            force: true
        });

        AdizaBotInc.reply(`Paired device with ID "${targetID}" has been successfully deleted.`);
    } catch (err) {
        console.error('Error deleting paired device:', err);
        return AdizaBotInc.reply('An error occurred while attempting to delete the paired device.');
    }
    break;
}



            case 'pair': {
    const libphonenumber = require('libphonenumber-js');

    // --- Authorization checks above (as you already have) ---

    if (!text) {
        return AdizaBotInc.reply('Please provide a number for requesting the pair code. Usage: /pair <number>');
    }

    const sanitizedNumber = text.replace(/\D/g, '');

    function isValidWhatsAppNumber(phone) {
        try {
            const number = libphonenumber.parsePhoneNumber('+' + phone);
            if (!number || !number.isValid()) return false;
            const localNumberLength = number.nationalNumber.length;
            return localNumberLength >= 6 && localNumberLength <= 15;
        } catch {
            return false;
        }
    }

    if (!isValidWhatsAppNumber(sanitizedNumber)) {
        return AdizaBotInc.reply('Invalid WhatsApp number. Please enter a valid phone number.');
    }

    const Xreturn = sanitizedNumber + "@s.whatsapp.net";

    // --- PREMIUM CHECK: Only allow pairing if user is premium ---
    function isPremiumUser(jid) {
        const dbPath = path.join(__dirname, 'src', 'database.json');
        let premiumUsers = [];
        if (fs.existsSync(dbPath)) {
            try {
                const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                premiumUsers = db.premium || [];
            } catch (e) {}
        }
        return premiumUsers.some(p => p.jid === jid);
    }

// Premium number to be in database

    if (!isPremiumUser(Xreturn)) {
    return AdizaBotInc.telegram.sendMessage(
        AdizaBotInc.chat.id,
        `❌ <b>Access Denied!</b>\n\n` +
        `The WhatsApp number <code>${sanitizedNumber}</code> is <b>not premium</b>.\n\n` +
        `💎 <b>Premium is required to use this feature.</b>\n\n` +
        `Please contact the owner to purchase premium before pairing.`,
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "👑 Owner 👑", url: "https://t.me/Matrixxxxxxxxx" }
                    ]
                ]
            }
        }
    );
}



    // --- Ensure base pairing directory exists ---
    const basePairingDir = path.join(__dirname, 'lib', 'pairing');
    if (!fs.existsSync(basePairingDir)) {
        fs.mkdirSync(basePairingDir, { recursive: true });
        console.log(chalk.green(`[ADIZA] Created base pairing directory: ${basePairingDir}`));
    }

    // --- Ensure the session folder exists ---
    const pairingBaseDir = path.join(basePairingDir, Xreturn);
    if (!fs.existsSync(pairingBaseDir)) {
        fs.mkdirSync(pairingBaseDir, { recursive: true });
        console.log(chalk.green(`[ADIZA] Created session directory: ${pairingBaseDir}`));
    }

    // --- Telegram loading animation ---
    await AdizaBotInc.telegram.sendChatAction(AdizaBotInc.chat.id, "typing");
    const loadingMsg = await AdizaBotInc.telegram.sendMessage(
        AdizaBotInc.chat.id,
        "🔗 <b>Initiating pairing process...</b>\n\n⏳ <i>Connecting to WhatsApp and generating your code</i>",
        { parse_mode: "HTML" }
    );
    const loadingSteps = [
        "🔗 <b>Initiating pairing process.</b>\n\n⏳ <i>Connecting to WhatsApp and generating your code</i>",
        "🔗 <b>Initiating pairing process..</b>\n\n⏳ <i>Connecting to WhatsApp and generating your code</i>",
        "🔗 <b>Initiating pairing process...</b>\n\n⏳ <i>Connecting to WhatsApp and generating your code</i>"
    ];
    for (let i = 0; i < 6; i++) {
        await new Promise(res => setTimeout(res, 500));
        await AdizaBotInc.telegram.editMessageText(
            AdizaBotInc.chat.id,
            loadingMsg.message_id,
            undefined,
            loadingSteps[i % loadingSteps.length],
            { parse_mode: "HTML" }
        );
    }

    // --- Start the WhatsApp pairing process ---
    const rentbot = require('./rentbot.js');
   await rentbot.startpairing(Xreturn);


    // --- Wait for the pairing.json to be created in the user's session folder (up to 20 seconds) ---
    const pairingFilePath = path.join(pairingBaseDir, 'pairing.json');
    let attempts = 0;
    let pairingCode = null;
    while (attempts < 40) { // 40 x 500ms = 20 seconds
        if (fs.existsSync(pairingFilePath)) {
            try {
                const cu = fs.readFileSync(pairingFilePath, 'utf-8');
                const cuObj = JSON.parse(cu);
                pairingCode = cuObj.code;
                if (pairingCode) break;
            } catch (err) {}
        }
        await new Promise(res => setTimeout(res, 500));
        attempts++;
    }

    if (!pairingCode) {
        return AdizaBotInc.reply("Failed to get pairing code. The code was not generated in time. Please try again.");
    }

    const formattedMessage = `🚀🔮<b>𝙌𝙪𝙚𝙚𝙣 𝘼𝙙𝙞𝙯𝙖 𝘽𝙤𝙩</b>🔮🚀\n\n` +
        `🔑 <b>Pairing Code:</b> <code>${pairingCode}</code>\n\n` +
        `📌 <b>How to use this code:</b>📌\n\n` +
        `1. Open WhatsApp > Settings > Linked Devices\n` +
        `2. Tap "Link a Device"\n` +
        `3. Select "Link with phone number instead"\n` +
        `3. Enter this 8-digit code\n\n` +
        `⏳<b>Code expires in 2 mins</b>⏳`;

    await AdizaBotInc.telegram.sendMessage(AdizaBotInc.chat.id, formattedMessage, {
        parse_mode: 'HTML'
    });

    // ... your cooldown logic below ...
    break;
}

           
case 'addprem': {
    // RE-ADDED OWNER/DEVELOPER CHECK
    const isOwner = global.DEVELOPER.includes(userId) || global.OWNER.includes(
        AdizaBotInc.message.from.username ? `https://t.me/${AdizaBotInc.message.from.username}` : ''
    );
    if (!isOwner) return reply('Only owners can add premium users.');

    if (!text) return reply('Usage: /addprem <telegram_id>');
    const newId = text.trim();

    if (newId === "") {
        return reply("Please provide a valid Telegram ID. It cannot be empty.");
    }

    // Use the dynamically updated adminIDs (from the fs.watchFile listener)
    if (!adminIDs.includes(newId)) {
        adminIDs.push(newId);
        // Writing to file will trigger fs.watchFile, which then reloads adminIDs in memory
        fs.writeFileSync(adminfile, JSON.stringify(adminIDs, null, 2));

        reply(`✅ Added <code>${newId}</code> as a premium user.`, {
            parse_mode: "HTML"
        });
    } else {
        reply('User is already premium.');
    }
    break;
}

            case 'delprem': {
    // RE-ADDED OWNER/DEVELOPER CHECK
    const isOwner = global.DEVELOPER.includes(userId) || global.OWNER.includes(
        AdizaBotInc.message.from.username ? `https://t.me/${AdizaBotInc.message.from.username}` : ''
    );
    if (!isOwner) return reply('Only owners can remove premium users.');

    if (!text) return reply('Usage: /delprem <telegram_id>');
    const delId = text.trim();
    const idx = adminIDs.indexOf(delId);

    if (idx !== -1) {
        adminIDs.splice(idx, 1);
        // Write updated list to file; fs.watchFile will reload adminIDs automatically
        fs.writeFileSync(adminfile, JSON.stringify(adminIDs, null, 2));

        reply(`✅ Removed <code>${delId}</code> from premium users.`, {
            parse_mode: "HTML"
        });
    } else {
        reply('User is not in the premium list.');
    }
    break;
}


            case 'listusers': {
                // Authorization check: Only Owner/Developer can use this
                const isOwnerOrDeveloper = global.DEVELOPER.includes(userId) || global.OWNER.includes(
                    AdizaBotInc.message.from.username ? `https://t.me/${AdizaBotInc.message.from.username}` : ''
                );
                if (!isOwnerOrDeveloper) {
                    return reply('This command is only for the owner/developer.');
                }

                try {
                    // Construct the path to users.json. Assuming it's in the same directory as adiza.js
                    const usersFile = path.join(__dirname, 'users.json'); 

                    let users = [];
                    if (fs.existsSync(usersFile)) {
                        const data = fs.readFileSync(usersFile, 'utf8');
                        users = JSON.parse(data);
                    } else {
                        return reply('`users.json` file not found in the bot\'s root directory.');
                    }

                    if (users.length === 0) {
                        return reply('No users recorded in `users.json` yet.');
                    }

                    let userListMessage = `👥 *Total Users: ${users.length}*\n\n`;
                    userListMessage += 'Users:\n';
                    userListMessage += users.map((id, i) => `${i + 1}. \`${id}\``).join('\n');

                    // The `reply` function in adiza.js already handles splitting long messages.
                    reply(userListMessage);

                } catch (error) {
                    console.error('Error listing users from users.json:', error);
                    reply('An error occurred while trying to list users.');
                }
 break; 
  }     
  

    case 'restart': {
        // Authorization check: Only Owner/Developer can use this
        const isOwnerOrDeveloper = global.DEVELOPER.includes(userId) || global.OWNER.includes(
            AdizaBotInc.message.from.username ? `https://t.me/${AdizaBotInc.message.from.username}` : ''
        );
        if (!isOwnerOrDeveloper) {
            return reply('You are not authorized to use this command.');
        }

        await reply('🔄 Restarting bot...');
        console.log(chalk.yellow('[BOT] Restarting initiated by Telegram command...'));

        
        process.exit(0);

    
    break;
 }
            

case 'runtime': {
                
                reply(`𝗤𝘂𝗲𝗲𝗻 𝗔𝗱𝗶𝘇𝗮 𝗕𝗼𝘁 𝗶𝘀 𝗢𝗻𝗹𝗶𝗻𝗲 ${runtime(process.uptime())}`)
                break;
            }
                     

case 'menu':
case 'back!':
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const formattedUsedMem = formatSize(usedMem);
    const more = String.fromCharCode(8206);
    const readmore = more.repeat(4001);
    const formattedTotalMem = formatSize(totalMem); 
    const pushname = user.first_name;
    const currentTime = moment.tz(timezones).format('HH:mm:ss z');
    const currentDate = moment.tz(timezones).format('DD/MM/YYYY');
    const botName = global.BOT_NAME;
    // For HTML, you need to escape differently or use it directly if no special chars
    // Since these are IDs/Names, they might contain special chars that break HTML too
    // For now, let's assume global.DEVELOPER[0] and global.OWNER_NAME are safe or you apply an HTML escape function.
    // Example (you'd need to define this function): const escapedDeveloperIdHtml = escapeHtml(global.DEVELOPER[0]);
    // For simplicity, let's just use them directly and watch for new errors if they contain problematic HTML chars.
    const developerId = global.DEVELOPER[0]; // Use directly if it's just a number
    const ownerName = global.OWNER_NAME; // Use directly

    let adizatext =
        `Hi 👋 ${pushname}
╭───━━━༺◈༻━━━───╮
    😊🌹<b>𝗪𝗘𝗟𝗖𝗢𝗠𝗘</b>🌹😊
╰───━━━༺◈༻━━━───╯

╭─〔👤 <b>𝗕𝗢𝗧 𝗜𝗡𝗙𝗢</b> 👤〕────╮
◈ 🔢 <b>𝗩𝗘𝗥𝗦𝗜𝗢𝗡:</b> V.9
◈ ❄ <b>𝗕𝗢𝗧:</b> ${botName} 
◈ 🆔 <b>𝗜𝗗:</b> ${developerId}
◈ ⏰ <b>𝗧𝗜𝗠𝗘:</b> ${currentTime}
◈ 🗓️ <b>𝗗𝗔𝗧𝗘:</b> ${currentDate}
◈ 💾 <b>𝗥𝗔𝗠:</b> ${formattedTotalMem}  
◈ 🐍 <b>𝗢𝗪𝗡𝗘𝗥:</b> ${ownerName}
╰────────────────────╯

╭─〔💎 <b>𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗨𝗦𝗘𝗥𝗦</b> 💎〕─╮
◈ ⏳ /pair —  <b>𝗔𝗱𝗱 𝘀𝗲𝘀𝘀𝗶𝗼𝗻</b>
◈ 🚫 /delpair — <b>𝗥𝗲𝗺𝗼𝘃𝗲 𝘀𝗲𝘀𝘀𝗶𝗼𝗻</b>
◈ ❄ /runtime — <b>𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲</b>
◈ ⚡ /checkid — <b>𝗖𝗵𝗲𝗰𝗸 𝗬𝗼𝘂𝗿 𝗜𝗗</b>
◈🔓 /decrypt — <b>𝗱𝗲𝗰𝗿𝘆𝗽𝘁 𝗷𝘀 𝗳𝗶𝗹𝗲𝘀</b>
◈🔐 /immortal — <b>𝗲𝗻𝗰𝗿𝘆𝗽𝘁 𝗷𝘀 𝗳𝗶𝗹𝗲𝘀</b>
╰─────────────────────╯

╭─〔 👑 <b>𝗢𝗪𝗡𝗘𝗥</b> 👑 〕────╮
◈ 🔮 /addprem — <b>𝗮𝗱𝗱 𝗽𝗿𝗲𝗺-𝘂𝘀𝗲𝗿</b>
◈ ♨️ /delprem — <b>𝗿𝗲𝗺𝗼𝘃𝗲 𝗽𝗿𝗲𝗺-𝘂𝘀𝗲𝗿</b>
◈ 🦠 /listprem — <b>𝗹𝗶𝘀𝘁 𝗽𝗿𝗲𝗺-𝘂𝘀𝗲𝗿𝘀</b>
◈ 🎨 /broadcast — <b>𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘂𝘀𝗲𝗿𝘀</b>
◈ 👥 /listusers  — <b>𝗹𝗶𝘀𝘁 𝘂𝘀𝗲𝗿𝘀</b>
◈ 💎 /listpair — <b>𝗹𝗶𝘀𝘁 𝗽𝗮𝗶𝗿 𝘂𝘀𝗲𝗿𝘀</b>
◈ 🔄 /restart — <b>𝗿𝗲𝘀𝘁𝗮𝗿𝘁 𝘃𝗽𝘀</b>
╰───────────────────╯`;

    AdizaBotInc.replyWithPhoto(
        global.pp, {
            caption: adizatext,
            parse_mode: 'HTML' 
        }
    );
    break;


            default:
        }
    } catch (e) {
        AdizaBotInc.reply(util.format(e))
        console.log('[ ERROR ] ' + e)
    }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})
