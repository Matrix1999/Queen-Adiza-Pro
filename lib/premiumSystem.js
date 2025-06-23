// ./lib/premiumSystem.js

const { sleep } = require('./myfunc'); // Assuming myfunc has sleep, if not, adjust import

// Add these two lines here to define readmore
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);


/**
 * Calculates the expiry timestamp based on a duration string (e.g., "60d", "24h").
 * @param {string} duration The duration string.
 * @returns {number|null} The expiry timestamp in milliseconds, or null if invalid.
 */
function calculateExpiry(duration) {
    const value = parseInt(duration);
    const unit = duration.slice(-1).toLowerCase();
    let expiryDate = new Date();

    if (isNaN(value)) {
        return null; // Invalid duration
    }

    switch (unit) {
        case 'd': // Days
            expiryDate.setDate(expiryDate.getDate() + value);
            break;
        case 'h': // Hours
            expiryDate.setHours(expiryDate.getHours() + value);
            break;
        case 'm': // Minutes
            expiryDate.setMinutes(expiryDate.getMinutes() + value);
            break;
        case 's': // Seconds (for testing)
            expiryDate.setSeconds(expiryDate.getSeconds() + value);
            break;
        default:
            return null; // Invalid unit
    }
    return expiryDate.getTime(); // Return timestamp
}

/**
 * Checks if a user is currently a premium member and their subscription has not expired.
 * @param {string} userId The JID of the user (e.g., '233544981163@s.whatsapp.net').
 * @returns {boolean} True if the user is premium and not expired, false otherwise.
 */
const isPremium = (userId) => {
    const premiumUsers = global.db.data.premium || []; // Ensure it's an array
    const userEntry = premiumUsers.find(p => p.jid === userId);

    if (userEntry && userEntry.expiry > Date.now()) {
        return true; // User is premium and not expired
    }
    return false; // User is not premium or has expired
};

/**
 * Checks if a command can be accessed by the current user based on premium status.
 * Sends a warning message if access is denied.
 * @param {object} Matrix The WhatsApp socket instance.
 * @param {object} m The serialized message object.
 * @param {boolean} isCreator True if the sender is the bot owner.
 * @param {string} command The command name.
 * @param {object} mess The global messages object.
 * @returns {Promise<boolean>} True if the command was blocked, false if allowed to proceed.
 */
async function checkCommandAccess(Matrix, m, isCreator, command, mess) {
    // Commands that should always be accessible to all users (even non-premium)
    const freeCommands = ['start', 'help', 'alive', 'owner', 'modestatus', 'botmode', 'listprem', 'menu']; // Added 'menu' to freeCommands based on previous discussions

    console.log(`[PREMIUM_DEBUG] --- checkCommandAccess called for command: ${command} ---`);
    console.log(`[PREMIUM_DEBUG] Sender: ${m.sender}`);
    console.log(`[PREMIUM_DEBUG] isCreator: ${isCreator}`);
    console.log(`[PREMIUM_DEBUG] m.isBaileys: ${m.isBaileys}`);
    console.log(`[PREMIUM_DEBUG] m.isCmd: ${m.isCmd}`);
    console.log(`[PREMIUM_DEBUG] freeCommands includes "${command}": ${freeCommands.includes(command)}`);

    // Don't block Baileys internal messages or if it's not a command
    if (m.isBaileys || !m.isCmd) {
        console.log(`[PREMIUM_DEBUG] Bypassing: m.isBaileys (${m.isBaileys}) or !m.isCmd (${!m.isCmd}). Result: ALLOWED`);
        return false;
    }

    // If it's a free command, allow it to proceed
    if (freeCommands.includes(command)) {
        console.log(`[PREMIUM_DEBUG] Bypassing: Command "${command}" is in freeCommands. Result: ALLOWED`);
        return false;
    }

    // If the user is the creator, allow access
    if (isCreator) {
        console.log(`[PREMIUM_DEBUG] Bypassing: User is creator. Result: ALLOWED`);
        return false;
    }

    // Check if the user is premium
    const isUserPremium = isPremium(m.sender);
    console.log(`[PREMIUM_DEBUG] isUserPremium: ${isUserPremium}`);


    if (!isUserPremium) {
        // If not creator and not premium, block the command
        console.log(`[PREMIUM_DEBUG] Blocking: User is not creator AND not premium. Sending premium message with photo.`);
        await Matrix.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });

        // --- START OF NEW FANCY RESPONSE WITH PHOTO AND ENHANCED DESCRIPTION ---
        const premiumImageUrl = 'https://files.catbox.moe/sgmydn.jpeg'; // Your provided image URL

        // It's crucial that 'readmore' is defined globally (e.g., in system.js or index.js)
        // or add: const more = String.fromCharCode(8206); const readmore = more.repeat(4001); at the top of this file.
        const fancyCaption = `
👧🌹𝗤𝗨𝗘𝗘𝗡 𝗔𝗗𝗜𝗭𝗔🌹👧

🔒 Access to this command is exclusively for our valued Premium Members.

    Contact *${global.ownername}* directly to learn more about our premium plans and exclusive offers!
    *WhatsApp:* wa.me/${global.ownernumber}

_🌹 ${global.wm}._
        `.trim();

        await Matrix.sendMessage(m.chat, {
            image: { url: premiumImageUrl },
            caption: fancyCaption,
            contextInfo: {
                
                }
        }, { quoted: m }); // Quoting the original message for context
        // --- END OF NEW FANCY RESPONSE WITH PHOTO AND ENHANCED DESCRIPTION ---

        console.log(`[PREMIUM_DEBUG] Blocking: Result: BLOCKED`);
        return true; // Command was blocked
    }

    console.log(`[PREMIUM_DEBUG] Allowing: User is premium. Result: ALLOWED`);
    return false; // Command is allowed to proceed (user is premium)
}

module.exports = {
    calculateExpiry,
    isPremium,
    checkCommandAccess,
};
