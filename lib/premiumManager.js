const chalk = require('chalk');
const fs = require('fs-extra'); 
const path = require('path');
const axios = require('axios'); 

// Premium API Server URL and API Key from global settings
let PREMIUM_API_URL;
let BOT_API_KEY;

let cachedPremiumUsers = {};
const CACHE_REFRESH_INTERVAL = 10 * 60 * 1000; // Cache refresh every 10 minutes
const API_REQUEST_TIMEOUT = 60000; // 60 seconds timeout for API requests (Increased for testing)
let lastCacheRefresh = 0;

const registeredServices = new Set(['all_access']);

// --- Helper to ensure global variables are loaded ---
function ensureSettingsLoaded() {
    if (!global.premiumApiUrl || !global.botApiKey) {
        console.warn(chalk.red("[PremiumManager DEBUG] Settings not found on first load. Trying to load now."));
        try {
            require('../settings'); // Corrected path to settings.js
            PREMIUM_API_URL = global.premiumApiUrl;
            BOT_API_KEY = global.botApiKey;

        } catch (e) {
            console.error(chalk.yellow("[PremiumManager DEBUG] FATAL: Failed to re-load settings. Premium functions will NOT work."), e);
            PREMIUM_API_URL = 'http://localhost:invalid'; // Prevent further calls
            BOT_API_KEY = 'invalid';
        }
    } else {
        PREMIUM_API_URL = global.premiumApiUrl;
        BOT_API_KEY = global.botApiKey;
    }
}

// --- Function to fetch all premium users from API and cache ---
async function refreshCache(force = false) {
    ensureSettingsLoaded();

    const now = Date.now();
    // Allow refreshing if the cache is older than the interval, or if it's empty (first load scenario)
    if (!force && now - lastCacheRefresh < CACHE_REFRESH_INTERVAL && Object.keys(cachedPremiumUsers).length > 0) {
        return; // Don't refresh if too recent and cache is not empty
    }

    try {
        console.log(chalk.green("[PremiumManager DEBUG] Refreshing premium user cache from API..."));
        const response = await axios.get(`${PREMIUM_API_URL}/premium/list`, {
            headers: { 'X-Api-Key': BOT_API_KEY },
            timeout: API_REQUEST_TIMEOUT
        });

        console.log(chalk.green(`[PremiumManager DEBUG] API Response: ${response.status}`));

        if (response.status !== 200) {
            throw new Error(`API returned non-200 status: ${response.status}. Data: ${JSON.stringify(response.data)}`);
        }

        const data = response.data;
        if (data.status && data.users) {
            cachedPremiumUsers = data.users;
            lastCacheRefresh = now;
        } else {
            console.error(chalk.red("[PremiumManager DEBUG] API list response missing 'status' or 'users'."), data);
        }
    } catch (error) {
        console.error(chalk.yellow("[PremiumManager DEBUG] Error refreshing premium user cache from API:"), error.message);
        if (error.response) {
            console.error(chalk.yellow("[PremiumManager DEBUG] API Response error status:"), error.response.status);
            console.error(chalk.red("[PremiumManager DEBUG] API Response error data:"), error.response.data);
        }
    }
}

// Immediately refresh cache when module loads (asynchronously)
refreshCache();
// Also set an interval to refresh cache periodically
setInterval(refreshCache, CACHE_REFRESH_INTERVAL);


/**
 * Add or update a premium user subscription via API.
 * @param {string} userId WhatsApp JID of the user.
 * @param {number} days Number of days (can be fractional) to add premium for.
 * @param {string|null} username Optional display name.
 * @param {string} premiumType 'all_access' or 'single_service'.
 * @param {string|null} serviceName Command name if premiumType is 'single_service'.
 * @returns {Promise<object|null>} The user object from API if successful, or null.
 */
async function addPremiumUser(userId, days, username = null, premiumType, serviceName = null) {
    ensureSettingsLoaded();
    console.log(chalk.green(`[PremiumManager DEBUG] addPremiumUser called with:`));
    console.log(chalk.blue(`  userId: ${userId}`));
    console.log(chalk.green(`  days: ${days}`));
    console.log(chalk.yellow(`  username: ${username}`));
    console.log(chalk.white(`  premiumType: ${premiumType}`));
    console.log(chalk.green(`  serviceName: ${serviceName}`));
    console.log(chalk.blue(`[PremiumManager DEBUG] Using API URL: "${PREMIUM_API_URL}"`));

    try {
        const response = await axios.post(`${PREMIUM_API_URL}/premium/add`, {
            userId,
            days,
            username,
            premiumType,
            serviceName
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': BOT_API_KEY
            },
            timeout: API_REQUEST_TIMEOUT
        });

        console.log(`[PremiumManager DEBUG] API Response: ${response.status}`);
        console.log(`[PremiumManager DEBUG] API Response Data:`, response.data);

        if (response.status !== 200) {
            throw new Error(`API 'add' failed with status ${response.status}: ${JSON.stringify(response.data)}`);
        }

        const data = response.data;
        if (data.status && data.user) {
            cachedPremiumUsers[userId] = data.user;
            console.log(`[PremiumManager DEBUG] Successfully added premium user:`, data.user);
            return data.user;
        } else {
            console.error(`[PremiumManager DEBUG] API 'add' response invalid or failure:`, data);
            return null;
        }
    } catch (error) {
        console.error(`[PremiumManager DEBUG] Error adding premium user via API:`, error.message);
        if (error.response) {
            console.error(`[PremiumManager DEBUG] API Response error status: ${error.response.status}`);
            console.error(`[PremiumManager DEBUG] API Response error data:`, error.response.data);
        }
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            console.error(`[PremiumManager DEBUG] Request timed out.`);
        }
        return null;
    }
}

