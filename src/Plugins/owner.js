const fs = require('fs');
const fsp = fs.promises;
const contactsFilePath = './src/contacts.json';
const path = require('path');
const https = require('https');
const fetch = require('node-fetch');
const AdmZip = require("adm-zip");
const axios = require("axios");
const { sleep } = require('../../lib/myfunc');
const { formatDateTime } = require('../../lib/myfunc');
const { promisify } = require('util');
const { calculateExpiry } = require('../../lib/premiumSystem'); 
const { exec } = require('child_process');
const execAsync = promisify(exec);
const { generateProfilePicture, downloadContentFromMessage } = require('@whiskeysockets/baileys');


const filesToUpdate = [
  // Root files
  "talkdrove.json",
  "index.js",
  "system.js",
  "settings.js",
  "app.json",
  "package.json",
  "README.md",
  "Dockerfile",
  "heroku.yml",

  // lib folder files
  "lib/catbox.js",
  "lib/remindme.js",
  "lib/myfunc.js",
  "lib/PluginManager.js",
  "lib/converter.js",
  "lib/reminder.json",
  "lib/timeparser.js",
  "lib/audio.js",
  "lib/Readme.md",
  "lib/antispam.js",
  "lib/scraper.js",
  "lib/remini.js",
  "lib/exif.js",
  "lib/emojis.js",
  "lib/color.js",

  // src/ files
  "src/contacts.json",
  "src/database.json",
  "src/reminder.json",
  "src/store.json",
  "src/badwords.json",

  // src/Plugins/ files
  "src/Plugins/religion.js",
  "src/Plugins/ai.js",
  "src/Plugins/group.js",
  "src/Plugins/search.js",
  "src/Plugins/image.js",
  "src/Plugins/heroku.js",
  "src/Plugins/video.js",
  "src/Plugins/fun.js",
  "src/Plugins/audio.js",
  "src/Plugins/reaction.js",
  "src/Plugins/download.js",
  "src/Plugins/ephoto360.js",
  "src/Plugins/tools.js",
  "src/Plugins/settings.js",
  "src/Plugins/other.js",
  "src/Plugins/owner.js"
];

