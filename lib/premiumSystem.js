const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws'); 
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

const premiumWallCooldown = new Map();
const PREMIUM_WALL_COOLDOWN_MS = 5000;
const PREMIUM_CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds (10 seconds)
// Removed PREMIUM_WARNING_WINDOW_MS as we are going back to direct expiry handling

// This variable controls if the bot is free for all (true = free for all, false = locked)
global.instanceFreeMode = false;

// New Map to track users who have been *notified of expiry*
// This will prevent re-notifying a user multiple times if the socket disconnects and reconnects
// within the same expiry window before they are removed from DB.
const notifiedExpiredUsers = new Map();

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
            return { isActive: true, isExpired: false, expiryTime: userEntry.expiry };
        } else {
            return { isActive: false, isExpired: true, expiryTime: userEntry.expiry };
        }
    }
    return { isActive: false, isExpired: false, expiryTime: null };
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

💎 ᴄᴏɴᴛᴀᴄᴛ *${global.ownername}* ᴛᴏ ᴘᴜʀᴄʜᴀsᴇ ᴘ𝗿𝗲𝗺𝗶𝘂𝗺 ᴀɴᴅ ᴜɴʟᴏᴄᴋ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs ғᴏʀ ᴇᴠᴇʀʏO𝗻𝗲!

