const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

const premiumWallCooldown = new Map();
const PREMIUM_WALL_COOLDOWN_MS = 5000;
const PREMIUM_CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds

// This variable controls if the bot is free for all (true = free for all, false = locked)
global.instanceFreeMode = false;

function calculateExpiry(duration) {
    if (typeof duration !== 'string') return null;
    const value = parseInt(duration);
    if (isNaN(value) || value <= 0) return null;
    const unitStr = duration.replace(/[0-9]/g, '').trim().toLowerCase();
    const expiryDate = new Date();
    const unitMap = {
        's': () => expiryDate.setSeconds(expiryDate.getSeconds() + value),
        'sec': () => expiryDate.setSeconds(expiryDate.getSeconds() + value),
        'secs': () => expiryDate.setSeconds(expiryDate.getSeconds() + value),
        'second': () => expiryDate.setSeconds(expiryDate.getSeconds() + value),
        'seconds': () => expiryDate.setSeconds(expiryDate.getSeconds() + value),
        'm': () => expiryDate.setMinutes(expiryDate.getMinutes() + value),
        'min': () => expiryDate.setMinutes(expiryDate.getMinutes() + value),
        'mins': () => expiryDate.setMinutes(expiryDate.getMinutes() + value),
        'minute': () => expiryDate.setMinutes(expiryDate.getMinutes() + value),
        'minutes': () => expiryDate.setMinutes(expiryDate.getMinutes() + value),
        'h': () => expiryDate.setHours(expiryDate.getHours() + value),
        'hr': () => expiryDate.setHours(expiryDate.getHours() + value),
        'hrs': () => expiryDate.setHours(expiryDate.getHours() + value),
        'hour': () => expiryDate.setHours(expiryDate.getHours() + value),
        'hours': () => expiryDate.setHours(expiryDate.getHours() + value),
        'd': () => expiryDate.setDate(expiryDate.getDate() + value),
        'day': () => expiryDate.setDate(expiryDate.getDate() + value),
        'days': () => expiryDate.setDate(expiryDate.getDate() + value),
        'mo': () => expiryDate.setMonth(expiryDate.getMonth() + value),
        'mon': () => expiryDate.setMonth(expiryDate.getMonth() + value),
        'month': () => expiryDate.setMonth(expiryDate.getMonth() + value),
        'months': () => expiryDate.setMonth(expiryDate.getMonth() + value),
        'y': () => expiryDate.setFullYear(expiryDate.getFullYear() + value),
        'yr': () => expiryDate.setFullYear(expiryDate.getFullYear() + value),
        'yrs': () => expiryDate.setFullYear(expiryDate.getFullYear() + value),
        'year': () => expiryDate.setFullYear(expiryDate.getFullYear() + value),
        'years': () => expiryDate.setFullYear(expiryDate.getFullYear() + value),
    };
    const handler = unitMap[unitStr];
    if (!handler) return null;
    handler();
    return expiryDate.getTime();
}

const getPremiumStatus = (userId) => {
    const premiumUsers = global.db.data.premium || [];
    const userEntry = premiumUsers.find(p => p.jid === userId);
    const now = Date.now();
    if (userEntry) {
        if (userEntry.expiry > now) {
            return { isActive: true, isExpired: false };
        } else {
            return { isActive: false, isExpired: true };
        }
    }
    return { isActive: false, isExpired: false };
};