module.exports = [
 {
  command: ['addbadword'],
  operate: async ({ Matrix, m, isCreator, mess, prefix, args, q, bad, reply }) => {
    if (!isCreator) return reply(mess.owner);
    if (args.length < 1) return reply(`Use ${prefix}addbadword [harsh word].`);

    if (bad.includes(q)) {
      return reply('This word is already in the list!');
    }

    bad.push(q);

    try {
      await fsp.writeFile('./src/badwords.json', JSON.stringify(bad, null, 2));
      reply('Successfully added bad word!');
    } catch (error) {
      console.error('Error writing to badwords.json:', error);
      reply('An error occurred while adding the bad word.');
    }
  }
}, {
  command: ['addignorelist'],
  operate: async ({ m, args, isCreator, mess, reply }) => { // Removed loadBlacklist, assuming db access
    if (!isCreator) return reply(mess.owner);

    let mentionedUser = m.mentionedJid && m.mentionedJid[0];
    let quotedUser = m.quoted && m.quoted.sender;
    let userToAdd = mentionedUser || quotedUser || m.chat;

    if (!userToAdd) return reply('Mention a user, reply to their message, or provide a phone number to ignore.');

    let blacklist = global.db.data.blacklist;
    if (!blacklist.blacklisted_numbers.includes(userToAdd)) {
        blacklist.blacklisted_numbers.push(userToAdd);
        await global.db.write(); // Save changes to the database
        reply(`${userToAdd} added to the ignore list.`);
    } else {
        reply(`${userToAdd} is already ignored.`);
    }
  }
},
  {
  command: ['autobio'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db, botNumber }) => {
    if (!isCreator) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option");

    db.data.settings.autobio = option === "on";
    await db.write(); // Save changes to the database
    reply(`Auto-bio ${option === "on" ? "enabled" : "disabled"} successfully`);
  }
},
 {
  command: ['autoread'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db, botNumber }) => {
    if (!isCreator) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option");

    db.data.settings.autoread = option === "on";
    await db.write(); // Save changes to the database
    reply(`Auto-read ${option === "on" ? "enabled" : "disabled"} successfully`);
  }
}, {
  command: ['autorecord', 'autorecording'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db, botNumber }) => {
    if (!isCreator) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option");

    db.data.settings.autorecord = option === "on";
    await db.write(); // Save changes to the database
    reply(`Auto-record ${option === "on" ? "enabled" : "disabled"} successfully`);
  }
},
  {
  command: ['autotype', 'autotyping'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db, botNumber }) => {
    if (!isCreator) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option");

    db.data.settings.autotype = option === "on";
    await db.write(); // Save changes to the database
    reply(`Auto-typing ${option === "on" ? "enabled" : "disabled"} successfully`);
  }
},
 {
  command: ['autorecordtyping', 'autorecordtype'],
  operate: async ({ Matrix, m, reply, args, prefix, command, isCreator, mess, db, botNumber }) => {
    if (!isCreator) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option");

    db.data.settings.autorecordtype = option === "on";
    await db.write(); // Save changes to the database
    reply(`Auto-record typing ${option === "on" ? "enabled" : "disabled"} successfully`);
  }
},
 {
  command: ['block'],
  operate: async ({ Matrix, m, reply, isCreator, mess, text }) => {
    if (!isCreator) return reply(mess.owner);
    if (!m.quoted && !m.mentionedJid[0] && !text) return reply("Reply to a message or mention/user ID to block");

    const userId = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    await Matrix.updateBlockStatus(userId, "block");
    reply(mess.done);
  }
}, {
  command: ['deletebadword'],
  operate: async ({ Matrix, m, isCreator, mess, prefix, args, q, bad, reply }) => {
    if (!isCreator) return reply(mess.owner);
    if (args.length < 1) return reply(`Use ${prefix}deletebadword [harsh word].`);

    const index = bad.indexOf(q);
    if (index === -1) {
      return reply('This word is not in the list!');
    }

    bad.splice(index, 1);

    try {
      await fsp.writeFile('./src/badwords.json', JSON.stringify(bad, null, 2));
      reply('Successfully deleted bad word!');
    } catch (error) {
      console.error('Error writing to badwords.json:', error);
      reply('An error occurred while deleting the bad word.');
    }
  }
},
 {
  command: ['delete', 'del'],
  operate: async ({ Matrix, m, reply, isCreator, mess }) => {
    if (!isCreator) return reply(mess.owner);
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
  command: ['delignorelist'],
  operate: async ({ m, args, isCreator, mess, reply }) => { // Removed loadBlacklist, assuming db access
    if (!isCreator) return reply(mess.owner);

    let mentionedUser = m.mentionedJid && m.mentionedJid[0];
    let quotedUser = m.quoted && m.quoted.sender;
    let userToRemove = mentionedUser || quotedUser || m.chat;

    if (!userToRemove) return reply('Mention a user, reply to their message, or provide a phone number to remove from the ignore list.');

    let blacklist = global.db.data.blacklist;
    let index = blacklist.blacklisted_numbers.indexOf(userToRemove);
    if (index !== -1) {
        blacklist.blacklisted_numbers.splice(index, 1);
        await global.db.write(); // Save changes to the database
        reply(`${userToRemove} removed from the ignore list.`);
    } else {
        reply(`${userToRemove} is not in the ignore list.`);
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
}, {
  command: ["vv"],
  react: "👾",
  desc: "Owner Only - retrieve quoted view-once message",
  category: "owner",
  operate: async ({
    Matrix: _0x4e1b84,
    m: _0x2650b3,
    reply: _0x6c7b71,
    isCreator: _0x4f2f8f
  }) => {
    // React with ⏳ at start
    await _0x4e1b84.sendMessage(_0x2650b3.chat, {
      react: {
        text: "⏳",
        key: _0x2650b3.key
      }
    });

    try {
      if (!_0x4f2f8f) {
        await _0x4e1b84.sendMessage(_0x2650b3.chat, {
          react: { text: "❌", key: _0x2650b3.key }
        });
        return _0x4e1b84.sendMessage(_0x2650b3.chat, {
          text: "*📛 This is an owner command.*"
        }, { quoted: _0x2650b3 });
      }

      if (!_0x2650b3.quoted) {
        await _0x4e1b84.sendMessage(_0x2650b3.chat, {
          react: { text: "❌", key: _0x2650b3.key }
        });
        return _0x4e1b84.sendMessage(_0x2650b3.chat, {
          text: "*🍁 Please reply to a view once message!*"
        }, { quoted: _0x2650b3 });
      }

      const _0x3df0f6 = await _0x2650b3.quoted.download();
      const _0x537cd4 = _0x2650b3.quoted.mtype;
      const _0x4cc45c = { quoted: _0x2650b3 };

      let _0x5c3ec6 = {};
      switch (_0x537cd4) {
        case "imageMessage":
          _0x5c3ec6 = {
            image: _0x3df0f6,
            caption: _0x2650b3.quoted.text || '',
            mimetype: _0x2650b3.quoted.mimetype || "image/jpeg"
          };
          break;
        case "videoMessage":
          _0x5c3ec6 = {
            video: _0x3df0f6,
            caption: _0x2650b3.quoted.text || '',
            mimetype: _0x2650b3.quoted.mimetype || "video/mp4"
          };
          break;
        case "audioMessage":
          _0x5c3ec6 = {
            audio: _0x3df0f6,
            mimetype: "audio/mp4",
            ptt: _0x2650b3.quoted.ptt || false
          };
          break;
        default:
          await _0x4e1b84.sendMessage(_0x2650b3.chat, {
            react: { text: "❌", key: _0x2650b3.key }
          });
          return _0x4e1b84.sendMessage(_0x2650b3.chat, {
            text: "❌ Only image, video, and audio messages are supported"
          }, { quoted: _0x2650b3 });
      }

      await _0x4e1b84.sendMessage(_0x2650b3.chat, _0x5c3ec6, _0x4cc45c);

      // React with ✅ on success
      await _0x4e1b84.sendMessage(_0x2650b3.chat, {
        react: {
          text: "✅",
          key: _0x2650b3.key
        }
      });

    } catch (_0x3e1173) {
      console.error("vv Error:", _0x3e1173);
      await _0x4e1b84.sendMessage(_0x2650b3.chat, {
        react: {
          text: "❌",
          key: _0x2650b3.key
        }
      });
      await _0x4e1b84.sendMessage(_0x2650b3.chat, {
        text: "❌ Error fetching vv message:\n" + _0x3e1173.message
      }, { quoted: _0x2650b3 });
    }
  }
},  {
  command: ['vv1'],
  operate: async ({ Matrix, m, reply, isCreator, mess }) => {
    if (!isCreator) return reply(mess.owner);
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
  operate: async ({ Matrix: David, m, reply, isCreator, mime, quoted, q }) => {
    // React with a floppy disk emoji to indicate saving
    await David.sendMessage(m.chat, { react: { text: `💾`, key: m.key } });

    if (!isCreator) {
      await David.sendMessage(m.chat, { react: { text: `❌`, key: m.key } });
      return reply('For My Owner Only');
    }

    try {
      let mediaType;

      if (/video/.test(mime)) {
        mediaType = 'video';
      } else if (/image/.test(mime)) {
        mediaType = 'image';
      } else if (/audio/.test(mime)) {
        mediaType = 'audio';
      } else {
        await David.sendMessage(m.chat, { react: { text: `❓`, key: m.key } });
        return reply('Reply to a Video, Image, or Audio You Want to Save');
      }

      const mediaFile = await David.downloadAndSaveMediaMessage(quoted);
      const messageOptions = {
        caption: q || ''
      };

      messageOptions[mediaType] = {
        url: mediaFile
      };

      await David.sendMessage(m.sender, messageOptions, { quoted: m });
      await David.sendMessage(m.chat, { react: { text: `✅`, key: m.key } });
    } catch (error) {
      console.error("Error saving media:", error);
      await David.sendMessage(m.chat, { react: { text: `🚫`, key: m.key } });
      reply('Failed to save and send the media.');
    }
  }
}, {
  command: ['disk'],
  operate: async ({ Matrix, m, reply, isCreator, mess }) => {
    if (!isCreator) return reply(mess.owner);

    await reply('Please Wait');

    let o;
    try {
      o = await execAsync('cd && du -h --max-depth=1');
    } catch (e) {
      o = e;
    } finally {
      let { stdout, stderr } = o;
      if (stdout.trim()) reply(stdout);
      if (stderr.trim()) reply(stderr);
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
  operate: async ({ Matrix: David, m, reply, prefix }) => {
    // React with a camera emoji to indicate fetching profile picture
    await David.sendMessage(m.chat, { react: { text: "📸", key: m.key } });

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      await David.sendMessage(m.chat, { react: { text: "❓", key: m.key } });
      return reply(`Reply to someone's message or tag a user with ${prefix}getpp`);
    }

    try {
      const targetUser = m.quoted ? m.quoted.sender : m.mentionedJid[0];
      const profilePicUrl = await David.profilePictureUrl(targetUser, 'image').catch(() => null);
      const responseMessage = `Profile picture of @${targetUser.split('@')[0]}`;
      await David.sendMessage(m.chat, {
        image: { url: profilePicUrl },
        caption: responseMessage,
        mentions: [targetUser]
      });
      // React with a checkmark on successful retrieval
      await David.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      // React with an 'X' on failure
      await David.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      reply("Couldn't fetch profile picture. The user might not have a profile picture or an error occurred.");
    }
  }
}, {
  command: ["checkupdate", "check"],
  tags: ["owner"],
  help: ["checkupdate"],
  operate: async ({ Matrix, m, reply }) => {
    try {
      const fs = require("fs");
      const path = require("path");
      const axios = require("axios");

      await Matrix.sendMessage(m.chat, {
        text: "🔍 Checking for new updates... Please wait.",
        react: { text: "✅", key: m.key }
      });

      const repoUrl = "https://api.github.com/repos/Matrix1999/Queen-Adiza/commits/main";
      const response = await axios.get(repoUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const latestCommitHash = response.data.sha;
      const commitFilePath = path.join(__dirname, "..", "current_commit.json");

      if (fs.existsSync(commitFilePath)) {
        const currentCommit = JSON.parse(fs.readFileSync(commitFilePath, "utf-8")).commitHash;

        if (currentCommit !== latestCommitHash) {
          await reply("⚡️ *New update available!* A new version of the bot has been released.\nUse the `.update` command to fetch the latest changes.");
          fs.writeFileSync(commitFilePath, JSON.stringify({ commitHash: latestCommitHash }, null, 2));
        } else {
          await reply("✅ *Your bot is up-to-date!* No new updates found.");
        }
      } else {
        fs.writeFileSync(commitFilePath, JSON.stringify({ commitHash: latestCommitHash }, null, 2));
        await reply("✅ *Bot is now set up to check updates!* Type .check or .checkupdate once again");
      }
    } catch (err) {
      console.error("Update Check Error:", err.message);
      await reply("❌ *Error checking for updates!* Please try again later.");
    }
  }
}, {
  command: ['github-update'],
  tags: ['owner'],
  desc: 'Update one or more files from GitHub, or list all updatable files',
  operate: async ({ isCreator, reply, args }) => {
    if (!isCreator) return reply("🚫 Only the bot owner can use this command.");

    // If no argument, show the list
    if (!args[0]) {
      let listText = "*Available files to update:*\n";
      filesToUpdate.forEach(f => listText += `- ${f}\n`);
      listText += "\n_Usage: .github-update <file1> <file2> ..._\nExample: .github-update system.js index.js src/Plugins/ai.js";
      return reply(listText);
    }

    // Support multiple files: .github-update file1 file2 file3
    const files = args.map(f => f.trim()).filter(f => filesToUpdate.includes(f));
    const notAllowed = args.filter(f => !filesToUpdate.includes(f.trim()));

    if (files.length === 0) {
      return reply(`❌ None of the files you requested are in the update list.\nType .github-update to see the list.`);
    }

    if (notAllowed.length > 0) {
      await reply(`⚠️ These files are not allowed or not found and will be skipped: ${notAllowed.join(', ')}`);
    }

    const owner = "Matrix1999";
    const repo = "Queen-Adiza";
    const branch = "main";

    let updated = [];
    let failed = [];

    for (const fileArg of files) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fileArg}`;
      const localFilePath = path.join('./', fileArg);

      try {
        await reply(`⬇️ Downloading: ${fileArg}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const content = await res.text();

        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
        fs.writeFileSync(localFilePath, content, 'utf8');
        updated.push(fileArg);
      } catch (error) {
        failed.push(fileArg);
        await reply(`❌ Failed to update ${fileArg}: ${error.message}`);
      }
    }

    if (updated.length > 0) {
      await reply(`✅ Successfully updated: ${updated.join(', ')}`);
      await reply("♻️ Restarting bot in 3 seconds...");
      setTimeout(() => process.exit(0), 3000);
    } else {
      await reply("❌ No files were updated.");
    }
  }
}, {
  command: ["update"],
  tags: ["owner"],
  help: ["update"],
  operate: async ({ Matrix, m, text, reply }) => {
    try {
      const fs = require("fs");
      const path = require("path");
      const axios = require("axios");
      const AdmZip = require("adm-zip");

      const steps = [
        "Queen-Adiza Bot Updating...🚀",
        "📦 Downloading the latest code...",
        "⌛ Extracting the latest code...",
        "🔄 Replacing files...",
        "♻️ Finalizing and restarting..."
      ];

      await Matrix.sendMessage(m.chat, {
        text: steps[0],
        react: { text: "🔍", key: m.key }
      });

      const pkgPath = path.join(process.cwd(), "package.json");

      //This loop will continue until a successful update
      while(true){
        const packageJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const { data: commitInfo } = await axios.get("https://api.github.com/repos/Matrix1999/Queen-Adiza/commits/main");
        const latestCommit = commitInfo.sha;
        const currentCommit = packageJson.commitHash || "unknown";

        if (latestCommit === currentCommit) {
          return reply("```✅ Your Queen-Adiza bot is already up-to-date!```");
        }

        await Matrix.sendMessage(m.chat, {
          text: steps[1],
          react: { text: "📦", key: m.key }
        });

        const zipPath = path.join(process.cwd(), "latest.zip");
        const { data: zipData } = await axios.get("https://github.com/Matrix1999/Queen-Adiza/archive/main.zip", {
          responseType: "arraybuffer"
        });
        fs.writeFileSync(zipPath, zipData);

        await Matrix.sendMessage(m.chat, {
          text: steps[2],
          react: { text: "✅", key: m.key }
        });

        const extractPath = path.join(process.cwd(), "latest");
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        const extractedFolder = path.join(extractPath, "Queen-Adiza-main");
        if (!fs.existsSync(extractedFolder)) throw new Error("Extracted folder not found.");

        function copyFolderSync(from, to) {
          if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
          const items = fs.readdirSync(from);
          for (const item of items) {
            const src = path.join(from, item);
            const dest = path.join(to, item);
            if (fs.lstatSync(src).isDirectory()) {
              copyFolderSync(src, dest);
            } else {
              fs.copyFileSync(src, dest);
            }
          }
        }

        copyFolderSync(extractedFolder, process.cwd());

        await Matrix.sendMessage(m.chat, {
          text: steps[3],
          react: { text: "🔄", key: m.key }
        });

        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        // Rebuild package.json with commitHash right after description
        const finalPkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const reorderedPkg = {
          name: finalPkg.name,
          version: finalPkg.version,
          description: finalPkg.description,
          commitHash: latestCommit,
          main: finalPkg.main,
          engines: finalPkg.engines,
          scripts: finalPkg.scripts,
          author: finalPkg.author,
          license: finalPkg.license,
          dependencies: finalPkg.dependencies
        };
        fs.writeFileSync(pkgPath, JSON.stringify(reorderedPkg, null, 2));

        await Matrix.sendMessage(m.chat, {
          text: steps[4],
          react: { text: "♻️", key: m.key }
        });

        reply("```✅ Bot updated and restarted successfully!```");

        setTimeout(() => {
          process.exit(0);
        }, 2000);
        break; //Exit the loop after a successful update
      }
    } catch (err) {
      console.error("Update error:", err);
      reply("❌ Update failed. Please try manually.");
    }
  }
}, {
  command: ["userinfo"],
  operate: async ({ Matrix: Matrix, m, reply, prefix }) => {
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply(`Reply to someone's message or tag a user with ${prefix}userinfo`);
    }

    try {
      const targetUser = m.quoted ? m.quoted.sender : m.mentionedJid[0];
      const phoneNumber = targetUser.split('@')[0];

      // Fetch profile picture
      const profilePicUrl = await Matrix.profilePictureUrl(targetUser, 'image').catch(() => null);

      const userInfoMessage = `
*User Info:*
- JID: ${targetUser}
- Phone Number: ${phoneNumber}
${profilePicUrl ? `- Profile Picture: [Click Here](${profilePicUrl})` : '- No Profile Picture'}
      `.trim();

      await Matrix.sendMessage(m.chat, {
        image: profilePicUrl ? { url: profilePicUrl } : undefined,
        caption: userInfoMessage,
        mentions: [targetUser]
      });

    } catch (error) {
      console.error("Error fetching user info:", error);
      reply("Couldn't fetch user information. The user might have privacy settings enabled.");
    }
  }
}, {
  command: ["groupid", "idgc"],
  operate: async ({
    Matrix: _0x858a65,
    m: _0x263681,
    reply: _0x52fd2c,
    isCreator: _0x28b98e,
    mess: _0x154c39,
    args: _0x11dc19,
    q: _0x286173
  }) => {
    if (!_0x28b98e) {
      return _0x52fd2c(_0x154c39.owner);
    }
    if (!_0x286173) {
      return _0x52fd2c("Please provide a group link!");
    }
    let _0x3ade33 = _0x11dc19.join(" ");
    let _0x2903f0 = _0x3ade33.split("https://chat.whatsapp.com/")[1];
    if (!_0x2903f0) {
      return _0x52fd2c("Link Invalid");
    }
    _0x858a65.query({
      tag: "iq",
      attrs: {
        type: "get",
        xmlns: "w:g2",
        to: "@g.us"
      },
      content: [{
        tag: "invite",
        attrs: {
          code: _0x2903f0
        }
      }]
    }).then(async _0x186d1c => {
      const _0x5ea06e = "" + (_0x186d1c.content[0].attrs.id ? _0x186d1c.content[0].attrs.id : "undefined");
      _0x52fd2c(_0x5ea06e + "@g.us");
    });
  }
}, {
  command: ['gcaddprivacy'],
  operate: async ({ Matrix, m, reply, isCreator, mess, prefix, command, text, args }) => {
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply(`Options: all/contacts/contact_blacklist/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "contacts", "contact_blacklist"];
    if (!validOptions.includes(args[0])) return reply("*Invalid option!*");

    await Matrix.updateGroupsAddPrivacy(text);
    await reply(mess.done);
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
  operate: async ({ Matrix, m, reply, isCreator, mess, args, q }) => {
    if (!isCreator) return reply(mess.owner);
    if (!q) return reply('Please provide a group link!');

    let linkRegex = args.join(" ");
    let coded = linkRegex.split("https://chat.whatsapp.com/")[1];
    if (!coded) return reply("Link Invalid");

    Matrix.query({
      tag: "iq",
      attrs: {
        type: "get",
        xmlns: "w:g2",
        to: "@g.us"
      },
      content: [{ tag: "invite", attrs: { code: coded } }]
    }).then(async (res) => {
      const tee = `${res.content[0].attrs.id ? res.content[0].attrs.id : "undefined"}`;
      reply(tee + '@g.us');
    });
  }
}, {
  command: ['hostip', 'ipbot'],
  operate: async ({ Matrix, m, reply, isCreator, mess }) => {
    if (!isCreator) return reply(mess.owner);

    https.get("https://api.ipify.org", (res) => {
      let data = '';
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => reply("Bot's public IP: " + data));
    });
  }
}, {
  command: ['join'],
  operate: async ({ Matrix, m, reply, isCreator, mess, args, text, isUrl }) => {
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply("Enter group link");
    if (!isUrl(args[0]) && !args[0].includes("whatsapp.com")) return reply("Invalid link");

    try {
      const link = args[0].split("https://chat.whatsapp.com/")[1];
      await Matrix.groupAcceptInvite(link);
      reply("Joined successfully");
    } catch {
      reply("Failed to join group");
    }
  }
}, {
  command: ["pinchat"],
  operate: async ({ Matrix: David, m, reply, isCreator }) => {
    if (!isCreator) return reply('This command is for the owner only.');

    try {
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
    if (!isCreator) return reply('This command is for the owner only.');

    try {
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
    if (!isCreator) return reply("For My Owner Only");

    try {
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
  operate: async _0x5e2413 => {
    const {
      reply,
      isCreator,
      mess,
      Matrix
    } = _0x5e2413;

    if (!isCreator) return reply(mess.owner);

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
  operate: async ({
    Matrix: _0x16a3ee,
    m: _0xcc04be,
    reply: _0x3aabb6,
    isCreator: _0x3e6ceb,
    mess: _0x23ff01,
    args: _0x4750ac,
    text: _0x3303c9,
    isUrl: _0x143fb9
  }) => {
    // React with a handshake emoji to indicate joining
    await _0x16a3ee.sendMessage(_0xcc04be.chat, {
      react: {
        text: "🤝",
        key: _0xcc04be.key
      }
    });

    if (!_0x3e6ceb) {
      await _0x16a3ee.sendMessage(_0xcc04be.chat, {
        react: {
          text: "❌",
          key: _0xcc04be.key
        }
      });
      return _0x3aabb6(_0x23ff01.owner);
    }
    if (!_0x3303c9) {
      await _0x16a3ee.sendMessage(_0xcc04be.chat, {
        react: {
          text: "❓",
          key: _0xcc04be.key
        }
      });
      return _0x3aabb6("Enter group link");
    }
    if (!isUrl(_0x4750ac[0]) && !_0x4750ac[0].includes("whatsapp.com")) {
      await _0x16a3ee.sendMessage(_0xcc04be.chat, {
        react: {
          text: "🔗", // Or "🚫" for invalid link
          key: _0xcc04be.key
        }
      });
      return _0x3aabb6("Invalid link");
    }
    try {
      const _0x3ecaf1 = _0x4750ac[0].split("https://chat.whatsapp.com/")[1];
      await _0x16a3ee.groupAcceptInvite(_0x3ecaf1);
      await _0x16a3ee.sendMessage(_0xcc04be.chat, {
        react: {
          text: "✅",
          key: _0xcc04be.key
        }
      });
      _0x3aabb6("Joined successfully");
    } catch {
      await _0x16a3ee.sendMessage(_0xcc04be.chat, {
        react: {
          text: "⚠️", // Or "❌" for failure
          key: _0xcc04be.key
        }
      });
      _0x3aabb6("Failed to join group");
    }
  }
}, {
  command: ['lastseen'],
  operate: async ({ Matrix, m, reply, isCreator, mess, prefix, command, text, args }) => {
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply(`Options: all/contacts/contact_blacklist/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "contacts", "contact_blacklist", "none"];
    if (!validOptions.includes(args[0])) return reply("Invalid option");

    await Matrix.updateLastSeenPrivacy(text);
    await reply(mess.done);
  }
}, {
  command: ['leave', 'leavegc'],
  operate: async ({ Matrix, m, reply, isCreator, mess, sleep }) => {
    if (!isCreator) return reply(mess.owner);
    if (!m.isGroup) return reply(mess.group);

    reply("*Goodbye, it was nice being here!*");
    await sleep(3000);
    await Matrix.groupLeave(m.chat);
  }
}, {
  command: ['listbadword'],
  operate: async ({ m, reply, isCreator, mess, bad }) => {
    if (!isCreator) return reply(mess.owner);
    if (m.isGroup) return reply('This command cannot be used in personal chats.');

    if (bad.length === 0) return reply('No bad words have been added yet.');

    let text = '*Bad Words List:*\n\n';
    bad.forEach((word, index) => {
      text += `${index + 1}. ${word}\n`;
    });

    text += `\nTotal bad words: ${bad.length}`;
    reply(text);
  }
},
{
  command: ['listignorelist'],
  operate: async ({ reply }) => { // Assuming loadBlacklist is implicitly using global.db
    let blacklist = global.db.data.blacklist;
    if (blacklist.blacklisted_numbers.length === 0) {
        reply('The ignore list is empty.');
    } else {
        reply(`Ignored users/chats:\n${blacklist.blacklisted_numbers.join('\n')}`);
    }
  }
}, {
  command: ['modestatus', 'botmode'],
  operate: async ({ Xploader, m, reply, isCreator, mess, modeStatus }) => {
    if (!isCreator) return reply(mess.owner);
    reply(`Current mode: ${modeStatus}`);
  }
},
  {
  command: ['online'],
  operate: async ({ Matrix, m, reply, isCreator, mess, prefix, command, text, args }) => {
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply(`Options: all/match_last_seen\nExample: ${prefix + command} all`);

    const validOptions = ["all", "match_last_seen"];
    if (!validOptions.includes(args[0])) return reply("Invalid option");

    await Matrix.updateOnlinePrivacy(text);
    await reply(mess.done);
  }
}, {
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
  },
}, {
  command: ['ppprivacy'],
  operate: async ({ Matrix, m, reply, isCreator, mess, prefix, command, text, args }) => {
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply(`Options: all/contacts/contact_blacklist/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "contacts", "contact_blacklist", "none"];
    if (!validOptions.includes(args[0])) return reply("Invalid option");

    await Matrix.updateProfilePicturePrivacy(text);
    await reply(mess.done);
  }
}, {
  command: ['react'],
  operate: async ({ Matrix, m, reply, isCreator, mess, args, quoted }) => {
    if (!isCreator) return reply(mess.owner);
    if (!args) return reply(`*Reaction emoji needed*\n Example .react 🤔`);

    const reactionMessage = {
      react: {
        text: args[0],
        key: { remoteJid: m.chat, fromMe: true, id: quoted.id },
      },
    };
    Matrix.sendMessage(m.chat, reactionMessage);
  }
},
  {
  command: ['readreceipts'],
  operate: async ({ Matrix, m, reply, isCreator, mess, prefix, command, text, args }) => {
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply(`Options: all/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "none"];
    if (!validOptions.includes(args[0])) return reply("Invalid option");

    await Matrix.updateReadReceiptsPrivacy(text);
    await reply(mess.done);
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
  operate: async ({ m, mess, text, Matrix, isCreator, versions, prefix, command, reply }) => {
    if (!isCreator) return reply(mess.owner);
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

    Matrix.sendMessage("233593734312@s.whatsapp.net", { text: bugReportMsg, mentions: [m.sender] }, { quoted: m });
    Matrix.sendMessage(m.chat, { text: confirmationMsg, mentions: [m.sender] }, { quoted: m });
  }
},  {
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
  operate: async ({ m, mess, text, Matrix, isCreator, versions, prefix, command, reply }) => {
    if (!isCreator) return reply(mess.owner);
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

    Matrix.sendMessage("233593734312@s.whatsapp.net", { text: requestMsg, mentions: [m.sender] }, { quoted: m });
    Matrix.sendMessage(m.chat, { text: confirmationMsg, mentions: [m.sender] }, { quoted: m });
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
}, {
  command: ['setprofilepic'],
  operate: async ({ Matrix, m, reply, isCreator, mess, prefix, command, quoted, mime, args, botNumber }) => {
    if (!isCreator) return reply(mess.owner);
    if (!quoted) return reply(`*Send or reply to an image With captions ${prefix + command}*`);
    if (!/image/.test(mime)) return reply(`*Send or reply to an image With captions ${prefix + command}*`);
    if (/webp/.test(mime)) return reply(`*Send or reply to an image With captions ${prefix + command}*`);

    const medis = await Matrix.downloadAndSaveMediaMessage(quoted, "ppbot.jpeg");

    if (args[0] === "full") {
      const { img } = await generateProfilePicture(medis);
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
            attrs: {
              type: "image",
            },
            content: img,
          },
        ],
      });
      fs.unlinkSync(medis);
      reply(mess.done);
    } else {
      await Matrix.updateProfilePicture(botNumber, {
        url: medis,
      });
      fs.unlinkSync(medis);
      reply(mess.done);
    }
  }
}, {
  command: ['toviewonce', 'tovo', 'tovv'],
  operate: async ({ Matrix, m, reply, isCreator, mess, quoted, mime }) => {
    if (!isCreator) return reply(mess.owner);
    if (!quoted) return reply(`*Reply to an Image or Video*`);

    if (/image/.test(mime)) {
      const anuan = await Matrix.downloadAndSaveMediaMessage(quoted);
      Matrix.sendMessage(
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
      const anuanuan = await Matrix.downloadAndSaveMediaMessage(quoted);
      Matrix.sendMessage(
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
      const bebasap = await Matrix.downloadAndSaveMediaMessage(quoted);
      Matrix.sendMessage(m.chat, {
        audio: { url: bebasap },
        mimetype: "audio/mpeg",
        ptt: true,
        viewOnce: true
      });
    }
  }
}, {
  command: ['unblock'],
  operate: async ({ Matrix, m, reply, isCreator, mess, text }) => {
    if (!isCreator) return reply(mess.owner);
    if (!m.quoted && !m.mentionedJid[0] && !text) return reply("Reply to a message or mention/user ID to unblock");

    const userId = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    await Matrix.updateBlockStatus(userId, "unblock");
    reply(mess.done);
  }
},  {
        command: ['addprem'],
        operate: async ({ Matrix, m, isCreator, mess, prefix, args, reply, db }) => { // Added 'db' to params
            // Assuming ADMIN_ID is defined elsewhere or use isCreator
            // if (m.sender !== ADMIN_ID) return reply(mess.owner);
            if (!isCreator) return reply(mess.owner); // Using isCreator for simplicity, replace with ADMIN_ID check if preferred

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

            let durationString = args[1] || '31d'; // Default to 31 days if no duration is provided

            const expiryTimestamp = calculateExpiry(durationString);

            if (expiryTimestamp === null) {
                return reply('❌ Invalid duration format! Use e.g. 60d, 24h, 30m, 10s.');
            }

            let premiumUsers = db.data.premium || [];
            let existingUserIndex = premiumUsers.findIndex(p => p.jid === targetJid);

            let username = targetJid.split('@')[0]; // Default to number if name cannot be fetched
            try {
                // Try to get the display name for better user message
                const contactInfo = await Matrix.getContact(targetJid);
                if (contactInfo && contactInfo.verifiedName) {
                    username = contactInfo.verifiedName;
                } else if (contactInfo && contactInfo.pushName) {
                    username = contactInfo.pushName;
                }
            } catch (error) {
                console.warn(`Could not fetch username for user ID ${targetJid}: ${error.message}`);
                // username remains the JID part if fetching name fails
            }

            const activatedDate = new Date();
            const expirationDate = new Date(expiryTimestamp);

            if (existingUserIndex !== -1) {
                // User already premium, update expiry
                premiumUsers[existingUserIndex].expiry = expiryTimestamp;
                reply(`✅ Updated 𝗔𝗹𝗹-𝗔𝗰𝗰𝗲𝘀𝘀 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 for @${targetJid.split('@')[0]} until ${formatDateTime(expirationDate)}.`, { mentions: [targetJid] });
            } else {
                // New premium user
                premiumUsers.push({
                    jid: targetJid,
                    expiry: expiryTimestamp,
                    type: 'all_access', // Added type
                    activated: activatedDate.getTime() // Added activation timestamp
                });
                reply(`✅ Added 𝗔𝗹𝗹-𝗔𝗰𝗰𝗲𝘀𝘀 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 for @${targetJid.split('@')[0]} until ${formatDateTime(expirationDate)}.`, { mentions: [targetJid] });
            }

            db.data.premium = premiumUsers; // Update the db object
            await db.write(); // Save changes to the database


            // --- Send notification message to the user ---
            const messageToUser =
                `🎉 💎𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱💎 🎉\n\n` +
                `🥳 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘂𝗹𝗮𝘁𝗶𝗼𝗻𝘀, @${targetJid.split('@')[0]}!\n\n` +
                `🥇𝗔𝗹𝗹 𝗔𝗰𝗰𝗲𝘀𝘀 𝗣𝗿𝗲𝗺𝗶𝘂𝗺🥇 subscription to Queen Adiza Bot has been successfully activated.\n\n` +
                `📅 *Activation Date*: ${formatDateTime(activatedDate)}\n` +
                `⏳ *Expiration Date*: ${formatDateTime(expirationDate)}\n\n` +
                `You can always check your premium status by using the command\n` +
                `${prefix}premiumstatus 🔮\n\n` + // Changed to premiumstatus based on previous suggestion
                `🌹𝗘𝗻𝗷𝗼𝘆 𝗮𝗹𝗹 𝗽𝗿𝗲𝗺𝗶𝘂𝗺 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀! 𝗜𝗳 𝘆𝗼𝘂 𝗵𝗮𝘃𝗲 𝗮𝗻𝘆 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻𝘀, 𝗳𝗲𝗲𝗹 𝗳𝗿𝗲𝗲 𝘁𝗼 𝗰𝗼𝗻𝘁𝗮𝗰𝘁 𝘀𝘂𝗽𝗽𝗼𝗿𝘁.`
            ;

            try {
                await Matrix.sendMessage(
                    targetJid,
                    {
                        text: messageToUser,
                        mentions: [targetJid], // Important for mentioning the user in their own DM
                        contextInfo: {
                            externalAdReply: {
                                title: "Queen Adiza Bot Premium",
                                body: "All Access Activated",
                                thumbnail: await (await fetch("https://files.catbox.moe/sgmydn.jpeg")).buffer(),
                                mediaType: 1,
                                mediaUrl: "",
                                sourceUrl: ""
                            }
                        }
                    }
                );
              
            } catch (error) {
                console.error(`Failed to send premium activation message to user ${targetJid}: ${error.message}`);
                reply(
                    `⚠️ Added 𝗔𝗹𝗹-𝗔𝗰𝗰𝗲𝘀𝘀 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 for @${targetJid.split('@')[0]} until ${formatDateTime(expirationDate)}, but *failed to send notification message to the user*. They might have blocked the bot or have privacy settings preventing DMs.`,
                    { mentions: [targetJid] }
                );
       }
   }
}, {
  command: ['delprem'],
  operate: async ({ m, args, reply, isCreator, mess, prefix, db }) => {
    if (!isCreator) return reply(mess.owner);
    if (!args[0]) {
      return reply(`Usage: ${prefix}delprem <number>\nExample: ${prefix}delprem 233544981163`);
    }

    let numberToRemove = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
    let premiumUsers = db.data.premium || []; // Ensure premium array exists
    let initialLength = premiumUsers.length;

    premiumUsers = premiumUsers.filter(p => p.jid !== numberToRemove);

    if (premiumUsers.length < initialLength) {
      reply(`Removed premium for ${numberToRemove.split('@')[0]}.`);
    } else {
      reply(`User ${numberToRemove.split('@')[0]} is not a premium user.`);
    }
    db.data.premium = premiumUsers; // Update the db object
    await db.write(); // Save changes to the database
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
}, {
  command: ['listprem'],
  operate: async ({ m, reply, isCreator, mess, db }) => {
    if (!isCreator) return reply(mess.owner);

    const premiumUsers = db.data.premium || []; // Ensure premium array exists

    if (premiumUsers.length === 0) {
      return reply('No premium users found.');
    }

    let premiumList = '👑 *Premium Users:*\n\n';
    premiumUsers.forEach((p, index) => {
      premiumList += `${index + 1}. JID: ${p.jid.split('@')[0]}\n`;
      premiumList += `   Expiry: ${new Date(p.expiry).toLocaleString()}\n\n`;
    });
    reply(premiumList);
  }
}
// PREMIUM COMMANDS END HERE
];