*ᴡʜᴀᴛsᴀᴘᴘ:* wa.me/${global.ownernumber}
_🌹 ${global.wm}._
`.trim();

        await Matrix.sendMessage(m.chat, { text: caption }, { quoted: m });
        return true;
    }
    return false;
}

// --- AUTO PREMIUM EXPIRY WATCHER (runs in background) ---
async function autoPremiumExpiryWatcher() {
    console.log(chalk.bgMagenta.bold('[PREMIUM] Premium expiry watcher started.'));

    // --- Function to handle a single expired user ---
    // isInitialCheck: true if called during bot startup, false if during interval check
    const handleUserPremiumStatus = async (user, isInitialCheck = false) => {
        const jid = user.jid;
        const currentSocketInfo = global.activeSockets[jid];
        const now = Date.now();
        const expiryTime = user.expiry;

        // Debug log socket state
        const ws = currentSocketInfo?.sock?.ws;
        const wsState = ws ? ws.readyState : undefined;
       // console.log(`[PREMIUM] Socket readyState for ${jid}: ${wsState}`);

        // Check if premium has fully expired
        if (expiryTime <= now) {
            // This user is fully expired.
            // Only notify if bot is NOT on initial startup check AND a socket is active and open or connecting,
            // AND we haven't notified them already for this expiry.
            if (
                !isInitialCheck &&
                !notifiedExpiredUsers.has(jid) &&
                currentSocketInfo &&
                currentSocketInfo.sock &&
                (wsState === WebSocket.OPEN || wsState === WebSocket.CONNECTING || wsState === undefined)
            ) {
                // Clear the keepAliveInterval for this specific socket
                if (currentSocketInfo.keepAliveIntervalId) {
                    clearInterval(currentSocketInfo.keepAliveIntervalId);
                    console.log(chalk.magenta(`[PREMIUM] Cleared keepAliveInterval for ${jid} (expired).`));
                }
                
                // Send notification message BEFORE ending the socket
                try {
                    console.log(`[PREMIUM] Sending expiry notification to ${jid}`);
                    await currentSocketInfo.sock.sendMessage(jid, {
                        text: `💔 *Your Queen Adiza Bot session has now been disconnected due to expired premium.*\n\nTo reactivate your bot, please renew your subscription. Your WhatsApp remains linked for instant recovery!`
                    });
                    console.log(`[PREMIUM] Notification sent to ${jid}`);
                    notifiedExpiredUsers.set(jid, true); // Mark as notified
                } catch (e) {
                    console.log(`[PREMIUM] Failed to notify expired user ${jid}: ${e.message}`);
                    // Even if message fails, mark as notified to avoid re-attempts
                    notifiedExpiredUsers.set(jid, true);
                }

                // Wait 2 seconds to ensure message delivery before disconnecting
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    // Now that the message is sent (or attempted), disconnect the socket
                    currentSocketInfo.sock.end(); // This will trigger the connection.update 'close' event for rentbot.js
                    console.log(chalk.cyan(`[PREMIUM] Closed WhatsApp socket for expired user ${jid}`));
                } catch (e) {
                    console.log(chalk.red(`[PREMIUM] Failed to cleanly end socket for ${jid}: ${e.message}`));
                }
                
                // Remove the socket reference immediately to prevent other parts of the system from trying to use it
                if (global.activeSockets[jid]) {
                    delete global.activeSockets[jid];
                    console.log(chalk.yellow(`[PREMIUM] Removed socket for ${jid} from global.activeSockets.`));
                }
            } else {
                // This path is taken if:
                // 1. It's an initial startup check (isInitialCheck is true)
                // OR
                // 2. It's an interval check, but no active/open socket was found to notify/disconnect from premiumSystem.js
                // OR
                // 3. User was already notified for this expiry
                 console.log(chalk.gray(`[PREMIUM] User ${jid} expired. No active socket to notify/disconnect OR already notified. Removing from premium list.`));
                 // Still ensure socket is gone if it somehow was there but not open (e.g. CLOSING/CLOSED state)
                 if (currentSocketInfo && currentSocketInfo.sock && currentSocketInfo.sock.ws) {
                    if (currentSocketInfo.keepAliveIntervalId) {
                        clearInterval(currentSocketInfo.keepAliveIntervalId);
                        console.log(chalk.magenta(`[PREMIUM] Cleared keepAliveInterval for ${jid} (socket not open, but existed).`));
                    }
                    try {
                        currentSocketInfo.sock.end(); // Attempt to end, even if not OPEN
                    } catch (e) {
                        // console.log(chalk.red(`[PREMIUM] Error ending non-open socket for ${jid}: ${e.message}`)); // Removed to reduce noise
                    }
                    delete global.activeSockets[jid];
                    console.log(chalk.yellow(`[PREMIUM] Removed socket for ${jid} from global.activeSockets (expired, not open).`));
                 }
            }

            // Remove from the notifiedExpiredUsers map (important for future renewals)
            notifiedExpiredUsers.delete(jid);
            return 'expired'; // Indicate that the user expired and should be removed from DB
        }

        // If the user is still active (not expired), ensure they are not in notifiedExpiredUsers
        // This is important if premium was extended before expiry
        if (notifiedExpiredUsers.has(jid)) {
            notifiedExpiredUsers.delete(jid);
            console.log(chalk.blue(`[PREMIUM] User ${jid} premium renewed/still active, removed from notifiedExpiredUsers.`));
        }

        return 'active'; // Indicate that the user is still active
    };


    // --- Initial check on bot startup ---
    let initialPremiumUsers = global.db.data.premium || []; // Re-fetch to ensure we have the latest
    const nowAtStartup = Date.now();
    let startupExpiredCount = 0;
    
    // Create a new array for updated premium users
    let updatedInitialPremiumUsers = [];

    for (const user of initialPremiumUsers) {
        if (user.expiry <= nowAtStartup) {
            // User expired before startup. Process silently by setting isInitialCheck to true.
            await handleUserPremiumStatus(user, true);
            startupExpiredCount++;
        } else {
            // User is still active, add to the new array
            updatedInitialPremiumUsers.push(user);
        }
    }
    
    // Update the global premium array and save if any changes
    if (startupExpiredCount > 0) {
        global.db.data.premium = updatedInitialPremiumUsers;
        await global.db.write();
        console.log(chalk.bgRed.white.bold(`[PREMIUM] Initial cleanup: Removed ${startupExpiredCount} expired users from premium array and saved DB.`));
    }


    // --- Regular interval check ---
    setInterval(async () => {
        let premiumUsers = global.db.data.premium || []; // Re-fetch for each interval
        const now = Date.now();
        let intervalExpiredCount = 0;
        let dbModified = false;

        // Create a new array to store active premium users after this check
        let newPremiumUsersArray = [];

        for (const user of premiumUsers) {
            const status = await handleUserPremiumStatus(user, false); // false for isInitialCheck
            if (status === 'expired') {
                intervalExpiredCount++;
                dbModified = true; // Mark for DB write
            } else {
                newPremiumUsersArray.push(user); // Keep active users
            }
        }

        // Update the global premium array if any users were removed
        if (dbModified) {
            global.db.data.premium = newPremiumUsersArray;
            await global.db.write();
            console.log(chalk.bgRed.white.bold(`[PREMIUM] Interval cleanup: Removed ${intervalExpiredCount} newly expired users from premium array and saved DB.`));
        }


        // Set instanceFreeMode: true if any premium user is active
        global.instanceFreeMode = newPremiumUsersArray.some(u => u.expiry > now);
        if (global.instanceFreeMode) {
            // console.log(chalk.greenBright('[PREMIUM] Instance is in Free Mode (at least one premium user active).'));
        } else {
            // console.log(chalk.redBright('[PREMIUM] Instance is in Premium-Only Mode (no active premium users).'));
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

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    // console.log(chalk.redBright(`Update detected in '${__filename}'`)); // Removed
    delete require.cache[file];
    require(file);
});