/**
 * Deletes a premium subscription for a user via API.
 * @param {string} userId WhatsApp JID of the user.
 * @param {string|null} serviceName Optional: The specific service name to delete. If null, deletes 'all_access'.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
async function delPremiumUser(userId, serviceName = null) {
    ensureSettingsLoaded();
    console.log(`[PremiumManager DEBUG] delPremiumUser called with:`);
    console.log(`  userId: ${userId}`);
    console.log(`  serviceName: ${serviceName}`);
    console.log(`[PremiumManager DEBUG] Using API URL: "${PREMIUM_API_URL}"`);

    try {
        const response = await axios.post(`${PREMIUM_API_URL}/premium/delete`, {
            userId,
            serviceName
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': BOT_API_KEY
            },
            timeout: API_REQUEST_TIMEOUT
        });

        console.log(`[PremiumManager DEBUG] API Response: ${response.status}`);

        if (response.status !== 200) {
            throw new Error(`API 'delete' failed with status ${response.status}: ${JSON.stringify(response.data)}`);
        }

        const data = response.data;
        if (data.status) {
            if (!serviceName || serviceName === 'all_access') {
                delete cachedPremiumUsers[userId];
            } else {
                await refreshCache(true); // Force immediate cache refresh on single service delete
            }
            console.log(`[PremiumManager DEBUG] Successfully deleted premium user: ${userId} service: ${serviceName}`);
            return true;
        } else {
            console.error(`[PremiumManager DEBUG] API 'delete' response invalid or failure:`, data);
            return false;
        }
    } catch (error) {
        console.error(`[PremiumManager DEBUG] Error deleting premium user via API:`, error.message);
        if (error.response) {
            console.error(`[PremiumManager DEBUG] API Response error status: ${error.response.status}`);
            console.error(`[PremiumManager DEBUG] API Response error data:`, error.response.data);
        }
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            console.error(`[PremiumManager DEBUG] Request timed out.`);
        }
        return false;
    }
}

/**
 * Checks if a user is premium for a specific service or generally via API.
 * Prioritizes local cache, falls back to API if user not in cache or cache is stale.
 * @param {string} userId WhatsApp JID of the user.
 * @param {string|null} requestedServiceCommand The command name (e.g., 'gemini'). If null, checks for ANY active premium.
 * @returns {Promise<boolean>} True if user has active premium, false otherwise.
 */
async function isPremium(userId, requestedServiceCommand = null) {
    ensureSettingsLoaded();

    const now = Date.now();
    const userInCache = cachedPremiumUsers[userId];

    if (userInCache && (now - lastCacheRefresh < CACHE_REFRESH_INTERVAL)) {
        const isPremiumInCache = (userInCache.allAccess && new Date(userInCache.allAccess.expires) > now) ||
            (requestedServiceCommand && userInCache.singleServiceSubscriptions && userInCache.singleServiceSubscriptions[requestedServiceCommand] && new Date(userInCache.singleServiceSubscriptions[requestedServiceCommand].expires) > now) ||
            (!requestedServiceCommand && userInCache.singleServiceSubscriptions && Object.values(userInCache.singleServiceSubscriptions).some(sub => new Date(sub.expires) > now));
        if (isPremiumInCache) {
            return true;
        } else {
            console.log(`[PremiumManager DEBUG] User ${userId} NOT PREMIUM from CACHE (or expired).`);
        }
    } else {
        console.log(`[PremiumManager DEBUG] Cache stale or empty for ${userId}. Proceeding to API check.`);
    }

    try {
        const response = await axios.post(`${PREMIUM_API_URL}/premium/status`, {
            userId,
            serviceName: requestedServiceCommand
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': BOT_API_KEY
            },
            timeout: API_REQUEST_TIMEOUT
        });

        console.log(chalk.green(`[PremiumManager DEBUG] API Response: ${response.status}`));

        const data = response.data;
        if (data.status && data.isPremium) {
            console.log(`[PremiumManager DEBUG] User ${userId} IS PREMIUM from API.`);
            if (data.user) {
                cachedPremiumUsers[userId] = data.user;
            }
            return true;
        } else {
            console.log(`[PremiumManager DEBUG] User ${userId} NOT PREMIUM from API.`);

            if (data.user) { // If the API returns a user object (even if not premium, it has details like notifiedExpired)
                cachedPremiumUsers[userId] = data.user;
            } else { // If API returns nothing, means user not known at all by API
                delete cachedPremiumUsers[userId];
            }
            return false;
        }
    } catch (error) {
        console.error("[PremiumManager DEBUG] FATAL ERROR during premium status API check:", error);
        if (error.response) {
            console.error(`[PremiumManager DEBUG] API Response error status: ${error.response.status}`);
            console.error(`[PremiumManager DEBUG] API Response error data:`, error.response.data);
        }
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            console.error(`[PremiumManager DEBUG] Request timed out.`);
        }
        console.error(`[PremiumManager DEBUG] Error message: ${error.message}`);
        console.error(`[PremiumManager DEBUG] This means premium check will return FALSE for ${userId}.`);
        return false;
    }
}

