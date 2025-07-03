const fs = require('fs');
const path = require('path');
const fsp = fs.promises;
const contactsFilePath = './src/contacts.json';
const https = require('https');
const fetch = require('node-fetch');
const AdmZip = require("adm-zip");
const axios = require("axios");
const { sleep } = require('../../lib/myfunc');

const { formatDateTime } = require('../../lib/myfunc');
const { promisify } = require('util');
const { calculateExpiry, isPremium } = require('../../lib/premiumSystem');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const { generateProfilePicture, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys'); 





module.exports = [
  {
  command: ['addbadword'],
  operate: async ({ Matrix, m, isCreator, mess, prefix, args, q, reply, db }) => {
    // Premium/creator check
    const isPremiumUser = typeof isPremium === "function" ? isPremium(m.sender) : false;
    if (!isCreator && !isPremiumUser) return reply(mess.owner);

    if (args.length < 1) return reply(`Use ${prefix}addbadword [harsh word].`);
    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    if (!db.data.users[botJid]) db.data.users[botJid] = {};
    if (!Array.isArray(db.data.users[botJid].badwords)) db.data.users[botJid].badwords = [];

    const badwords = db.data.users[botJid].badwords;

    if (badwords.includes(q)) {
      return reply('This word is already in the list!');
    }

    badwords.push(q);

    try {
      await db.write();
      reply('Successfully added bad word!');
    } catch (error) {
      console.error('Error writing to badwords:', error);
      reply('An error occurred while adding the bad word.');
    }
  }
}, 
 {
  command: ['addignorelist'],
  operate: async ({ Matrix, m, args, isCreator, mess, reply, db }) => { 
    // if (!isCreator) return reply(mess.owner);

    let mentionedUser = m.mentionedJid && m.mentionedJid[0];
    let quotedUser = m.quoted && m.quoted.sender;
    let userToAdd = mentionedUser || quotedUser || m.chat;

    if (!userToAdd) return reply('Mention a user, reply to their message, or provide a phone number to ignore.');

    // Get bot instance JID
    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    // Ensure per-bot user settings exist
    if (!db.data.users[botJid]) db.data.users[botJid] = {};
    if (!Array.isArray(db.data.users[botJid].ignorelist)) db.data.users[botJid].ignorelist = [];

    let ignorelist = db.data.users[botJid].ignorelist;
    if (!ignorelist.includes(userToAdd)) {
        ignorelist.push(userToAdd);
        await db.write(); // Save changes to the database
        reply(`${userToAdd} added to the ignore list for this bot instance.`);
    } else {
        reply(`${userToAdd} is already ignored by this bot instance.`);
    }
  }
}, 

  {
  command: ['autobio'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db }) => {
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();
    if (!validOptions.includes(option)) return reply("Invalid option. Use 'on' or 'off'.");

    // Get the bot's WhatsApp JID (bot instance ID)
    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";

    // Ensure the users object for this bot exists
    if (!db.data.users[botJid]) db.data.users[botJid] = {};

    // Set the autobio value for this bot only
    db.data.users[botJid].autobio = option === "on";
    await db.write();

    reply(`✅ Auto-bio ${option === "on" ? "enabled" : "disabled"} successfully for this bot instance.`);
  }
}, 

{
  command: ['autoread'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db }) => {
    // Allow creator or premium users
    const isPremiumUser = typeof isPremium === "function" ? isPremium(m.sender) : false;
    if (!isCreator && !isPremiumUser) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option.");

    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    if (!db.data.users[botJid]) db.data.users[botJid] = {};

    db.data.users[botJid].autoread = option === "on";
    await db.write();
    reply(`Auto-read ${option === "on" ? "enabled" : "disabled"} successfully for this bot instance.`);
  }
},
{
  command: ['autorecord', 'autorecording'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db }) => {
    const isPremiumUser = typeof isPremium === "function" ? isPremium(m.sender) : false;
    if (!isCreator && !isPremiumUser) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option.");

    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    if (!db.data.users[botJid]) db.data.users[botJid] = {};

    db.data.users[botJid].autorecord = option === "on";
    await db.write();
    reply(`Auto-record ${option === "on" ? "enabled" : "disabled"} successfully for this bot instance.`);
  }
},
{
  command: ['autotype', 'autotyping'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db }) => {
    const isPremiumUser = typeof isPremium === "function" ? isPremium(m.sender) : false;
    if (!isCreator && !isPremiumUser) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option.");

    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    if (!db.data.users[botJid]) db.data.users[botJid] = {};

    db.data.users[botJid].autotype = option === "on";
    await db.write();
    reply(`Auto-typing ${option === "on" ? "enabled" : "disabled"} successfully for this bot instance.`);
  }
},
{
  command: ['autorecordtyping', 'autorecordtype'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db }) => {
    const isPremiumUser = typeof isPremium === "function" ? isPremium(m.sender) : false;
    if (!isCreator && !isPremiumUser) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option.");

    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    if (!db.data.users[botJid]) db.data.users[botJid] = {};

    db.data.users[botJid].autorecordtype = option === "on";
    await db.write();
    reply(`Auto-record typing ${option === "on" ? "enabled" : "disabled"} successfully for this bot instance.`);
  }
},

 {
  command: ['block'],
  operate: async ({ Matrix, m, reply, isCreator, mess, text }) => {
    // This line was here: if (!isCreator) return reply(mess.owner);

    // Fixed safety check for mentions (from previous discussion):
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !text) {
      return reply("Reply to a message or mention/user ID to block");
    }

    // Fixed userId assignment (from previous discussion):
    const userId = (m.mentionedJid && m.mentionedJid[0]) || m.quoted?.sender || (text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

    // Added check for null userId (from previous discussion):
    if (!userId) {
        return reply("Could not determine user to block. Please reply to a message, mention a user, or provide a valid number.");
    }

    await Matrix.updateBlockStatus(userId, "block");
    reply(mess.done);
  }
},
{
  command: ['deletebadword', 'delbadword', 'removebadword'],
  operate: async ({ Matrix, m, isCreator, mess, prefix, args, q, reply, db }) => {
    // Premium/creator check
    const isPremiumUser = typeof isPremium === "function" ? isPremium(m.sender) : false;
    if (!isCreator && !isPremiumUser) return reply(mess.owner);

    if (args.length < 1) return reply(`Use ${prefix}deletebadword [harsh word].`);

    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    if (!db.data.users[botJid]) db.data.users[botJid] = {};
    if (!Array.isArray(db.data.users[botJid].badwords)) db.data.users[botJid].badwords = [];

    const badwords = db.data.users[botJid].badwords;

    const index = badwords.indexOf(q);
    if (index === -1) {
      return reply('This word is not in the list!');
    }

    badwords.splice(index, 1);

    try {
      await db.write();
      reply('Successfully deleted bad word!');
    } catch (error) {
      console.error('Error writing to badwords:', error);
      reply('An error occurred while deleting the bad word.');
    }
  }
}, 
{
  command: ['delete', 'del'],
  operate: async ({ Matrix, m, reply, isCreator, mess }) => {
 //   if (!isCreator) return reply(mess.owner);
    if (!m.quoted) return reply(`*Please reply to a message*`);

    let key = {};
    try {
      key.remoteJid = m.quoted
          ? m.quoted.fakeObj.key.remoteJid
          : m.key.remoteJid;
      key.fromMe = m.quoted ? m.quoted.fakeObj.key.fromMe : m.key.fromMe;
      key.id = m.quoted ? m.quoted.fakeObj.key.id : m.key.id;
      key.participant = m.quoted
          ? m.quoted.fakeObj.participant
          : m.key.participant;
    } catch (e) {
      console.error(e);
    }
    Matrix.sendMessage(m.chat, { delete: key });
  }
},
{
  command: ['delignorelist', 'removeignorelist'],
  operate: async ({ Matrix, m, args, isCreator, mess, reply, db }) => { 

    let mentionedUser = m.mentionedJid && m.mentionedJid[0];
    let quotedUser = m.quoted && m.quoted.sender;
    let userToRemove = mentionedUser || quotedUser || m.chat;

    if (!userToRemove) return reply('Mention a user, reply to their message, or provide a phone number to remove from the ignore list.');

    // Get bot instance JID
    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    // Ensure per-bot user settings exist
    if (!db.data.users[botJid]) db.data.users[botJid] = {};
    if (!Array.isArray(db.data.users[botJid].ignorelist)) db.data.users[botJid].ignorelist = [];

    let ignorelist = db.data.users[botJid].ignorelist;
    let index = ignorelist.indexOf(userToRemove);
    if (index !== -1) {
        ignorelist.splice(index, 1);
        await db.write(); // Save changes to the database
        reply(`${userToRemove} removed from the ignore list for this bot instance.`);
    } else {
        reply(`${userToRemove} is not in the ignore list for this bot instance.`);
    }
  }
}, 

 {
  command: ['deljunk', 'deletejunk', 'clearjunk'],
  operate: async (context) => {
    const { Matrix, m, reply, isCreator, mess } = context;

    if (!isCreator) return reply(mess.owner);
    fsp.readdir("./session", async function (err, files) {
      if (err) {
        console.log("Unable to scan directory: " + err);
        return reply("Unable to scan directory: " + err);
      }
      let filteredArray = await files.filter(
        (item) =>
          item.startsWith("pre-key") ||
          item.startsWith("sender-key") ||
          item.startsWith("session-") ||
          item.startsWith("app-state")
      );
      console.log(filteredArray.length);
      await sleep(2000);
      reply(`*Clearing ${filteredArray.length} junk files in the session folder...*`);
      await filteredArray.forEach(function (file) {
        fs.unlinkSync(`./session/${file}`);
      });
      await sleep(2000);
      reply("*Successfully cleared all the junk files in the session's folder*");
    });

    const tmpDir = path.resolve("./tmp");
    fsp.readdir(tmpDir, async function (err, files) {
      if (err) {
        console.log("Unable to scan directory: " + err);
        return reply("Unable to scan directory: " + err);
      }
      let junkFiles = files.filter(
        (item) =>
          item.endsWith("gif") ||
          item.endsWith("png") ||
          item.endsWith("mp3") ||
          item.endsWith("mp4") ||
          item.endsWith("opus") ||
          item.endsWith("jpg") ||
          item.endsWith("webp") ||
          item.endsWith("webm") ||
          item.endsWith("zip")
      );
      console.log(junkFiles.length);
      await sleep(2000);
      reply(`*Clearing ${junkFiles.length} junk files in the tmp folder...*`);
      await junkFiles.forEach(function (file) {
        fs.unlinkSync(`${tmpDir}/${file}`);
      });
      await sleep(2000);
      reply("*Successfully cleared all the junk files in the tmp folder*");
    });
  }
},

  {
  command: ['vv1'],
  operate: async ({ Matrix, m, reply, isCreator, mess }) => {
    //if (!isCreator) return reply(mess.owner);
    if (!m.quoted) return reply(`*Please reply to a view once message!*`);

    let msg = m.msg?.contextInfo?.quotedMessage
    let type = Object.keys(msg)[0];

    if (!/image|video/.test(type)) return reply(`*Only view once images and videos are supported!*`);

    try {
      let media = await downloadContentFromMessage(msg[type], type === 'imageMessage' ? 'image' : 'video');
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      let filename = type === 'imageMessage' ? 'media.jpg' : 'media.mp4';
      let caption = msg[type]?.caption || global.wm;

      return Matrix.sendFile(m.chat, buffer, filename, caption, m);
    } catch (error) {
      console.error(error);
      reply(`*Failed to retrieve media. The message might not be a valid view-once media.*`);
    }
  }
}, {
  command: ["vv2"],
  operate: async ({
    Matrix,
    m,
    reply,
    isCreator,
    mime, // This mime is from the CURRENT message 'm', not the quoted one.
    quoted, // This is the serialized m.quoted object.
    q,
    mess // isPremium is NOT here
  }) => {
    // React with a floppy disk emoji to indicate saving
    await Matrix.sendMessage(m.chat, { react: { text: `💾`, key: m.key } });

    // Allow Creator OR Premium users (isPremium is from the top-level import)
    const isSenderPremium = isPremium(m.sender);
    if (!isCreator && !isSenderPremium) {
      await Matrix.sendMessage(m.chat, { react: { text: `❌`, key: m.key } });
      return reply(mess.owner || mess.premium);
    }

    // Check if m.quoted exists and if it has raw message content
    if (!m.quoted || !m.quoted.message) {
      await Matrix.sendMessage(m.chat, { react: { text: `❓`, key: m.key } });
      return reply('Reply to a Video, Image, or Audio You Want to Save');
    }

    // Access the raw quoted message content
    const rawQuotedMessageContent = m.quoted.message;
    const quotedMessageTypeInRaw = Object.keys(rawQuotedMessageContent)[0]; // e.g., 'imageMessage', 'videoMessage', 'audioMessage'

    let mediaTypeForDownload; // This will be 'image', 'video', or 'audio'
    if (quotedMessageTypeInRaw === 'videoMessage') {
      mediaTypeForDownload = 'video';
    } else if (quotedMessageTypeInRaw === 'imageMessage') {
      mediaTypeForDownload = 'image';
    } else if (quotedMessageTypeInRaw === 'audioMessage') {
      mediaTypeForDownload = 'audio';
    } else {
      await Matrix.sendMessage(m.chat, { react: { text: `❓`, key: m.key } });
      return reply('Reply to a Video, Image, or Audio You Want to Save'); // Not a supported media type
    }

    try {
      // Pass the raw quoted message content to downloadAndSaveMediaMessage
      // This function expects a message content object (e.g., m.message.imageMessage)
      const mediaFile = await Matrix.downloadAndSaveMediaMessage(rawQuotedMessageContent[quotedMessageTypeInRaw], mediaTypeForDownload);
      const messageOptions = {
        caption: q || rawQuotedMessageContent[quotedMessageTypeInRaw]?.caption || '' // Use q or caption from original if q is empty
      };

      messageOptions[mediaTypeForDownload] = {
        url: mediaFile
      };

      // Send to the sender of the command (your DM)
      await Matrix.sendMessage(m.sender, messageOptions, { quoted: m });
      await Matrix.sendMessage(m.chat, { react: { text: `✅`, key: m.key } });

      // Clean up the temporary file after sending
      if (fs.existsSync(mediaFile)) {
        fs.unlinkSync(mediaFile);
      }

    } catch (error) {
      console.error("vv2 Error:", error);
      await Matrix.sendMessage(m.chat, { react: { text: `🚫`, key: m.key } });
      reply(`Failed to save and send the media: ${error.message}`);
    }
  }
},
 {
  command: ['disk'],
  operate: async ({ reply }) => {
    await reply('Please wait...');

    try {
      const { stdout, stderr } = await execAsync('cd && du -h --max-depth=1');
      if (stdout && stdout.trim()) await reply(stdout.trim());
      if (stderr && stderr.trim()) await reply(stderr.trim());
    } catch (e) {
      console.error('[disk] Error:', e);
      await reply('❌ Failed to fetch disk usage.\n' + (e.stderr || e.message || 'Unknown error.'));
    }
  }
}, {
  command: ["alive"],
  operate: async ({ Matrix, m, reply, prefix }) => {
    try {
      // Capture the current timestamp at the start
      const startTimestamp = Date.now();

      // Send a message to indicate the bot is alive
      await Matrix.sendMessage(m.chat, { text: "🚀 Checking Bot Status..." });

      const botInfo = {
        name: "Adiza-Bot 🌹",
        version: "2.4.2 🚀",
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        // Use the difference between start time and end time for responseTime
        responseTime: Date.now() - startTimestamp
      };

      const formatUptime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      };

      const formattedUptime = formatUptime(botInfo.uptime);

      // Constructing the bot's status message
      const statusMessage = `
💬 *Hello! I'm ${botInfo.name}* I'm fully operating 24/7 on your behalf!😎

⏰ *ᴜᴘᴛɪᴍᴇ:* ${formattedUptime} 🕒
💾 *ᴍᴇᴍᴏʀʏ ᴜsᴀɢᴇ:* ${botInfo.memoryUsage.toFixed(2)} MB 📊
⚡ *ʀᴇsᴘᴏɴᴄᴇ ᴛɪᴍᴇ:* ${botInfo.responseTime}ms 🏃‍♂️
🔧 *ʙᴏᴛ ᴠᴇʀsɪᴏɴ:* ${botInfo.version} 🔝

💡 _I'm here, alive, and ready to assist you with anything! Just type your command! 🤖💬_
      `.trim();

      // Sending the status message
      await Matrix.sendMessage(m.chat, {
        text: statusMessage
      }, {
        quoted: m
      });
    } catch (error) {
      console.error("Error fetching bot status:", error);
      reply("❌ Oops! Something went wrong while checking my status. Here's the error: " + error.message);
    }
  }
}, {
  command: ["getpp"],
  operate: async ({ Matrix, m, reply, prefix }) => { // De-obfuscated David to Matrix
    // React with a camera emoji to indicate fetching profile picture
    await Matrix.sendMessage(m.chat, { react: { text: "📸", key: m.key } }); // De-obfuscated David to Matrix

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      await Matrix.sendMessage(m.chat, { react: { text: "❓", key: m.key } }); // De-obfuscated David to Matrix
      return reply(`Reply to someone's message or tag a user with ${prefix}getpp`);
    }

    try {
      const targetUser = m.quoted ? m.quoted.sender : m.mentionedJid[0];
      const profilePicUrl = await Matrix.profilePictureUrl(targetUser, 'image').catch(() => null); // De-obfuscated David to Matrix
      const responseMessage = `Profile picture of @${targetUser.split('@')[0]}`;
      await Matrix.sendMessage(m.chat, {
        image: { url: profilePicUrl },
        caption: responseMessage,
        mentions: [targetUser]
      });
      // React with a checkmark on successful retrieval
      await Matrix.sendMessage(m.chat, { react: { text: "✅", key: m.key } }); // De-obfuscated David to Matrix
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      // React with an 'X' on failure
      await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } }); // De-obfuscated David to Matrix
      reply("Couldn't fetch profile picture. The user might not have a profile picture or an error occurred.");
    }
  }
}, {
  command: ["whois"],
  operate: async ({ Matrix, m, reply, prefix, args }) => {
    // Indicate processing
    await Matrix.sendMessage(m.chat, { react: { text: "🕵️", key: m.key } });

    let targetUserJid, inputNumber = "";

    // 1. Try to get target JID from mention
    if (m.mentionedJid?.[0]) {
      targetUserJid = m.mentionedJid[0];
      console.log(`[WHOIS] Target from mention: ${targetUserJid}`);
    }
    // 2. Try from quoted message
    else if (m.quoted?.sender) {
      targetUserJid = m.quoted.sender;
    }
    // 3. Try from argument (number)
    else if (args[0]) {
      inputNumber = args[0].replace(/\D/g, "");
      if (inputNumber) {
        // Ghana default country code logic
        if (inputNumber.length === 9 && !inputNumber.startsWith("233")) {
          targetUserJid = `233${inputNumber}@s.whatsapp.net`;
        } else {
          targetUserJid = `${inputNumber}@s.whatsapp.net`;
        }
        console.log(`[WHOIS] Target from argument: ${targetUserJid}`);
      }
    }

    // If no target, show usage
    if (!targetUserJid) {
      await Matrix.sendMessage(m.chat, { react: { text: "❓", key: m.key } });
      return reply(
        `*Usage:*\n${prefix}whois <mention/reply/number>\n` +
        `*Examples:*\n${prefix}whois @user\n${prefix}whois (reply to message)\n${prefix}whois 233544981163`
      );
    }

    try {
      // Check if user exists
      const userInfo = await Matrix.onWhatsApp(targetUserJid);
      if (!userInfo?.[0]?.exists) {
        await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return reply(`❌ User *${targetUserJid.split('@')[0]}* not found on WhatsApp.\n(Input: ${inputNumber})`);
      }
      const resolvedJid = userInfo[0].jid;

      // Fetch profile picture
      let profilePicUrl = null;
      try {
        profilePicUrl = await Matrix.profilePictureUrl(resolvedJid, "image");
      } catch (e) {}

      // Fetch display name
      let displayName = resolvedJid.split("@")[0];
      try {
        const fetchedName = await Matrix.getName(resolvedJid);
        if (fetchedName) displayName = fetchedName;
      } catch (e) {}

      // Compose info message (About Status removed)
      const infoMessage = [
        `*👤🌹User Information🌹👤*`,
        ``,
        `*• 🥂Name:* ${displayName}`,
        `*• 🎓JID:* ${resolvedJid}`,
        `*• ☎Phone Number:* ${resolvedJid.split("@")[0]}`
      ].join("\n");

      // Send with or without profile picture
      if (profilePicUrl) {
        await Matrix.sendMessage(
          m.chat,
          { image: { url: profilePicUrl }, caption: infoMessage, mentions: [resolvedJid] },
          { quoted: m }
        );
      } else {
        await Matrix.sendMessage(
          m.chat,
          { text: infoMessage, mentions: [resolvedJid] },
          { quoted: m }
        );
      }

      await Matrix.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      console.error(`[WHOIS] Error for input ${inputNumber} (${targetUserJid}):`, error);
      await Matrix.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      reply(
        "❌ *Error fetching user information.*\n" +
        "• The user may have privacy restrictions.\n" +
        "• The number may be invalid or not in WhatsApp format.\n" +
        "• There may be a temporary server issue."
      );
    }
  }
},

 {
  command: ["userinfo"],
  operate: async ({ Matrix, m, reply, prefix }) => {
    // Ensure user is replying or mentioning someone
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply(`Reply to someone's message or tag a user with ${prefix}userinfo`);
    }

    try {
      // Get the target user JID
      const targetUser = m.quoted ? m.quoted.sender : m.mentionedJid[0];
      const phoneNumber = targetUser.split('@')[0];

      // Try to fetch profile picture URL
      let profilePicUrl = null;
      try {
        profilePicUrl = await Matrix.profilePictureUrl(targetUser, 'image');
      } catch (e) {
        // If privacy settings block it, ignore the error
        profilePicUrl = null;
      }

      // Try to fetch display name from contacts or fallback to phone number
      let displayName = Matrix.contacts?.[targetUser]?.notify
        || Matrix.contacts?.[targetUser]?.name
        || Matrix.contacts?.[targetUser]?.verifiedName
        || phoneNumber;

      const userInfoMessage = `
*User Info:*
- Name: ${displayName}
- JID: ${targetUser}
- Phone Number: ${phoneNumber}
${profilePicUrl ? `- Profile Picture: [Click Here](${profilePicUrl})` : '- No Profile Picture'}
      `.trim();

      // Send image if available, otherwise just text
      if (profilePicUrl) {
        await Matrix.sendMessage(m.chat, {
          image: { url: profilePicUrl },
          caption: userInfoMessage,
          mentions: [targetUser]
        }, { quoted: m });
      } else {
        await Matrix.sendMessage(m.chat, {
          text: userInfoMessage,
          mentions: [targetUser]
        }, { quoted: m });
      }

    } catch (error) {
      console.error("Error fetching user info:", error);
      reply("Couldn't fetch user information. The user might have privacy settings enabled or there was an error.");
    }
  }
},
{
  command: ['gcaddprivacy'],
  operate: async ({ Matrix, m, reply, mess, prefix, command, text, args }) => {
    if (!text) return reply(`Options: all/contacts/contact_blacklist/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "contacts", "contact_blacklist", "none"];
    if (!validOptions.includes(args[0])) return reply("*Invalid option!*\nOptions: all, contacts, contact_blacklist, none");

    try {
      await Matrix.updateGroupsAddPrivacy(text);
      await reply(`✅ Group add privacy set to *${text}* for this WhatsApp account.`);
    } catch (err) {
      console.error("[gcaddprivacy] Error:", err);
      reply("❌ Failed to update group add privacy. Please try again.");
    }
  }
}, 

  {
  command: ['getsession'],
  operate: async ({ Matrix, m, reply, isCreator, mess }) => {
    if (!isCreator) return reply(mess.owner);
    reply("*Fetching session file...*");

    if (global.SESSION_ID) {
      Matrix.sendMessage(
        m.chat,
        {
          text: `${global.SESSION_ID}`,
        },
        {
          quoted: m,
        }
      );
    }

    let botxp = fs.readFileSync("./session/creds.json");
    Matrix.sendMessage(
      m.chat,
      {
        document: botxp,
        mimetype: "application/json",
        fileName: "creds.json",
      },
      {
        quoted: m,
      }
    );
  }
},
 {
  command: ['groupid', 'idgc'],
  operate: async ({ Matrix, m, reply, mess, args, q }) => {
    // Anyone can use this command now!

    // Accept group link via argument or quoted text
    let groupLink = q || args.join(" ").trim();
    if (!groupLink) return reply('Please provide a group link!\nExample: .groupid https://chat.whatsapp.com/xxxxxxxxxxx');

    let coded = groupLink.split("https://chat.whatsapp.com/")[1];
    if (!coded) return reply("❌ Link Invalid. Please provide a valid WhatsApp group invite link.");

    try {
      const res = await Matrix.query({
        tag: "iq",
        attrs: {
          type: "get",
          xmlns: "w:g2",
          to: "@g.us"
        },
        content: [{ tag: "invite", attrs: { code: coded } }]
      });

      const groupId = res?.content?.[0]?.attrs?.id;
      if (!groupId) return reply("❌ Could not extract group ID. Make sure the link is valid and try again.");

      reply("✅ Group ID: " + groupId + '@g.us');
    } catch (err) {
      console.error("[groupid] Error:", err);
      reply("❌ Failed to fetch group ID. The link may be invalid or WhatsApp may have restricted access.");
    }
  }
},
{
  command: ['hostip', 'ipbot'],
  operate: async ({ reply }) => {
    try {
      https.get("https://api.ipify.org", (res) => {
        let data = '';
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => reply("Bot's public IP: " + data));
      }).on('error', (err) => {
        console.error("[hostip] Error:", err);
        reply("❌ Failed to fetch public IP address.");
      });
    } catch (err) {
      console.error("[hostip] Error:", err);
      reply("❌ Failed to fetch public IP address.");
    }
  }
},
 {
  command: ["pinchat"],
  operate: async ({ Matrix: David, m, reply, isCreator }) => {
    // This line was here: if (!isCreator) return reply('This command is for the owner only.');

    try {
      // David is the specific bot instance's Matrix object, so it will pin the chat for that bot instance.
      await David.chatModify({ pin: true }, m.chat);
      await David.sendMessage(m.chat, {
        react: {
          text: `📌`,
          key: m.key
        }
      });
    } catch (error) {
      console.error("Error pinning chat:", error);
      reply('Failed to pin the chat.');
    }
  }
}, {
  command: ["unpinchat"],
  operate: async ({ Matrix: David, m, reply, isCreator }) => {
    // This line was here: if (!isCreator) return reply('This command is for the owner only.');

    try {
      // David is the specific bot instance's Matrix object, so it will unpin the chat for that bot instance.
      await David.chatModify({ pin: false }, m.chat);
      await David.sendMessage(m.chat, {
        react: {
          text: `✅`,
          key: m.key
        }
      });
    } catch (error) {
      console.error("Error unpinning chat:", error);
      reply('Failed to unpin the chat.');
    }
  }
}, {
  command: ["listblock"],
  operate: async ({ Matrix: David, reply, isCreator }) => {
    // This line was here: if (!isCreator) return reply("For My Owner Only");

    try {
      // David is the specific bot instance's Matrix object, so it will fetch its own blocklist.
      const block = await David.fetchBlocklist();
      if (!block || block.length === 0) {
        return reply("List Block:\n\n*0* Blocked");
      }

      const blockList = block.map(v => '• ' + v.replace(/@.+/, '')).join('\n');
      reply(`List Block:\n\n*${block.length}* Blocked\n${blockList}`);
    } catch (error) {
      console.error("Error fetching block list:", error);
      reply("Failed to retrieve block list.");
    }
  }
}, {
  command: ["listgc", "listgrup"],
  operate: async (context) => { // Renamed _0x5e2413 to 'context' for readability
    const {
      reply,
      isCreator,
      mess,
      Matrix
    } = context; // Destructured from 'context'


    try {
      
      const data = await Matrix.groupFetchAllParticipating();
      const groups = Object.values(data);
      let teks = `*乂 List of All Group Chats*\n\n`;
      teks += `*Total Groups:* ${groups.length}\n`;

      for (const g of groups) {
        const groupJid = g.id;
        let groupLink = "*Invite Link:* _Bot not admin_";

        try {
          const inviteCode = await Matrix.groupInviteCode(groupJid);
          groupLink = `https://chat.whatsapp.com/${inviteCode}`;
        } catch (e) {
          // Bot not admin or error fetching link
        }

        teks += `\n━━━━━━━━━━━━━━━
*Group Name:* ${g.subject}
*Group ID:* \`\`\`${groupJid}\`\`\`
*Members:* ${g.participants.length}
*Status:* ${g.announce ? "Admin Only" : "Open"}
*Creator:* ${g.subjectOwner ? g.subjectOwner.split("@")[0] : "Left"}
${groupLink}`;
      }

      return reply(teks);
    } catch (e) {
      return reply("❌ Error listing groups.");
    }
  }
}, {
  command: ["join"],
  operate: async ({ Matrix, m, reply, isCreator, mess, args, text, isUrl }) => {
    // React with a handshake emoji to indicate joining
    await Matrix.sendMessage(m.chat, {
      react: {
        text: "🤝",
        key: m.key
      }
    });

    if (!text) {
      await Matrix.sendMessage(m.chat, {
        react: {
          text: "❓",
          key: m.key
        }
      });
      return reply("Enter group link");
    }
    if (!isUrl(args[0]) && !args[0].includes("whatsapp.com")) {
      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🔗", // Or "🚫" for invalid link
          key: m.key
        }
      });
      return reply("Invalid link");
    }
    try {
      const inviteCode = args[0].split("https://chat.whatsapp.com/")[1];
      await Matrix.groupAcceptInvite(inviteCode);
      await Matrix.sendMessage(m.chat, {
        react: {
          text: "✅",
          key: m.key
        }
      });
      reply("Joined successfully");
    } catch {
      await Matrix.sendMessage(m.chat, {
        react: {
          text: "⚠️", // Or "❌" for failure
          key: m.key
        }
      });
      reply("Failed to join group");
    }
  }
}, {
  command: ['lastseen'],
  operate: async ({ Matrix, m, reply, mess, prefix, command, text, args }) => {
    if (!text) return reply(`Options: all/contacts/contact_blacklist/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "contacts", "contact_blacklist", "none"];
    if (!validOptions.includes(args[0])) return reply("Invalid option. Use: all, contacts, contact_blacklist, or none");

    try {
      await Matrix.updateLastSeenPrivacy(text);
      await reply(`✅ Last seen privacy set to *${text}* for this WhatsApp account.`);
    } catch (err) {
      console.error("[lastseen] Error:", err);
      reply("❌ Failed to update last seen privacy. Please try again.");
    }
  }
}, 
{
  command: ['leave', 'leavegc'],
  operate: async ({ Matrix, m, reply, mess, sleep }) => {
    try {
      if (!m.isGroup) return reply(mess.group);

      await reply("*Goodbye, it was nice being here!*");
      await sleep(3000);
      await Matrix.groupLeave(m.chat);
    } catch (err) {
      console.error("[leavegc] Error:", err);
      reply("❌ Failed to leave the group. Please try again or check my permissions.");
    }
  }
}, 
 {
  command: ['listbadword'],
  operate: async ({ Matrix, m, reply, db }) => {
    // Only allow in personal chats (not groups)
    if (m.isGroup) return reply('This command cannot be used in personal chats.');

    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    const badwords = db.data.users[botJid]?.badwords || [];

    if (badwords.length === 0) return reply('No bad words have been added yet.');

    let text = '*Bad Words List:*\n\n';
    badwords.forEach((word, index) => {
      text += `${index + 1}. ${word}\n`;
    });

    text += `\nTotal bad words: ${badwords.length}`;
    reply(text);
  }
}, 
{
  command: ['listignorelist'],
  operate: async ({ Matrix, reply, db }) => {
    // Get bot instance JID
    const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
    // Ensure per-bot user settings exist
    if (!db.data.users[botJid]) db.data.users[botJid] = {};
    if (!Array.isArray(db.data.users[botJid].ignorelist)) db.data.users[botJid].ignorelist = [];

    let ignorelist = db.data.users[botJid].ignorelist;
    if (ignorelist.length === 0) {
        reply('The ignore list for this bot instance is empty.');
    } else {
        reply(`Ignored users/chats for this bot instance:\n${ignorelist.join('\n')}`);
    }
  }
}, 
{
  command: ['modestatus', 'botmode'],
  operate: async ({ Xploader, m, reply, isCreator, mess, modeStatus }) => {
  
    reply(`Current mode: ${modeStatus}`);
  }
},
  {
  command: ['online'],
  operate: async ({ Matrix, m, reply, mess, prefix, command, text, args }) => {
    if (!text) return reply(`Options: all/match_last_seen\nExample: ${prefix + command} all`);

    const validOptions = ["all", "match_last_seen"];
    if (!validOptions.includes(args[0])) return reply("Invalid option. Use: all or match_last_seen");

    try {
      await Matrix.updateOnlinePrivacy(text);
      await reply(`✅ Online privacy set to *${text}* for this WhatsApp account.`);
    } catch (err) {
      console.error("[online] Error:", err);
      reply("❌ Failed to update online privacy. Please try again.");
    }
  }
}, 
 {
  command: ['owner'],
  operate: async ({ m, Matrix, sender }) => {
    try {
      const ownerList = [];
      const ownerNumbers = [global.ownernumber.includes('@') ? global.ownernumber : `${global.ownernumber}@s.whatsapp.net`];

      for (const number of ownerNumbers) {
        const displayName = await Matrix.getName(number);
        ownerList.push({
          displayName: displayName || global.ownername,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.ownername}\nFN:${global.ownername}\nitem1.TEL;waid=${number.split('@')[0]}:${number.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
        });
      }

      await Matrix.sendMessage(
        m.chat,
        { contacts: { displayName: `${ownerList.length} Contact`, contacts: ownerList }, mentions: [sender] },
        { quoted: m }
      );
    } catch (error) {
      console.error('Error sending owner contact:', error.message);
      await Matrix.sendMessage(
        m.chat,
        { text: `*Error:* ${error.message}` },
        { quoted: m }
      );
    }
  }
}, {
  command: ['ppprivacy'],
  operate: async ({ Matrix, m, reply, mess, prefix, command, text, args }) => {
    if (!text) return reply(`Options: all/contacts/contact_blacklist/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "contacts", "contact_blacklist", "none"];
    if (!validOptions.includes(args[0])) return reply("Invalid option. Use: all, contacts, contact_blacklist, or none");

    try {
      await Matrix.updateProfilePicturePrivacy(text);
      await reply(`✅ Profile picture privacy set to *${text}* for this WhatsApp account.`);
    } catch (err) {
      console.error("[ppprivacy] Error:", err);
      reply("❌ Failed to update profile picture privacy. Please try again.");
    }
  }
}, 
{
  command: ['react'],
  operate: async ({ Matrix, m, reply, args }) => {
    // Check for emoji argument
    if (!args || !args[0]) {
      return reply(`*Reaction emoji needed*\nExample: .react 🤔`);
    }

    // Check for quoted message
    if (!m.quoted || !m.quoted.id) {
      return reply(`*Reply to a message you want to react to!*\nExample: Reply to a message and type .react 👍`);
    }

    // Optional: Validate the emoji (basic check)
    const emoji = args[0].trim();
    if (!/\p{Emoji}/u.test(emoji)) {
      return reply(`*Please provide a valid emoji.*\nExample: .react 😎`);
    }

    try {
      await Matrix.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.quoted.fakeObj ? m.quoted.fakeObj.key : {
            remoteJid: m.chat,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.quoted.sender
          }
        }
      });
    } catch (err) {
      console.error('[react] Error sending reaction:', err);
      reply('❌ Failed to send reaction. Please try again.');
    }
  }
},
  {
  command: ['readreceipts'],
  operate: async ({ Matrix, m, reply, mess, prefix, command, text, args }) => {
    if (!text) return reply(`Options: all/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "none"];
    if (!validOptions.includes(args[0])) return reply("Invalid option");

    try {
      await Matrix.updateReadReceiptsPrivacy(text);
      await reply(`✅ Read receipts privacy set to *${text}* for this account.`);
    } catch (err) {
      console.error("[readreceipts] Error:", err);
      reply("❌ Failed to update read receipts privacy. Please try again.");
    }
  }
}, {
  command: ["biography"],
  operate: async ({
    Matrix: _0x56a354,
    m: _0x4303a2,
    reply: _0x5aafa4,
    text: _0x32bfab
  }) => {
    const biography = `
      *🔮Creator's Biography🔮:*

      👋🌹Hello, I am 𝗠𝗮𝘁𝗿𝗶𝘅-𝗫-𝗞𝗶𝗻𝗴, from Ghana 🇬🇭, the developer behind this bot. I have been passionate about programming and AI development for many years. My primary focus is on creating bots and automating tasks that make life easier for users.

      *🔑Key Points🔑:*
      - I'm a self-taught developer with a deep interest in AI.
      - My work involves building chatbots, web applications, and exploring machine learning.
      - I enjoy solving problems and contributing to open-source projects.

      *🕴Fun Facts🕴:*
      - My favorite programming language is JavaScript, but I also enjoy Python.
      - I believe in the power of automation to simplify everyday tasks.
      - In my free time, I love exploring new tech and learning new skills.

      Thank you for using this bot, and I hope you enjoy its features!

      *🪩Social Media & Contact🪩:*
      - Contact: 233593734312
      - GitHub: github.com/Matrix1999
      - Email: Matrixzat99@gmail.com
      - Whatsapp: https://wa.me/message/65YSIVJZVUXVF1
      - Telegram: https://t.me/MatriXXXXXXXXX

    `;

    // Image URL or file path
    const imageUrl = "https://files.catbox.moe/k33au9.jpeg";  // Replace with your image URL

    // Send the biography and the image together
    await _0x56a354.sendMessage(_0x4303a2.chat, {
      text: biography
    });

    // Send the image separately
    await _0x56a354.sendMessage(_0x4303a2.chat, {
      image: { url: imageUrl }, // If you have the image URL
      caption: "*🌹Here's a picture of the creator!🌹*"
    });
  }
}, {
  command: ['reportbug'],
  operate: async ({ m, mess, text, Matrix, versions, prefix, command, reply }) => {
    // Now everyone can use this command!
    if (!text) return reply(`Example: ${prefix + command} Hey, play command isn't working`);

    const bugReportMsg = `
*BUG REPORT*

*User*: @${m.sender.split("@")[0]}
*Issue*: ${text}

*Version*: ${versions}
    `;

    const confirmationMsg = `
Hi ${m.pushName},

Your bug report has been forwarded to my developer.
Please wait for a reply.

*Details:*
${bugReportMsg}
    `;

    // Forward the bug report to the developer/owner
    await Matrix.sendMessage("233593734312@s.whatsapp.net", { text: bugReportMsg, mentions: [m.sender] }, { quoted: m });
    // Confirm to the user
    await Matrix.sendMessage(m.chat, { text: confirmationMsg, mentions: [m.sender] }, { quoted: m });
  }
},
  {
  command: ["clearchat"],
  operate: async ({ Matrix: Adiza, m }) => {
    try {
      await Adiza.chatModify(
        {
          delete: true,
          lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }]
        },
        m.chat
      );

      await Adiza.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  }
}, {
  command: ['addsudo', 'sudo', 'setsudo'],
  operate: async ({ m, reply, isCreator, args }) => {
    if (!isCreator) return reply('❌ Only the bot owner can use this command.');

    let number;
    if (m.quoted) {
      number = m.quoted.sender.split('@')[0];
    } else if (args[0]) {
      number = args[0].replace(/\D/g, '');
    }

    if (!number || !/^\d+$/.test(number)) {
      return reply('❌ Please provide a valid number or reply to a message.');
    }

    const jid = number + '@s.whatsapp.net';
    const sudoList = global.db.data.settings.sudo || [];

    if (sudoList.includes(jid)) return reply(`❌ @${number} is already in the sudo list.`);

    sudoList.push(jid);
    global.db.data.settings.sudo = sudoList;
    await global.db.write();

    reply(`✅ Successfully added @${number} to the sudo list.`);
  }
}, {
  command: ['delsudo', 'removesudo'],
  operate: async ({ Matrix, m, reply, isCreator, args }) => {
    if (!isCreator) return reply('❌ Only the bot owner can use this command.');

    let number;
    if (m.quoted) {
      // Get the number from the replied message sender
      number = m.quoted.sender.split('@')[0];
    } else if (args[0]) {
      // Get the number from the command argument (clean non-digit chars)
      number = args[0].replace(/\D/g, '');
    }

    if (!number || !/^\d+$/.test(number)) {
      return reply('❌ Please provide a valid number or reply to a message to remove from the sudo list.');
    }

    const jid = number + '@s.whatsapp.net';

    // Load sudo list from your database inside settings
    const sudoList = global.db.data.settings.sudo || [];

    if (!sudoList.includes(jid)) return reply(`❌ @${number} is not in the sudo list.`);

    const updatedList = sudoList.filter(user => user !== jid);

    try {
      global.db.data.settings.sudo = updatedList;
      await global.db.write();
      reply(`✅ Successfully removed @${number} from the sudo list.`);
    } catch (error) {
      console.error('Error updating sudo list:', error);
      reply('❌ Failed to update the sudo list. Please try again.');
    }
  }
}, {
  command: ['listsudo', 'getsudo'],
  operate: async ({ m, reply, isCreator }) => {
    if (!isCreator) return reply('❌ Only the bot owner can use this command.');

    const sudoList = global.db.data.settings.sudo || [];

    if (sudoList.length === 0) return reply('❌ No numbers are currently in the sudo list.');

    const sudoNumbers = sudoList.map(jid => jid.split('@')[0]).join('\n');

    reply(`📜 *Sudo List:*\n\n${sudoNumbers}`);
  }
}, {
  command: ['request'],
  operate: async ({ m, mess, text, Matrix, versions, prefix, command, reply }) => {
    // Anyone can use this command now!
    if (!text) return reply(`Example: ${prefix + command} I would like a new feature (specify) to be added.`);

    const requestMsg = `
*REQUEST*

*User*: @${m.sender.split("@")[0]}
*Request*: ${text}

*Version*: ${versions}
    `;

    const confirmationMsg = `
Hi ${m.pushName},

Your request has been forwarded to my developer.
Please wait for a reply.

*Details:*
${requestMsg}
    `;

    // Forward request to the developer/owner
    await Matrix.sendMessage("233593734312@s.whatsapp.net", { text: requestMsg, mentions: [m.sender] }, { quoted: m });
    // Confirm to the user
    await Matrix.sendMessage(m.chat, { text: confirmationMsg, mentions: [m.sender] }, { quoted: m });
  }
},

  {
  command: ['restart'],
  operate: async ({ Matrix, m, reply, isCreator, mess }) => {
    if (!isCreator) return reply(mess.owner);
    reply(`*Restarting...*`);
    await sleep(3000);
    process.exit(0);
  }
}, {
  command: ['sender'],
  operate: async ({ Matrix, m, text, reply, botname }) => {
    // Load contacts
    let contacts = [];
    try {
      contacts = JSON.parse(fs.readFileSync(contactsFilePath, 'utf-8'));
    } catch (e) {
      contacts = [];
    }

    // Helper: Find jid by @name
    function getJidByName(name) {
      const entry = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
      return entry ? entry.jid : null;
    }

    // Helper: Get all contact jids
    function getAllContactJids() {
      return contacts.map(c => c.jid);
    }

    if (!text) {
      return reply(
        `⌛ *Queen Adiza Messaging System*\n\n` +
        `Usage:\n*sender* [number message, @name message, @all message, ...]\n\n` +
        `Examples:\n` +
        `.sender 263712345678 Hello there!\n` +
        `.sender @kojo Good morning!\n` +
        `.sender @all Important update for everyone!\n` +
        `.sender 263712345678 Hi!,@kojo Hi!,@all Announcement for all!`
      );
    }

    // Regex for international phone number (8-15 digits)
    const phoneRegex = /(\d{8,15})\s+/g;
    // Regex for @name or @all
    const atNameRegex = /@([a-zA-Z0-9_]+)\s+/g;

    let matches = [];
    let match;

    // Numbers
    while ((match = phoneRegex.exec(text)) !== null) {
      matches.push({ index: match.index, type: "number", value: match[1] });
    }
    // @names and @all
    while ((match = atNameRegex.exec(text)) !== null) {
      matches.push({ index: match.index, type: "at", value: match[1] });
    }

    if (matches.length === 0) {
      return reply("❌ No valid phone numbers or contact names found in your message.");
    }

    // Sort by index (in case numbers and @names are mixed)
    matches.sort((a, b) => a.index - b.index);

    let success = [];
    let failed = [];

    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
      const msgBody = text.substring(start + matches[i].value.length + (matches[i].type === "at" ? 1 : 0)).slice(0, end - start - matches[i].value.length - (matches[i].type === "at" ? 1 : 0)).trim();

      let jids = [];

      if (matches[i].type === "number") {
        // Direct phone number
        const cleanNumber = matches[i].value.replace(/[^0-9]/g, "");
        jids = [cleanNumber + "@s.whatsapp.net"];
      } else if (matches[i].type === "at") {
        if (matches[i].value.toLowerCase() === "all") {
          // @all: send to all in contacts.json
          jids = getAllContactJids();
        } else {
          // @name: lookup in contacts.json
          const jid = getJidByName(matches[i].value);
          if (jid) {
            jids = [jid];
          } else {
            failed.push(`@${matches[i].value} (not found in contacts)`);
            continue;
          }
        }
      }

      if (!msgBody) {
        failed.push(`${matches[i].type === "number" ? matches[i].value : '@' + matches[i].value} (empty message)`);
        continue;
      }

      // Send to all jids found (could be multiple if @all)
      for (const jid of jids) {
        try {
          const messagePayload = {
            text: `👸 *Message from Queen Adiza AI*\n\n${msgBody}\n\n💌 Sent via ${botname || "Queen Adiza Bot"}`,
            contextInfo: {
              externalAdReply: {
                title: "Adiza Messenger Service",
                body: "Direct WhatsApp Delivery",
                thumbnail: await (await fetch("https://files.catbox.moe/sgmydn.jpeg")).buffer(),
                mediaType: 1,
                mediaUrl: "",
                sourceUrl: "",
                showAdAttribution: true
              }
            }
          };
          await Matrix.sendMessage(jid, messagePayload);
          success.push(jid);
        } catch (error) {
          failed.push(`${jid} (error: ${error.message})`);
        }
      }
    }

    let replyText = `🌹 *Queen Adiza AI Message Summary*\n\n`;
    if (success.length > 0) {
      replyText += `✅ Successfully sent to:\n${success.map(jid => `📱 ${jid}`).join("\n")}\n\n`;
    }
    if (failed.length > 0) {
      replyText += `❌ Failed to send to:\n${failed.join("\n")}\n\n`;
    }
    return reply(replyText);
  }
}, {
  command: ['sendto'],
  operate: async ({ Matrix, m, args, reply, isCreator }) => {
    if (!isCreator) return reply('Owner only.');
    if (args.length === 0) return reply('Usage: .sendto How is mum doing @skylar @hector @matrix or @all');

    const fullText = args.join(' ');
    const tagRegex = /@(\S+)/g;
    let match;
    const tags = [];
    while ((match = tagRegex.exec(fullText)) !== null) {
      tags.push(match[1].toLowerCase());
    }

    const cleanMessage = fullText.replace(tagRegex, '').trim();
    if (!cleanMessage) return reply('Please provide a message.');

    if (!fs.existsSync(contactsFilePath)) return reply('No contacts registered.');

    const contacts = JSON.parse(fs.readFileSync(contactsFilePath, 'utf-8'));

    let recipients = [];

    if (tags.includes('all')) {
      // Broadcast to all contacts
      recipients = contacts.map(c => c.jid);
    } else {
      // Send only to tagged contacts found in contacts.json
      for (const tag of tags) {
        const contact = contacts.find(c => c.name === tag);
        if (contact) recipients.push(contact.jid);
      }
    }

    if (recipients.length === 0) {
      return reply('No matching registered contacts found for the tags.');
    }

    let sentCount = 0;
    for (const jid of recipients) {
      try {
        await Matrix.sendMessage(jid, { text: cleanMessage });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send message to ${jid}:`, error);
      }
    }

    reply(`✅ Message sent to ${sentCount} contact(s).`);
  }
}, {
  command: ['addcontact'],
  operate: async ({ m, args, reply, isCreator }) => {
    if (!isCreator) return reply('Owner only.');

    if (args.length < 2) return reply('Usage: .addcontact Sandra 233544981144');

    const name = args[0].toLowerCase();
    let phone = args[1].replace(/[^0-9]/g, '');

    // Append WhatsApp suffix if missing
    if (!phone.endsWith('@s.whatsapp.net')) phone += '@s.whatsapp.net';

    // Load existing contacts or initialize empty array
    let contacts = [];
    if (fs.existsSync(contactsFilePath)) {
      contacts = JSON.parse(fs.readFileSync(contactsFilePath, 'utf-8'));
    }

    // Check for duplicate name
    if (contacts.find(c => c.name === name)) {
      return reply(`Contact with name "${name}" already exists.`);
    }

    contacts.push({ name, jid: phone });

    try {
      await fsp.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
      reply(`*Contact* "${name}" *✅added successfully🎉.*`);
    } catch (err) {
      console.error('Error writing contacts.json:', err);
      reply('Failed to add contact due to an error.');
    }
  }
}, {
  command: ['listcontacts'],
  operate: async ({ reply }) => {
    const fs = require('fs');
    const contactsFilePath = './src/contacts.json';
    try {
      const contacts = JSON.parse(fs.readFileSync(contactsFilePath, 'utf-8'));
      if (!contacts.length) return reply('No contacts saved.');
      let msg = '*🌹Queen Adiza Contacts List🌹:*\n\n';
      contacts.forEach((c, i) => {
        // Extract number from jid (removes @s.whatsapp.net)
        const number = c.jid.replace(/@s\.whatsapp\.net$/, '');
        msg += `${i + 1}. ${c.name} - ${number}\n`;
      });
      reply(msg.trim());
    } catch (e) {
      reply('Failed to read contacts.');
    }
  }
},  

{
  command: ['setprofilepic'],
  operate: async ({ Matrix, m, reply, args, botNumber, prefix, command, mess }) => {
    try {
      console.log('[setprofilepic] Command invoked by:', m.sender);

      let mediaMessage = null;

      // Identify media message (quoted or direct)
      if (m.quoted && m.quoted.mtype && m.quoted.mtype.includes('image')) {
        mediaMessage = m.quoted;
        console.log('[setprofilepic] Using quoted image message');
      } else if (m.mtype && m.mtype.includes('image')) {
        mediaMessage = m;
        console.log('[setprofilepic] Using direct image message');
      } else {
        return reply(`*Send or reply to an image with captions ${prefix + command}*`);
      }

      // Reject webp images (stickers)
      if (mediaMessage.mtype.includes('webp')) {
        return reply(`*WebP images are not supported for profile pictures. Please send a JPG or PNG image with captions ${prefix + command}*`);
      }

      // Validate botNumber
      if (!botNumber || !botNumber.includes('@s.whatsapp.net')) {
        console.error('[setprofilepic] Invalid botNumber:', botNumber);
        return reply("❌ Bot number is invalid or not set correctly.");
      }
      console.log('[setprofilepic] botNumber is valid:', botNumber);

      // ALTERNATIVE APPROACH: Try to download directly as buffer first
      try {
        console.log('[setprofilepic] Attempting direct buffer download...');
        const buffer = await mediaMessage.download();
        
        if (!buffer || buffer.length === 0) {
          return reply("❌ Failed to download image. Please send a new image.");
        }
        
        console.log('[setprofilepic] Buffer downloaded successfully, size:', buffer.length);
        
        // Save buffer to temporary file
        const filePath = './tmp/ppbot.jpeg';
        fs.writeFileSync(filePath, buffer);
        console.log('[setprofilepic] Buffer saved to file:', filePath);
        
        if (args[0] === "full") {
          console.log('[setprofilepic] Using full profile picture update');
          const { img } = await generateProfilePicture(filePath);
          await Matrix.query({
            tag: "iq",
            attrs: {
              to: botNumber,
              type: "set",
              xmlns: "w:profile:picture",
            },
            content: [
              {
                tag: "picture",
                attrs: { type: "image" },
                content: img,
              },
            ],
          });
        } else {
          console.log('[setprofilepic] Using updateProfilePicture method');
          await Matrix.updateProfilePicture(botNumber, { url: filePath });
        }
        
        // Cleanup temp file
        fs.unlinkSync(filePath);
        console.log('[setprofilepic] Temporary file deleted');
        
        return reply(mess.done);
      } catch (bufferErr) {
        console.error('[setprofilepic] Buffer download failed:', bufferErr);
        // Continue to fallback method if buffer approach fails
      }

      // FALLBACK: Ask user to send a fresh image
      return reply("❌ Could not process this image. Please send a new image and try again.");
    } catch (err) {
      console.error("[setprofilepic] Error:", err);
      reply(`❌ Failed to set profile picture: ${err.message || err}`);
    }
  }
}, 

 {
  command: ['toviewonce', 'tovo', 'tovv'],
  operate: async ({ Matrix, m, reply, mess, quoted, mime }) => {
    // Uncomment to restrict to creator only
    // if (!isCreator) return reply(mess.owner);

    if (!quoted) return reply(`*Reply to an Image or Video*`);

    // Helper to download media safely
    async function tryDownload(q) {
      try {
        return await Matrix.downloadAndSaveMediaMessage(q);
      } catch (err) {
        console.error("[toviewonce] Download error:", err);
        reply("❌ Failed to download media. The file may be expired, deleted, or not available. Please ask the sender to resend the media.");
        return null;
      }
    }

    if (/image/.test(mime)) {
      const anuan = await tryDownload(quoted);
      if (!anuan) return;
      await Matrix.sendMessage(
        m.chat,
        {
          image: { url: anuan },
          caption: mess.done,
          fileLength: "999",
          viewOnce: true
        },
        { quoted: m }
      );
    } else if (/video/.test(mime)) {
      const anuanuan = await tryDownload(quoted);
      if (!anuanuan) return;
      await Matrix.sendMessage(
        m.chat,
        {
          video: { url: anuanuan },
          caption: mess.done,
          fileLength: "99999999",
          viewOnce: true
        },
        { quoted: m }
      );
    } else if (/audio/.test(mime)) {
      const bebasap = await tryDownload(quoted);
      if (!bebasap) return;
      await Matrix.sendMessage(m.chat, {
        audio: { url: bebasap },
        mimetype: "audio/mpeg",
        ptt: true,
        viewOnce: true
      });
    } else {
      reply("❌ Unsupported media type. Only image, video, or audio is supported.");
    }
  }
},
{
  command: ['unblock'],
  operate: async ({ Matrix, m, reply, isCreator, mess, text }) => {
    // Check if a quoted message exists, or if a user is mentioned, or if text is provided
    // This line is fixed:
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !text) {
      return reply("Reply to a message or mention/user ID to unblock");
    }

    // This line for userId assignment is fixed:
    const userId = (m.mentionedJid && m.mentionedJid[0]) || m.quoted?.sender || (text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

    // Add a check in case userId somehow ends up null (e.g., empty text)
    if (!userId) {
        return reply("Could not determine user to unblock. Please reply to a message, mention a user, or provide a valid number.");
    }

    await Matrix.updateBlockStatus(userId, "unblock");
    reply(mess.done);
 }
},   
{
  command: ['addprem'],
  operate: async ({ Matrix, m, isCreator, mess, prefix, args, reply, db }) => {
    if (!isCreator) return reply(mess.owner);

    if (args.length < 1) {
      return reply(
        `❗ Usage: ${prefix}addprem <number> [duration]\n\n` +
        `This command grants *All-Access Premium*.\n\n` +
        `Examples of duration formats:\n` +
        `• 60d — 60 days\n` +
        `• 24h — 24 hours\n` +
        `• 30m — 30 minutes\n` +
        `• 10s — 10 seconds (for testing)\n\n` +
        `Example command:\n` +
        `${prefix}addprem 233593734312 30d`
      );
    }

    let userIdInput = args[0].trim();
    const targetJid = userIdInput.includes('@s.whatsapp.net') ? userIdInput : `${userIdInput}@s.whatsapp.net`;

    let durationString = args[1] || '31d'; // Default 31 days

    // Calculate expiry timestamp
    const expiryTimestamp = calculateExpiry(durationString);
    if (expiryTimestamp === null) {
      return reply('❌ Invalid duration format! Use e.g. 60d, 24h, 30m, 10s.');
    }

    const expirationDate = moment(expiryTimestamp).tz('Africa/Accra').format('dddd, MMMM Do YYYY, HH:mm:ss');

    let premiumUsers = db.data.premium || [];
    let existingUserIndex = premiumUsers.findIndex(p => p.jid === targetJid);

    let username = targetJid.split('@')[0];
    const activatedDate = moment().tz('Africa/Accra').format('dddd, MMMM Do YYYY, HH:mm:ss');

    if (existingUserIndex !== -1) {
      premiumUsers[existingUserIndex].expiry = expiryTimestamp;
      reply(`✅ Updated 𝗔𝗹𝗹-𝗔𝗰𝗰𝗲𝘀𝘀 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 for @${username} until ${expirationDate}.`, { mentions: [targetJid] });
    } else {
      premiumUsers.push({
        jid: targetJid,
        expiry: expiryTimestamp,
        type: 'all_access',
        activated: Date.now()
      });
      reply(`✅ Added 𝗔𝗹𝗹-𝗔𝗰𝗰𝗲𝘀𝘀 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 for @${username} until ${expirationDate}.`, { mentions: [targetJid] });
    }

    db.data.premium = premiumUsers;
    await db.write();

    // --- Session recovery logic ---
    let startpairing;
    try {
      startpairing = require('../../rentbot.js'); // Adjust path if needed
    } catch (e) {
      console.error("Could not require rentbot.js for session recovery:", e);
    }

    const sessionPath = path.join(__dirname, '..', '..', 'lib2', 'pairing', targetJid);
    const credsFile = path.join(sessionPath, 'creds.json');
    const pairingFile = path.join(sessionPath, 'pairing.json');
    const isSocketActive = global.activeSockets && global.activeSockets[targetJid];

    if (fs.existsSync(credsFile) && typeof startpairing === 'function' && !isSocketActive) {
      // Session exists but is not active, recover it (no new code needed)
      try {
        startpairing(targetJid);
        console.log(`[ADDPREM] Recovered WhatsApp session for ${targetJid} after premium activation.`);
      } catch (err) {
        console.error(`[ADDPREM] Failed to recover WhatsApp session for ${targetJid}:`, err);
      }
    } else if (!fs.existsSync(credsFile)) {
      // No session files, user must pair again
      console.warn(`[ADDPREM] creds.json not found for ${targetJid}. User must pair again.`);
      reply(`⚠️ User @${username} must pair again using /pair command.`, { mentions: [targetJid] });
    } else if (isSocketActive) {
      // Already active, do nothing
      console.log(`[ADDPREM] Socket already active for ${targetJid}, not starting a new one.`);
    }

    // --- Send premium activation DM with thumbnail ---
    let premiumThumbnailBuffer = null;
    try {
      const thumbnailResponse = await fetch("https://files.catbox.moe/sgmydn.jpeg");
      if (thumbnailResponse.ok) {
        premiumThumbnailBuffer = await thumbnailResponse.buffer();
      }
    } catch (err) {
      console.warn(`Failed to fetch premium thumbnail: ${err.message}`);
    }

    const messageToUser =
      `🎉 💎𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱💎 🎉\n\n` +
      `🥳 Congratulations, @${username}!\n\n` +
      `🥇𝗔𝗹𝗹 𝗔𝗰𝗰𝗲𝘀𝘀 𝗣𝗿𝗲𝗺𝗶𝘂𝗺🥇 subscription to Queen Adiza Bot has been successfully activated.\n\n` +
      `📅 *Activation Date*: ${activatedDate}\n` +
      `⏳ *Expiration Date*: ${expirationDate}\n\n` +
      `You can check your premium status anytime with:\n` +
      `${prefix}premiumstatus 🔮\n\n` +
      `🌹 Enjoy all premium features! If you have any questions, feel free to contact support.`;

    try {
      await Matrix.sendMessage(targetJid, {
        text: messageToUser,
        mentions: [targetJid],
        contextInfo: {
          externalAdReply: {
            title: "Queen Adiza Bot Premium",
            body: "All Access Activated",
            thumbnail: premiumThumbnailBuffer,
            mediaType: 1,
          }
        }
      });
    } catch (error) {
      console.error(`Failed to send premium activation DM to ${targetJid}: ${error.message}`);
      reply(`⚠️ Added premium for @${username} until ${expirationDate}, but failed to send DM.`, { mentions: [targetJid] });
    }
  }
},

{
  command: ['delprem'],
  operate: async ({ Matrix, m, args, reply, isCreator, mess, prefix, db }) => {
    if (!isCreator) return reply(mess.owner);
    if (!args[0]) {
      return reply(`Usage: ${prefix}delprem <number>\nExample: ${prefix}delprem 233544981163`);
    }

    let numberToRemove = args[0].trim();
    if (!numberToRemove.includes('@s.whatsapp.net')) {
      numberToRemove += '@s.whatsapp.net';
    }

    let premiumUsers = db.data.premium || [];
    const index = premiumUsers.findIndex(p => p.jid === numberToRemove);

    if (index === -1) {
      return reply(`User ${numberToRemove.split('@')[0]} is not a premium user.`);
    }

    // 1. Remove user from premium list
    premiumUsers.splice(index, 1);
    db.data.premium = premiumUsers;
    await db.write();

    reply(`✅ Removed premium status from user ${numberToRemove.split('@')[0]}.`);

    // 2. Show all active sockets before removal
    console.log(`[DELPREM DEBUG] Active sockets before:`, Object.keys(global.activeSockets));

    // 3. Try to close the user's active socket if it exists
    if (global.activeSockets && global.activeSockets[numberToRemove]) {
      try {
        console.log(`[DELPREM DEBUG] Attempting to close socket for ${numberToRemove}...`);
        await global.activeSockets[numberToRemove].end();
        await new Promise(res => setTimeout(res, 500));
        delete global.activeSockets[numberToRemove];
        console.log(`[DELPREM] Closed and removed active socket for ${numberToRemove}`);
      } catch (e) {
        console.error(`[DELPREM] Failed to close socket for ${numberToRemove}:`, e);
      }
    } else {
      console.log(`[DELPREM DEBUG] No active socket found for ${numberToRemove}.`);
    }

    // 4. Show all active sockets after removal
    console.log(`[DELPREM DEBUG] Active sockets after:`, Object.keys(global.activeSockets));

    // 5. DO NOT delete any session files. User's WhatsApp session remains linked!

    // 6. Notify user
    try {
      await Matrix.sendMessage(numberToRemove, {
        text: `❌ Your premium status has been revoked. Your WhatsApp remains linked, so you can instantly regain access if you renew your premium.`
      });
    } catch (err) {
      console.warn(`[DELPREM] Could not notify user ${numberToRemove} about premium removal: ${err.message}`);
    }
  }
}, {
  command: ['activesockets'],
  operate: async ({ Matrix, m, isCreator, reply }) => {
    if (!isCreator) return reply("❌ Only the owner can use this command.");

    const sockets = global.activeSockets || {};
    const socketJids = Object.keys(sockets);

    if (socketJids.length === 0) {
      return reply("No active WhatsApp sockets found.");
    }

    let msg = `🟢 *Active WhatsApp Sockets*\n\n`;

    socketJids.forEach((jid, i) => {
      let state = "Unknown";
      try {
        state = sockets[jid].user ? "Connected" : "Disconnected";
      } catch (e) {}
      msg += `${i + 1}. *${jid}*\n   • Status: *${state}*\n   • To disconnect: _${m.prefix || '/'}disconnectsocket ${jid}_\n\n`;
    });

    await Matrix.sendMessage(m.chat, { text: msg }, { quoted: m });
  }
},
{
  command: ['disconnectsocket'],
  operate: async ({ Matrix, m, isCreator, args, reply }) => {
    if (!isCreator) return reply("❌ Only the owner can use this command.");
    if (!args[0]) return reply("❗ Usage: /disconnectsocket <jid>");

    const jid = args[0].trim();
    if (global.activeSockets && global.activeSockets[jid]) {
      try {
        global.activeSockets[jid].end();
        delete global.activeSockets[jid];
        reply(`✅ Disconnected socket for *${jid}*.`);
      } catch (e) {
        reply(`❌ Failed to disconnect *${jid}*: ${e.message}`);
      }
    } else {
      reply(`⚠️ No active socket found for *${jid}*.`);
    }
  }
},

{
  command: ['premiumstatus', 'premstyle'],
  operate: async ({ m, reply, db, Matrix, sender }) => {
    // React with a star emoji to indicate checking premium status
    await Matrix.sendMessage(m.chat, { react: { text: "🌟", key: m.key } });

    const premiumUsers = db.data.premium || [];
    const userPremium = premiumUsers.find(p => p.jid === sender);

    if (userPremium) {
      const currentTime = Date.now();
      const expiryTime = userPremium.expiry;

      if (expiryTime > currentTime) {
        const remainingTime = expiryTime - currentTime;
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        let statusMessage = `👑 *Premium Status: Active* 👑\n\n`;
        statusMessage += `*User:* @${sender.split('@')[0]}\n`;
        statusMessage += `*Expires In:* ${days}d ${hours}h ${minutes}m ${seconds}s\n`;
        statusMessage += `*Expiry Date:* ${new Date(expiryTime).toLocaleString()}`;

        await Matrix.sendMessage(m.chat, { text: statusMessage, mentions: [sender] }, { quoted: m });
        await Matrix.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      } else {
        // Premium expired, you might want to automatically remove them from the list here
        db.data.premium = premiumUsers.filter(p => p.jid !== sender);
        await db.write();
        await reply(`❌ *Premium Status: Expired*\n\nYour premium subscription has ended. Please contact the owner to renew.`);
        await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      }
    } else {
      await reply(`ℹ️ *Premium Status: Not Active*\n\nYou are not a premium user. Contact the owner to get premium access.`);
      await Matrix.sendMessage(m.chat, { react: { text: "✖️", key: m.key } });
    }
  }
}, 

{
  command: ['listprem'],
  operate: async ({ m, reply, isCreator, mess, db }) => {
    if (!isCreator) return reply(mess.owner);

    const premiumUsers = db.data.premium || [];

    if (premiumUsers.length === 0) {
      return reply('No premium users found.');
    }

    let premiumList = '👑 *Premium Users:*\n\n';
    premiumUsers.forEach((p, index) => {
      const jid = p.jid.split('@')[0];
      const expiryFormatted = moment(p.expiry).tz('Africa/Accra').format('dddd, MMMM Do YYYY, HH:mm:ss');
      premiumList += `${index + 1}. JID: ${jid}\n   Expiry: ${expiryFormatted} (Ghana Time)\n\n`;
    });

    reply(premiumList);
  }
}

// PREMIUM COMMANDS END HERE
];