// --- The NEW checkCommandAccess: only blocks when there is NO active premium user
async function checkCommandAccess(Matrix, m, isCreator, command, mess) {
    // If free mode is enabled, everyone can use all commands
    if (global.instanceFreeMode) return false;

    // Sudo/owner/creator always allowed
    const isSudo = global.db.data.settings.sudo.includes(m.sender);
    if (isCreator || isSudo) return false;

    // Otherwise, block all commands for everyone (except sudo/owner/creator)
    if (!m.isGroup) {
        const now = Date.now();
        if (premiumWallCooldown.has(m.sender) && (now - premiumWallCooldown.get(m.sender) < PREMIUM_WALL_COOLDOWN_MS)) {
            return true;
        }
        premiumWallCooldown.set(m.sender, now);

        await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });

        const caption = `
👑🔮𝗤𝗨𝗘𝗘𝗡 𝗔𝗗𝗜𝗭𝗔 𝗕𝗢𝗧🔮👑

🔒 ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ!

ᴛʜɪs ʙᴏᴛ ɪs ᴄᴜʀʀᴇɴᴛʟʏ ʀᴇsᴛʀɪᴄᴛᴇᴅ ᴛᴏ ᴘʀᴇᴍɪᴜᴍ ᴍᴇᴍʙᴇʀs ᴏɴʟʏ.

💎 ᴄᴏɴᴛᴀᴄᴛ *${global.ownername}* ᴛᴏ ᴘᴜʀᴄʜᴀsᴇ ᴘʀᴇᴍɪᴜᴍ ᴀɴᴅ ᴜɴʟᴏᴄᴋ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs ғᴏʀ ᴇᴠᴇʀʏᴏɴᴇ!

*ᴡʜᴀᴛsᴀᴘᴘ:* wa.me/${global.ownernumber}
_🌹 ${global.wm}._
`.trim();

        await Matrix.sendMessage(m.chat, { text: caption }, { quoted: m });
        return true;
    }
    return false;
}

// --- AUTO PREMIUM EXPIRY WATCHER (runs in background, NO GRACE PERIOD) ---
async function autoPremiumExpiryWatcher() {
    console.log(chalk.bgMagenta.bold('[PREMIUM] Premium expiry watcher started.'));
    setInterval(async () => {
        const premiumUsers = global.db.data.premium || [];
        const now = Date.now();

        // Remove expired users
        for (let i = premiumUsers.length - 1; i >= 0; i--) {
            const user = premiumUsers[i];
            if (user.expiry <= now) {
                // Notify user (if possible)
                try {
                    if (global.activeSockets && global.activeSockets[user.jid]) {
                        await global.activeSockets[user.jid].sendMessage(user.jid, {
                            text: `💔 *Your Queen Adiza Bot session has now been disconnected due to expired premium.*\n\nTo reactivate your bot, please renew your subscription. Your WhatsApp remains linked for instant recovery!`
                        });
                        console.log(chalk.yellowBright(`[PREMIUM] Notified expired user: ${user.jid}`));
                    }
                } catch (e) {
                    console.log(chalk.red(`[PREMIUM] Failed to notify expired user ${user.jid}: ${e}`));
                }

                // Disconnect socket if active
                if (global.activeSockets && global.activeSockets[user.jid]) {
                    try {
                        global.activeSockets[user.jid].end();
                        delete global.activeSockets[user.jid];
                        console.log(chalk.cyan(`[PREMIUM] Closed WhatsApp socket for expired user ${user.jid}`));
                    } catch (e) {
                        console.log(chalk.red(`[PREMIUM] Failed to close socket for ${user.jid}: ${e}`));
                    }
                }

                // Notify owner
                try {
                    await global.Matrix.sendMessage(global.OWNER[0], {
                        text: `🔔 Socket for ${user.jid} was auto-disconnected by the premium system (expired premium).`
                    });
                    console.log(chalk.green(`[PREMIUM] Owner notified about auto-disconnect for ${user.jid}`));
                } catch (e) {
                    console.log(chalk.red(`[PREMIUM] Failed to notify owner about auto-disconnect for ${user.jid}: ${e}`));
                }

                // Remove from premium DB
                premiumUsers.splice(i, 1);
                await global.db.write();
                console.log(chalk.bgRed.white.bold(`[PREMIUM] Removed expired user: ${user.jid} from premium array and saved DB.`));
            }
        }

        // Set instanceFreeMode: true if any premium user is active
        global.instanceFreeMode = premiumUsers.some(u => u.expiry > now);
        if (global.instanceFreeMode) {

        } else {

        }
    }, PREMIUM_CHECK_INTERVAL);
}

// --- Start the watcher automatically ---
autoPremiumExpiryWatcher();

module.exports = {
    calculateExpiry,
    isPremium: (userId) => getPremiumStatus(userId).isActive,
    getPremiumStatus,
    checkCommandAccess,
};
