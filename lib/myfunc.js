const {
    proto,
    delay,
    getContentType,
    jidNormalizedUser, // Already present, good.
    downloadContentFromMessage // <<< ADDED: Essential for download helpers
} = require('@whiskeysockets/baileys');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');
const { sizeFormatter } = require('human-readable');
const util = require('util');
const Jimp = require('jimp'); // Jimp is correctly imported here

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);
exports.unixTimestampSeconds = unixTimestampSeconds;

exports.generateMessageTag = (epoch) => {
    let tag = exports.unixTimestampSeconds().toString();
    if (epoch) tag += '.--' + epoch; // attach epoch if provided
    return tag;
};

exports.processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

exports.getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

exports.getImg = exports.getBuffer; // Alias for getBuffer

exports.checkBandwidth = async () => {
    let ind = 0;
    let out = 0;
    for (let i of await require("node-os-utils").netstat.stats()) {
        ind += parseInt(i.inputBytes);
        out += parseInt(i.outputBytes);
    }
    return {
        download: exports.bytesToSize(ind),
        upload: exports.bytesToSize(out),
    };
};

exports.formatSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

exports.fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

exports.runtime = function(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

exports.clockString = (ms) => {
    const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

exports.isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
};

/**
 * Get current time formatted in a specified timezone.
 * Defaults to Africa/Accra (Ghana).
 * @param {string} format - Moment.js format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @param {string} timezone - Timezone string (default: 'Africa/Accra')
 * @param {Date|string} date - Optional date to format, defaults to now
 * @returns {string} Formatted time string
 */
exports.getTime = (format = 'YYYY-MM-DD HH:mm:ss', date = null, timezone = 'Africa/Accra') => {
    if (date) {
        return moment.tz(date, timezone).locale('en').format(format);
    } else {
        return moment.tz(timezone).locale('en').format(format);
    }
};

exports.formatDate = (n, locale = 'en') => {
    const d = new Date(n);
    return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
};

exports.formatDateTime = (n, locale = 'en') => {
    const d = new Date(n);
    return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    }) + ' ' + d.toLocaleTimeString(locale);
};

exports.tanggal = (numer) => {
    const myMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const myDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const tgl = new Date(numer);
    const day = tgl.getDate();
    const bulan = tgl.getMonth();
    const thisDay = myDays[tgl.getDay()];
    const yy = tgl.getYear();
    const year = (yy < 1000) ? yy + 1900 : yy;

    return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
};

exports.jam = (numer, options = {}) => {
    const format = options.format || "HH:mm";
    // Use Africa/Accra timezone by default
    const timezone = options.timezone || 'Africa/Accra';
    return moment.tz(numer, timezone).format(format);
};

exports.formatp = sizeFormatter({
    std: 'JEDEC', //'SI' = default | 'IEC' | 'JEDEC'
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
});

exports.json = (string) => {
    return JSON.stringify(string, null, 2);
};

function format(...args) {
    return util.format(...args);
}

exports.logic = (check, inp, out) => {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length');
    for (let i in inp)
        if (util.isDeepStrictEqual(check, inp[i])) return out[i];
    return null;
};

exports.generateProfilePicture = async (buffer) => {
    const jimp = await Jimp.read(buffer);
    const min = jimp.getWidth();
    const max = jimp.getHeight();
    const cropped = jimp.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    };
};

exports.bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

exports.getSizeMedia = (path) => {
    return new Promise((resolve, reject) => {
        if (/^https?:\/\//.test(path)) {
            axios.get(path)
                .then((res) => {
                    const length = parseInt(res.headers['content-length']);
                    const size = exports.bytesToSize(length, 3);
                    if (!isNaN(length)) resolve(size);
                    else reject('Invalid content length');
                })
                .catch(reject);
        } else if (Buffer.isBuffer(path)) {
            const length = Buffer.byteLength(path);
            const size = exports.bytesToSize(length, 3);
            if (!isNaN(length)) resolve(size);
            else reject('Invalid buffer length');
        } else {
            reject('Unsupported path type');
        }
    });
};

exports.parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
};

exports.getGroupAdmins = (participants) => {
    const admins = [];
    for (const i of participants) {
        if (i.admin === "superadmin" || i.admin === "admin") {
            admins.push(i.id.trim()); // ADDED .trim() for clean JIDs
        }
    }
    return admins;
};

/**
 * Serialize Message
 * @param {WAConnection} Matrix
 * @param {Object} m
 * @param {object} store
 */
