// lib/matrixUtils.js

// Import necessary Baileys functions and other utilities

const {

    generateForwardMessageContent,

    generateWAMessageFromContent,

    downloadContentFromMessage,

    jidDecode,

    proto, 

    areJidsSameUser, 

    normalizeMessageContent 

} = require("@whiskeysockets/baileys"); 

const fetch = require("node-fetch"); // Used by getBuffer (if moved) or direct fetches

const FileType = require('file-type'); // Used by getFile

const fs = require('fs');

const path = require('path');

// Assume these are available from lib/myfunc or lib/exif, or define them locally if needed

// For simplicity, let's assume getBuffer is available. If not, you'll need to pass it or import it.

const { getBuffer } = require('./myfunc'); // Assuming getBuffer is in myfunc.js

const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./exif'); // Assuming these are in exif.js

const { toAudio, toPTT, toVideo } = require('./converter'); // Assuming these are in converter.js

// IMPORTANT: Define this function if not globally available or imported elsewhere.

// It's crucial for sendFile and other functions.

async function getFile(PATH, returnAsFilename) {

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

        filename = path.join(__dirname, '../tmp/' + new Date() * 1 + '.' + type.ext); // Adjust tmp path if needed

        await fs.promises.writeFile(filename, data);

    }

    const deleteFile = async () => {

        if (filename && fs.existsSync(filename)) {

            await fs.promises.unlink(filename).catch(() => {});

        }

    };

    setImmediate(deleteFile); // Schedule deletion

    data.fill(0); // Clear buffer content for security

    return { res, filename, ...type, data, deleteFile };

};

/**

 * Extends a Baileys WhatsApp socket with custom utility methods.

 * @param {import('baileys').WASocket} sock The Baileys socket instance.

 */

function extendWASocket(sock) {

    // Helper method for sending text (used internally by some Baileys-like structures)

    sock.sendText = (jid, text, quoted = '', options) => sock.sendMessage(jid, { text: text, ...options }, { quoted });

    sock.sendTextWithMentions = async (jid, text, quoted, options = {}) => sock.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted });

    sock.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {

        let type = await getFile(path, true); // Use the getFile function

        let { res, data: file, filename: pathFile } = type;

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

            m = await sock.sendMessage(jid, message, { ...opt, ...options })

        } catch (e) {

            console.error("Error sending file (attempt 1):", e);

            m = null

        } finally {

            if (!m) m = await sock.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })

            return m

        }

    }

    sock.copyNForward = async (jid, message, forceForward = false, options = {}) => {

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

        await sock.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })

        return waMessage

    }

    sock.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {

        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)

        let buffer

        if (options && (options.packname || options.author)) {

            buffer = await writeExifVid(buff, options)

        } else {

            buffer = await videoToWebp(buff)

        }

        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })

        return buffer

    }

    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {

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

        let savePath = path.join(__dirname, '../tmp', trueFileName); // Save to 'tmp' folder relative to lib

        await fs.writeFileSync(savePath, buffer);

        buffer = null; // Clear buffer from memory

        global.gc?.(); // Suggest garbage collection

        return savePath;

    };

    sock.sendImageAsSticker = async (jid, path, quoted, options = {}) => {

        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)

        let buffer

        if (options && (options.packname || options.author)) {

            buffer = await writeExifImg(buff, options)

        } else {

            buffer = await imageToWebp(buff)

        }

        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })

        return buffer

    }

    sock.decodeJid = (jid) => {

        if (!jid) return jid;

        if (/:\d+@/gi.test(jid)) {

            let decode = jidDecode(jid) || {};

            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;

        } else return jid;

    };

    sock.getName = (jid, withoutContact = false) => {

        let id = sock.decodeJid(jid);

        withoutContact = sock.withoutContact || withoutContact;

        let v;

        if (id.endsWith("@g.us"))

            return new Promise(async (resolve) => {

                v = store.contacts[id] || {};

                if (!(v.name || v.subject)) v = await sock.groupMetadata(id) || {}; // Using await for groupMetadata

                resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international")); // Assuming PhoneNumber is available

            });

        else

            v =

                id === "0@s.whatsapp.net"

                    ? {

                        id,

                        name: "WhatsApp",

                    }

                    : id === sock.decodeJid(sock.user.id)

                        ? sock.user

                        : store.contacts[id] || {};

        // Assuming PhoneNumber is available here as well

        return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || (typeof PhoneNumber !== 'undefined' ? PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international") : jid);

    };

    return sock; // Return the extended socket

}

module.exports = extendWASocket;