async function getUser(userId) {
    ensureSettingsLoaded();
    // It's crucial that getUser fetches the most up-to-date data including notification flags.
    // So, we should trigger a refresh for this specific user if possible, or a full cache refresh.
    // For simplicity, let's ensure refreshCache runs.
    await refreshCache();
    return cachedPremiumUsers[userId] || null;
}

async function getUsers() {
    ensureSettingsLoaded();
    await refreshCache();
    return { ...cachedPremiumUsers };
}

function registerService(serviceName) {
    if (typeof serviceName === 'string' && serviceName.length > 0) {
        registeredServices.add(serviceName.toLowerCase());
    }
}

function getRegisteredServices(excludeAllAccess = false) {
    let services = Array.from(registeredServices);
    if (excludeAllAccess) {
        services = services.filter(service => service !== 'all_access');
    }
    return services.sort();
}

// Defensive check for registeredServices integrity
if (!registeredServices || !(registeredServices instanceof Set)) {
    registeredServices = new Set(['all_access']);
    console.warn(chalk.red("[PremiumManager DEBUG] registeredServices was uninitialized or corrupted, re-initializing."));
}

/**
 * Checks if a service is locally registered.
 * @param {string} serviceName
 * @returns {boolean}
 */
function isServiceRegistered(serviceName) {
    return registeredServices.has(serviceName.toLowerCase());
}

/**
 * Marks a user's specific premium subscription as 'notified expired' via API.
 * This is called by the bot after it sends an expiry notification to prevent repeat messages.
 * @param {string} userId WhatsApp JID of the user.
 * @param {string} serviceName 'all_access' or the specific service command name (e.g., 'gemini').
 * @returns {Promise<boolean>} True if successfully marked, false otherwise.
 */
async function markNotifiedExpired(userId, serviceName) {
    ensureSettingsLoaded(); // Make sure API URL and key are loaded

    if (!userId || !serviceName) {
        console.error(chalk.red("[PremiumManager] markNotifiedExpired: userId or serviceName missing."));
        return false;
    }

    try {
        console.log(chalk.blue(`[PremiumManager DEBUG] Marking ${userId}'s ${serviceName} as notified expired via API...`));
        const response = await axios.post(`${PREMIUM_API_URL}/premium/set-notified-expired`, {
            userId,
            serviceName
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': BOT_API_KEY
            },
            timeout: API_REQUEST_TIMEOUT
        });

        console.log(chalk.green(`[PremiumManager DEBUG] API Response for markNotifiedExpired: ${response.status}`));
        if (response.status !== 200) {
            throw new Error(`API 'set-notified-expired' failed with status ${response.status}. Data: ${JSON.stringify(response.data)}`);
        }

        const data = response.data;
        if (data.status) {
            console.log(chalk.green(`[PremiumManager] Successfully marked ${userId}'s ${serviceName} as notified expired.`));
            // Immediately update local cache to reflect this change
            if (cachedPremiumUsers[userId]) {
                if (serviceName === 'all_access' && cachedPremiumUsers[userId].allAccess) {
                    cachedPremiumUsers[userId].allAccess.notifiedExpired = true;
                } else if (cachedPremiumUsers[userId].singleServiceSubscriptions && cachedPremiumUsers[userId].singleServiceSubscriptions[serviceName]) {
                    cachedPremiumUsers[userId].singleServiceSubscriptions[serviceName].notifiedExpired = true;
                }
            }
            return true;
        } else {
            console.warn(chalk.yellow(`[PremiumManager] Could not mark ${userId}'s ${serviceName} as notified expired: ${data.message}`));
            return false;
        }
    } catch (error) {
        console.error(chalk.red("[PremiumManager] Error marking notified expired via API:"), error.message);
        if (error.response) {
            console.error(chalk.red("[PremiumManager] API Response error data:"), error.response.data);
        }
        return false;
    }
}


// Initial check to load settings for the first time this module is required.
ensureSettingsLoaded();

module.exports = {
  addPremiumUser,
  delPremiumUser,
  getUser,
  getUsers,
  isPremium,
  registerService,
  getRegisteredServices,
  isServiceRegistered,
  markNotifiedExpired,
  refreshCache  // <-- Added refreshCache export here
};
