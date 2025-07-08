const os = require('os');
const fs = require('fs');
const fetch = require('node-fetch');
const axios = require('axios');
const moment = require('moment-timezone');
const { formatSize, checkBandwidth, runtime } = require('../../lib/myfunc');
const checkDiskSpace = require('check-disk-space').default;
const performance = require('perf_hooks').performance;
const botImage = fs.readFileSync("./Media/Images/Adiza5.jpg");

module.exports = [ {
    command: ['botstatus', 'statusbot'],
    operate: async ({ Matrix, m, reply }) => {
      const used = process.memoryUsage();
      const ramUsage = `${formatSize(used.heapUsed)} / ${formatSize(os.totalmem())}`;
      const freeRam = formatSize(os.freemem());
      const disk = await checkDiskSpace(process.cwd());
      const latencyStart = performance.now();
      
      await reply("⏳ *Calculating ping...*");
      const latencyEnd = performance.now();
      const ping = `${(latencyEnd - latencyStart).toFixed(2)} ms`;

      const { download, upload } = await checkBandwidth();
      const uptime = runtime(process.uptime());

      const response = `
      *🔹 BOT STATUS 🔹*

🔸 *Ping:* ${ping}
🔸 *Uptime:* ${uptime}
🔸 *RAM Usage:* ${ramUsage}
🔸 *Free RAM:* ${freeRam}
🔸 *Disk Usage:* ${formatSize(disk.size - disk.free)} / ${formatSize(disk.size)}
🔸 *Free Disk:* ${formatSize(disk.free)}
🔸 *Platform:* ${os.platform()}
🔸 *NodeJS Version:* ${process.version}
🔸 *CPU Model:* ${os.cpus()[0].model}
🔸 *Downloaded:* ${download}
🔸 *Uploaded:* ${upload}
`;

      Matrix.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
    }
}, {
    command: ['pair'],
    operate: async ({ m, text, reply }) => {
      if (!text) return reply('*Provide a phone number*\nExample: .pair 233593734312');
      const number = text.replace(/\+|\s/g, '').trim();
      const apiUrls = [
        `https://adiza-session-ajl1.onrender.com/code?number=${encodeURIComponent(number)}`,
        `https://adiza-session-ajl1.onrender.com/code?number=${encodeURIComponent(number)}`
      ];

      for (const url of apiUrls) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const data = await response.json();
          const pairCode = data.code || 'No code received';

          return reply(`*🔹 Pair Code:*\n\`\`\`${pairCode}\`\`\`\n\n🔹 *How to Link:* 
1. Open WhatsApp on your phone.
2. Go to *Settings > Linked Devices*.
3. Tap *Link a Device* then *Link with Phone*.
4. Enter the pair code above.
5. Alternatively, tap the WhatsApp notification sent to your phone.
\n⏳ *Code expires in 2 minutes!*`);
        } catch (error) {
          continue;
        }
      }

      reply('❌ *Error fetching pair code. Try again later.*');
    }
}, {
  command: ['ping', 'p'],
  operate: async ({ m, Matrix }) => {
    const startTime = performance.now();

    try {
      const sentMessage = await Matrix.sendMessage(m.chat, {
        text: "🔸Ping!",
        contextInfo: { quotedMessage: m.message }
      });
      
      const endTime = performance.now();
      const latency = `${(endTime - startTime).toFixed(2)} ms`;
      
      await Matrix.sendMessage(m.chat, {
        text: `*⚡ 𝘼𝙙𝙞𝙯𝙖 𝙎𝙥𝙚𝙚𝙙:* ${latency}`,
        edit: sentMessage.key, 
        contextInfo: { quotedMessage: m.message }
      });

    } catch (error) {
      console.error('Error sending ping message:', error);
      await Matrix.sendMessage(m.chat, {
        text: 'An error occurred while trying to ping.',
        contextInfo: { quotedMessage: m.message }
      });
    }
  }
}, {
  command: ['post'],
  operate: async ({ m, Matrix, reply, quoted }) => {
    if (!quoted || !quoted.mimetype || !/audio/.test(quoted.mimetype)) {
      return reply('❌ Reply to an *Audio File* to post it on status.');
    }

    try {
      // React with hourglass emoji
      await Matrix.sendMessage(m.chat, {
        react: { text: '⌛', key: m.key }
      });

      // Download and save audio from quoted message
      const mediaFile = await Matrix.downloadAndSaveMediaMessage(quoted);

      // Prepare message options for audio
      const messageOptions = {
        audio: { url: mediaFile },
        mimetype: 'audio/mp4',
        ptt: false // Set true if you want voice note style
      };

      // Send audio to the caller's own status JID
      const userStatusJid = m.sender.replace(/@.+$/, '@s.whatsapp.net');

      await Matrix.sendMessage(userStatusJid, messageOptions);

      // React with success emoji
      await Matrix.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      });

      reply('✅ *Audio successfully posted to your status!*');
    } catch (error) {
      console.error('Error in post command:', error);
      await Matrix.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      reply('❌ Failed to post audio on status.');
    }
  }
}, 
 {
  command: ['repost'],
  operate: async ({ m, Matrix, reply, quoted, text }) => {
    if (!quoted) {
      return reply('❌ *Please reply to a media message (Video, Image, or Audio) to repost.*');
    }

    // Get the mimetype
    const mime = quoted.mimetype ||
      quoted.message?.videoMessage?.mimetype ||
      quoted.message?.imageMessage?.mimetype ||
      quoted.message?.audioMessage?.mimetype || '';

    let mediaType;
    if (/video/.test(mime)) {
      mediaType = 'video';
    } else if (/image/.test(mime)) {
      mediaType = 'image';
    } else if (/audio/.test(mime)) {
      mediaType = 'audio';
    } else {
      await Matrix.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply('❌ Reply to a *Video, Image, or Audio* to repost.');
    }

    // Validate media key
    const mediaMsg =
      quoted.message?.videoMessage ||
      quoted.message?.imageMessage ||
      quoted.message?.audioMessage;

    if (!mediaMsg || !mediaMsg.mediaKey) {
      await Matrix.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return reply('❌ The media you replied to is not available, has expired, or is not supported. Please reply to a recent image, video, or audio.');
    }

    try {
      await Matrix.sendMessage(m.chat, {
        react: { text: '⌛', key: m.key }
      });

      const mediaFile = await Matrix.downloadAndSaveMediaMessage(quoted);

      const messageOptions = {
        caption: text || ''
      };
      messageOptions[mediaType] = { url: mediaFile };

      const userStatusJid = m.sender.replace(/@.+$/, '@s.whatsapp.net');

      await Matrix.sendMessage(userStatusJid, messageOptions);

      await Matrix.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      });

      reply('✅ *Media successfully reposted to your status!*');
    } catch (error) {
      console.error('Error in repost command:', error);
      await Matrix.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      reply('❌ Failed to repost the media.');
    }
  }
}, 
{
    command: ['runtime', 'uptime'],
    operate: async ({ Matrix, m, reply }) => {
      const botUptime = runtime(process.uptime());
      reply(`*⏰ ${botUptime}*`);
    }
}, {
  command: ["donate"],
  tags: ["info"],
  help: ["support"],
  operate: async ({ Matrix, m, reply }) => {
    await Matrix.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    });

    const userName = m.pushName || "there";
    const userGreeting = `Hello Sweety👋 *${userName}*,\nNo matter how much you send, it is very valuable to Your *👸QUEEN🌹*`;

    const supportMessage = 
