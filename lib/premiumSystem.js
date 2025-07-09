const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws'); 
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

const premiumWallCooldown = new Map();
const PREMIUM_WALL_COOLDOWN_MS = 5000;
const PREMIUM_CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds

global.instanceFreeMode = false;
const notifiedExpiredUsers = new Map();

// --- ENHANCED EXPIRY NOTIFICATION BLOCK ---
const expiryNotification = {
    image: { url: "https://i.ibb.co/kVJSVzFT/jin5.jpg" },
    caption:
`╭❰🌹💎𝗣𝗥𝗘𝗠𝗜𝗨𝗠💎🌹❱╮

📊 *Your Queen Adiza Bot session has been disconnected!*

⏳ *Your premium subscription has expired*.

✨ *Don't worry! Your WhatsApp remains linked for instant recovery.*

🔄 *To reactivate your bot*, simply renew your premium subscription and unlock all the royal features again!

━━━━━━━━━━━━━━━━━━━
👑 *Contact Owner to Renew:*
wa.me/${global.ownernumber}
━━━━━━━━━━━━━━━━━━━

🌹 Thank you for being a valued member of the *Queen Adiza* family!☺
╰━━━━━━━━━━━━━━━━━━━╯`
};
// --- END ENHANCED BLOCK ---

// ... your calculateExpiry and other functions remain unchanged ...

const getPremiumStatus = (userId) => {
    const premiumUsers = (global.db.data && global.db.data.premium) || [];
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

// ... your checkCommandAccess function remains unchanged ...

// --- AUTO PREMIUM EXPIRY WATCHER (runs in background) ---
async function autoPremiumExpiryWatcher() {
    console.log(chalk.bgMagenta.bold('[PREMIUM] Premium expiry watcher started.'));

    // Wait until global.db.data is initialized
    while (!global.db.data) {
        console.log('[PREMIUM] Waiting for database initialization...');
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const handleUserPremiumStatus = async (user, isInitialCheck = false) => {
        const jid = user.jid;
        const currentSocketInfo = global.activeSockets[jid];
        const now = Date.now();
        const expiryTime = user.expiry;

        const ws = currentSocketInfo?.sock?.ws;
        const wsState = ws ? ws.readyState : undefined;

        if (expiryTime <= now) {
            if (
                !isInitialCheck &&
                !notifiedExpiredUsers.has(jid) &&
                currentSocketInfo &&
                currentSocketInfo.sock &&
                (wsState === WebSocket.OPEN || wsState === WebSocket.CONNECTING || wsState === undefined)
            ) {
                if (currentSocketInfo.keepAliveIntervalId) {
                    clearInterval(currentSocketInfo.keepAliveIntervalId);
                    console.log(chalk.magenta(`[PREMIUM] Cleared keepAliveInterval for ${jid} (expired).`));
                }
                try {
                    console.log(`[PREMIUM] Sending expiry notification to ${jid}`);
                    await currentSocketInfo.sock.sendMessage(jid, expiryNotification);
                    console.log(`[PREMIUM] Notification sent to ${jid}`);
                    notifiedExpiredUsers.set(jid, true);
                } catch (e) {
                    console.log(`[PREMIUM] Failed to notify expired user ${jid}: ${e.message}`);
                    notifiedExpiredUsers.set(jid, true);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    currentSocketInfo.sock.end();
                    console.log(chalk.cyan(`[PREMIUM] Closed WhatsApp socket for expired user ${jid}`));
                } catch (e) {
                    console.log(chalk.red(`[PREMIUM] Failed to cleanly end socket for ${jid}: ${e.message}`));
                }
                if (global.activeSockets[jid]) {
                    delete global.activeSockets[jid];
                    console.log(chalk.yellow(`[PREMIUM] Removed socket for ${jid} from global.activeSockets.`));
                }
            } else if (
                !isInitialCheck &&
                !notifiedExpiredUsers.has(jid)
            ) {
                try {
                    if (global.mainMatrix) {
                        await global.mainMatrix.sendMessage(jid, expiryNotification);
                        console.log(`[PREMIUM] Fallback notification sent to ${jid} from main bot.`);
                        notifiedExpiredUsers.set(jid, true);
                    } else {
                        console.log(`[PREMIUM] No main bot socket available for fallback notification to ${jid}.`);
                    }
                } catch (e) {
                    console.log(`[PREMIUM] Fallback notification failed for ${jid}: ${e.message}`);
                    notifiedExpiredUsers.set(jid, true);
                }
            } else {
                console.log(chalk.gray(`[PREMIUM] User ${jid} expired. No active socket to notify/disconnect OR already notified. Removing from premium list.`));
                if (currentSocketInfo && currentSocketInfo.sock && currentSocketInfo.sock.ws) {
                    if (currentSocketInfo.keepAliveIntervalId) {
                        clearInterval(currentSocketInfo.keepAliveIntervalId);
                        console.log(chalk.magenta(`[PREMIUM] Cleared keepAliveInterval for ${jid} (socket not open, but existed).`));
                    }
                    try {
                        currentSocketInfo.sock.end();
                    } catch (e) {}
                    delete global.activeSockets[jid];
                    console.log(chalk.yellow(`[PREMIUM] Removed socket for ${jid} from global.activeSockets (expired, not open).`));
                }
            }

            notifiedExpiredUsers.delete(jid);
            return 'expired';
        }

        if (notifiedExpiredUsers.has(jid)) {
            notifiedExpiredUsers.delete(jid);
            console.log(chalk.blue(`[PREMIUM] User ${jid} premium renewed/still active, removed from notifiedExpiredUsers.`));
        }
        return 'active';
    };

    // --- Initial check on bot startup ---
    let initialPremiumUsers = global.db.data.premium || [];
    const nowAtStartup = Date.now();
    let startupExpiredCount = 0;
    let updatedInitialPremiumUsers = [];

    for (const user of initialPremiumUsers) {
        if (user.expiry <= nowAtStartup) {
            await handleUserPremiumStatus(user, true);
            startupExpiredCount++;
        } else {
            updatedInitialPremiumUsers.push(user);
        }
    }

    if (startupExpiredCount > 0) {
        global.db.data.premium = updatedInitialPremiumUsers;
        await global.db.write();
        console.log(chalk.bgRed.white.bold(`[PREMIUM] Initial cleanup: Removed ${startupExpiredCount} expired users from premium array and saved DB.`));
    }

    // --- Regular interval check ---
    setInterval(async () => {
        let premiumUsers = global.db.data.premium || [];
        const now = Date.now();
        let intervalExpiredCount = 0;
        let dbModified = false;
        let newPremiumUsersArray = [];

        for (const user of premiumUsers) {
            const status = await handleUserPremiumStatus(user, false);
            if (status === 'expired') {
                intervalExpiredCount++;
                dbModified = true;
            } else {
                newPremiumUsersArray.push(user);
            }
        }

        if (dbModified) {
            global.db.data.premium = newPremiumUsersArray;
            await global.db.write();
            console.log(chalk.bgRed.white.bold(`[PREMIUM] Interval cleanup: Removed ${intervalExpiredCount} newly expired users from premium array and saved DB.`));
        }

        global.instanceFreeMode = newPremiumUsersArray.some(u => u.expiry > now);
    }, PREMIUM_CHECK_INTERVAL);
}

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
    delete require.cache[file];
    require(file);
});