exports.smsg = (Matrix, m, store = {}) => { // <<< MODIFIED: Added store = {} default value
    if (!m) return m;
    const M = proto.WebMessageInfo;

    if (m.key) {
        m.id = m.key.id;
        m.isBaileys =
            (m.id.startsWith('BAE5') && m.id.length === 16) ||
            (m.id.startsWith('3EBO') && m.id.length === 22) ||
            (!m.id.startsWith('3EBO') && m.id.length === 22) ||
            (m.id.length !== 32 && m.id.length !== 20);
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = jidNormalizedUser(m.fromMe && Matrix.user.id || m.participant || m.key.participant || m.chat || '');
        // Removed the typeof check for jidNormalizedUser as it's directly imported and expected to be a function.
        if (m.isGroup) m.participant = jidNormalizedUser(Matrix.decodeJid(m.key.participant)) || '';
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype === 'viewOnceMessage')
            ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
            : m.message[m.mtype];
        m.body = m.message.conversation ||
            (m.msg && m.msg.caption) ||
            (m.msg && m.msg.text) ||
            (m.mtype === 'listResponseMessage' && m.msg && m.msg.singleSelectReply?.selectedRowId) ||
            (m.mtype === 'buttonsResponseMessage' && m.msg && m.msg.selectedButtonId) ||
            (m.mtype === 'viewOnceMessage' && m.msg && m.msg.caption) ||
            m.text;

        // --- FIXED QUOTED MESSAGE HANDLING ---
        const rawQuotedFromContext = m.msg?.contextInfo?.quotedMessage;
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || [];

        if (rawQuotedFromContext) {
            let actualQuotedContent = rawQuotedFromContext.message || rawQuotedFromContext;
            let actualQuotedContentType = getContentType(actualQuotedContent);
            if (actualQuotedContentType === 'viewOnceMessage' || actualQuotedContentType === 'viewOnceMessageV2') {
                actualQuotedContent = actualQuotedContent[actualQuotedContentType].message;
                actualQuotedContentType = getContentType(actualQuotedContent);
            }

            // --- THIS IS THE FIX: Build the key from contextInfo ---
            const ctx = m.msg.contextInfo;
            m.quoted = {
                key: {
                    id: ctx.stanzaId,
                    fromMe: ctx.participant === (Matrix.user && Matrix.decodeJid(Matrix.user.id)),
                    remoteJid: m.chat,
                    participant: ctx.participant
                },
                message: actualQuotedContent,
                mtype: actualQuotedContentType,
                sender: jidNormalizedUser(ctx.participant), // Use jidNormalizedUser directly
                fromMe: jidNormalizedUser(ctx.participant) === (Matrix.user && jidNormalizedUser(Matrix.user.id)), // Use jidNormalizedUser consistently
                mentionedJid: ctx.mentionedJid || []
            };

            m.quoted.text = m.quoted.message.conversation ||
                            m.quoted.message[m.quoted.mtype]?.caption ||
                            m.quoted.message.extendedTextMessage?.text ||
                            m.quoted.message[m.quoted.mtype]?.text ||
                            m.quoted.message.contentText ||
                            m.quoted.message.selectedDisplayText ||
                            m.quoted.message.title || '';

            m.quoted.isBaileys = false;
            if (m.quoted.key && typeof m.quoted.key.id === "string") {
                const id = m.quoted.key.id;
                m.quoted.isBaileys =
                    id.startsWith('BAE5') ||
                    (id.startsWith('3EBO') && id.length === 22) ||
                    (!id.startsWith('3EBO') && id.length === 22) ||
                    (id.length !== 32 && id.length !== 20);
            }


            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.key.id) return false;
                // Attempt to load from store first
                let q = await store.loadMessage(m.chat, m.quoted.key.id);
                // If not in store, fetch from WA if possible (only if sock has getMessage capability)
                if (!q && Matrix.getMessage) {
                    q = await Matrix.getMessage(m.quoted.key);
                }
                return exports.smsg(Matrix, q, store); // Pass store recursively
            };

            let vM = m.quoted.fakeObj = M.fromObject({
                key: m.quoted.key,
                message: m.quoted.message,
                ...(m.isGroup ? { participant: m.quoted.sender } : {}),
            });

            m.quoted.download = async () => {
                let contentToDownload = m.quoted.message;
                let contentType = m.quoted.mtype;
                if (contentType === 'viewOnceMessage' || contentType === 'viewOnceMessageV2') {
                    contentToDownload = m.quoted.message[contentType].message;
                    contentType = getContentType(contentToDownload);
                }
                if (contentToDownload && contentToDownload[contentType]) {
                    // Use downloadContentFromMessage from Baileys.
                    // It expects the message content directly, not a wrapper like m.quoted.message[type]
                    // and also expects the original message type without 'Message' suffix.
                    try {
                        const stream = await downloadContentFromMessage(contentToDownload[contentType], contentType.replace('Message', ''));
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) {
                            buffer = Buffer.concat([buffer, chunk]);
                        }
                        return buffer;
                    } catch (e) {
                        console.error("Error downloading quoted media:", e);
                        return null;
                    }
                }
                throw new Error(`Cannot download media from quoted message type: ${contentType}`);
            };

            m.quoted.delete = () => Matrix.sendMessage(m.quoted.key.remoteJid, { delete: vM.key });
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => Matrix.copyNForward(jid, vM, forceForward, options);
            // --- END FIXED QUOTED MESSAGE HANDLING ---
        }
    }
    if (m.msg && m.msg.url) {
        // This download is for the main message if it's media.
        m.download = async () => {
            try {
                // Ensure m.msg has the necessary properties for downloadContentFromMessage
                const type = m.mtype;
                if (!m.msg || !m.msg.mediaKey) {
                    throw new Error("Media key missing for main message. Cannot download.");
                }
                const stream = await downloadContentFromMessage(m.msg, type.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            } catch (e) {
                console.error("Error downloading main media:", e);
                return null;
            }
        };
    }

    m.text = m.message?.conversation || m.msg?.text || m.msg?.caption || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || '';

    m.reply = (text, chatId = m.chat, options = {}) =>
        Buffer.isBuffer(text)
            ? Matrix.sendMedia(chatId, text, 'file', '', m, { ...options }) // This `sendMedia` is likely from `extendWASocket`
            : Matrix.sendText(chatId, text, m, { ...options }); // This `sendText` is likely from `extendWASocket`

    m.copy = () => exports.smsg(Matrix, M.fromObject(M.toObject(m)));
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => Matrix.copyNForward(jid, m, forceForward, options);

    return m;
};


exports.reSize = (buffer, width, height) => {
    return new Promise(async (resolve, reject) => {
        try {
            const image = await Jimp.read(buffer);
            const resized = await image.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
            resolve(resized);
        } catch (error) {
            reject(error);
        }
    });
};