`╭━━━〔 *Support & Donations* 〕
┃ 💸 *Want to support us?*
┃ If you wish to donate...❤🧡💛
┃ ━━━━━━━━━━━━━━━━━━━
┃ 🇬🇭 *Owner:* 𝗠𝗔𝗧𝗥𝗜𝗫-𝗫-𝗞𝗜𝗡𝗚
┃ 💰 *MTN-Momo:* 0593734312
┃ 💸 *Voda-Cash:* 0508419007
┃ 🪙 *Binance-ID:* 888747836
┃ 🪀 *WhatsApp:* 233593734312
╰━━━━━━━━━━━━━━━━━━━━⬣

${userGreeting}

❤️ *Thanks for buying me coffee ☕* 
💖 *Your generosity keeps us going!* 
🌟 *Every contribution makes a difference!* 
💪 *Your support helps improve and grow this bot!* 👾

💡 *If you have ideas or questions, feel free to reach out!* 💬`;

    await Matrix.sendMessage(m.chat, { text: supportMessage }, { quoted: m });

    setTimeout(async () => {
      await Matrix.sendMessage(m.chat, {
        text: "🚀 *We truly appreciate your support!* Your kindness fuels our passion! 🌍\n\n🎉 Stay tuned for exciting updates coming soon! 📲"
      }, { quoted: m });
    }, 3000);

    setTimeout(async () => {
      await Matrix.sendMessage(m.chat, {
        text: "✨ *You're a star for supporting this project!* 🌟 If you'd like to help even more, share this bot with your friends! 🤗"
      }, { quoted: m });
    }, 6000);

    await Matrix.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    });
  }
}, {
  command: ["website"],
  tags: ["info", "links"],
  help: ["website"],
  operate: async ({ Matrix, m, reply }) => {
    try {
      // Auto-react with ⏳ (hourglass) to indicate loading
      await Matrix.sendMessage(m.chat, {
        react: { text: "⏳", key: m.key }
      });
  
      // Send a "loading" or "hacking" style effect message
      const loadingMessages = [
        "🌐𝙡𝙤𝙖𝙙𝙞𝙣𝙜 𝙬𝙚𝙗𝙨𝙞𝙩𝙚...🚀",
        "⏳𝙁𝙚𝙩𝙘𝙝𝙞𝙣𝙜 𝙙𝙖𝙩𝙖 𝙥𝙖𝙘𝙠𝙚𝙩𝙨...🔮",
        "💠𝘼𝙡𝙢𝙤𝙨𝙩 𝙩𝙝𝙚𝙧𝙚...🌹",
        "⌛⌛𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗰𝗼𝗺𝗽𝗹𝗲𝘁𝗲! 🚀"
      ];

      for (const msg of loadingMessages) {
        await Matrix.sendMessage(m.chat, { text: msg });
        // Wait 1 second between messages for effect
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Prepare the final message
      const username = m.sender.split("@")[0];
      const messageText = `
🎡💡𝗠𝗔𝗧𝗥𝗜𝗫 𝗣𝗢𝗥𝗧𝗔𝗟💡🎡

👋 Hey @${username}!

🔮♻️𝗪𝗵𝗲𝗿𝗲 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝘆 𝗠𝗲𝗲𝘁𝘀 𝗖𝗿𝗲𝗮𝘁𝗶𝘃𝗶𝘁𝘆♻️🔮

📲 *Stay connected* through our official channels for updates, tips, and more.

🚀 *Click below to explore:*

- 🌐 *Official Website* - [Visit Matrix Portal Website](https://matrix-portal-three.vercel.app)

🌹𝙎𝙥𝙤𝙣𝙨𝙤𝙧𝙚𝙙 𝘽𝙮 𝙌𝙪𝙚𝙚𝙣-𝘼𝙙𝙞𝙯𝙖

𝘌𝘯𝘫𝘰𝘺 𝘠𝘰𝘶𝘳 𝘷𝘪𝘴𝘪𝘵! 🚀🎉
      `.trim();

      // Send the final message with mention and external ad reply
      await Matrix.sendMessage(m.chat, {
        text: messageText,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: "Explore Matrix Portal",
            body: "Innovative Internet-connected LED displays and projects!",
            thumbnailUrl: "https://files.catbox.moe/yvbxt9.jpg",
            sourceUrl: "https://matrix-portal-three.vercel.app",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });

      // React with ✅ to indicate success
      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });

    } catch (error) {
      console.error("Error in 'website' command:", error);

      // React with ❌ on error
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });

      reply("*Oops! Something went wrong while fetching the website info.*");
    }
  }
}, {
    command: ['repo', 'sc', 'repository', 'script'],
    operate: async ({ m, Matrix, reply }) => {
      try {
        const { data } = await axios.get('https://api.github.com/repos/Matrix1999/Queen-Adiza');
        const repoInfo = `
        *🔹 BOT REPOSITORY 🔹*
        
🔸 *Name:* ${data.name}
🔸 *Stars:* ${data.stargazers_count}
🔸 *Forks:* ${data.forks_count}
🔸 *GitHub Link:* 
https://api.github.com/repos/Matrix1999/Queen-Adiza

@${m.sender.split("@")[0]}👋, Don't forget to star and fork my repository!`;

        Matrix.sendMessage(m.chat, {
          text: repoInfo.trim(),
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: "Queen Adiza Repository",
              thumbnail: botImage,
              mediaType: 1
            }
          }
        }, { quoted: m });
      } catch (error) {
        reply('❌ *Error fetching repository details.*');
      }
    }
}, {
    command: ['time', 'date'],
    operate: async ({ m, reply }) => {
        // Ensure global.timezones is defined and valid
        const timezone = global.timezones || "UTC"; // Fallback to UTC if not defined

        let now;
        try {
            now = moment().tz(timezone);
            if (!now.isValid()) { // Check if the moment object is valid
                throw new Error("Invalid timezone configured.");
            }
        } catch (error) {
            console.error(`Error with timezone "${timezone}":`, error.message);
            now = moment(); // Fallback to local time if timezone is invalid
            reply(`⚠️ *Warning:* Configured timezone "${timezone}" is invalid. Displaying local time.\n\n` +
                  `*🔹 CURRENT TIME 🔹*\n\n` +
                  `🔸 *Day:* ${now.format('dddd')}\n` +
                  `🔸 *Time:* ${now.format('HH:mm:ss')}\n` +
                  `🔸 *Date:* ${now.format('LL')}\n` +
                  `🔸 *Timezone:* ${now.tz() || "Local Time"}`); // Display actual timezone if available or "Local Time"
            return; // Exit here as the error has been handled
        }

        const timeInfo = `
        *🔹 CURRENT TIME 🔹*

🔸 *Day:* ${now.format('dddd')}
🔸 *Time:* ${now.format('HH:mm:ss')}
🔸 *Date:* ${now.format('LL')}
🔸 *Timezone:* ${timezone}
`;

        reply(timeInfo.trim());
    }
}

];