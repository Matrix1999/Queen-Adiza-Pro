const fetch = require('node-fetch'); 
const googleTTS = require("google-tts-api"); 
const fs = require("fs");
const axios = require('axios');
const { exec } = require('child_process');
const { getRandom } = require('../../lib/myfunc');
const { addReminder } = require("../../lib/remindme.js");
const { parseTime } = require("../../lib/timeparser.js");
const { audioCut } = require('../../lib/audio'); 
const path = require('path');
const { addExif } = require('../../lib/exif'); 
const { styletext } = require('../../lib/scraper'); 
const { handleMediaUpload } = require('../../lib/catbox');
const { getDevice } = require('@whiskeysockets/baileys'); 




module.exports = [
 {
  command: ['browse'],
  operate: async ({ m, text, Matrix, reply }) => {
    if (!text) return reply("Enter URL");

    try {
      let res = await fetch(text);

      if (res.headers.get('Content-Type').includes('application/json')) {
        let json = await res.json();
        await Matrix.sendMessage(m.chat, { text: JSON.stringify(json, null, 2) }, { quoted: m });
      } else {
        let resText = await res.text();
        await Matrix.sendMessage(m.chat, { text: resText }, { quoted: m });
      }

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    } catch (error) {
      reply(`Error fetching URL: ${error.message}`);
    }
  }
}, {
  command: ['fliptext'],
  operate: async ({ m, args, prefix, command, reply }) => {
    if (args.length < 1) return reply(`*Example:\n${prefix}fliptext Matrix*`);
    
    let quere = args.join(" ");
    let flipe = quere.split("").reverse().join("");
    
    reply(`Normal:\n${quere}\nFlip:\n${flipe}`);
  }
}, {
  command: ['genpass', 'genpassword'],
  operate: async ({ Matrix, m, reply, text }) => {
    let length = text ? parseInt(text) : 12;
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    try {
      Matrix.sendMessage(m.chat, { text: pass }, { quoted: m });
    } catch (error) {
      console.error('Error generating password:', error);
      reply('An error occurred while generating the password.');
    }
  }
}, {
  command: ['device', 'getdevice'],
  operate: async ({ Matrix, m, reply }) => {
    if (!m.quoted) {
      return reply('*Please quote a message to use this command!*');
    }
    
    console.log('Quoted Message:', m.quoted);
console.log('Quoted Key:', m.quoted?.key);

    try {
      const quotedMsg = await m.getQuotedMessage();

      if (!quotedMsg) {
        return reply('*Could not detect, please try with newly sent message!*');
      }

      const messageId = quotedMsg.key.id;

      const device = getDevice(messageId) || 'Unknown';

      reply(`The message is sent from *${device}* device.`);
    } catch (err) {
      console.error('Error determining device:', err);
      reply('Error determining device: ' + err.message);
    }
  }
}, {
  command: ["obfuscate"],
  operate: async ({ Matrix, m, text, reply }) => {
    if (!text) {
      return reply(`*Example:* obfuscate console.log('Hello, world!');`);
    }
    try {
      // React with lock emoji to indicate processing
      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🔒",
          key: m.key
        }
      });

      // Use axios to call obfuscation API
      const axios = require("axios");
      const apiUrl = "https://api.nexoracle.com/misc/obfuscate?apikey=63b406007be3e32b53&code=" + encodeURIComponent(text);

      const response = await axios.get(apiUrl);

      if (response.data && response.data.result) {
        const obfuscatedCode = response.data.result;
        const message = `🔐 *Obfuscated Code:* \n\n\`\`\`javascript\n${obfuscatedCode}\n\`\`\``;
        reply(message);
      } else {
        console.error("Obfuscation failed. API response:", response.data);
        reply("*An error occurred while obfuscating the code. Please try again later.*");
      }
    } catch (error) {
      console.error("Error obfuscating code:", error);
      reply("*An error occurred while obfuscating the code. Please try again later.*");
    }
  }
}, {
  command: ['qrcode'],
  operate: async ({ Matrix, m, reply, text }) => {
    if (!text) return reply("Enter text or URL");

    try {
      let res = await fetch(`https://api.qrserver.com/v1/create-qr-code/?data=${text}&size=200x200`);
      let qrCodeUrl = res.url;

      await Matrix.sendMessage(m.chat, { image: { url: qrCodeUrl } }, { quoted: m });
    } catch (error) {
      console.error('Error generating QR code:', error);
      reply('An error occurred while generating the QR code.');
    }
  }
}, {
  command: ['qrcode2'],
  operate: async ({ m, text, Matrix, reply, getRandom }) => {
    if (!text) return reply("*Please include link or text!*");

    try {
      let qyuer = await qrcode.toDataURL(text, { scale: 35 });
      let data = Buffer.from(qyuer.replace("data:image/png;base64,", ""), "base64");
      let buff = getRandom(".jpg");

      await fs.writeFileSync("./" + buff, data);
      let medi = fs.readFileSync("./" + buff);

      await Matrix.sendMessage(
        m.chat,
        { image: medi, caption: global.wm },
        { quoted: m }
      );

      setTimeout(() => {
        fs.unlinkSync("./" + buff);
      }, 10000);
    } catch (error) {
      console.error(error);
      reply('*An error occurred while generating the QR code.*');
    }
  }
}, {
  command: ['jid'],
  tags: ['tools'],
  help: ['jid'],
  operate: async ({ m, isGroup, reply, command, prefix }) => {
    let jid;

    if (isGroup) {
      if (m.quoted) {
        jid = m.quoted.sender;
      } else if (m.mentionedJid && m.mentionedJid.length) {
        jid = m.mentionedJid[0];
      } else {
        return reply(`*Please quote or mention someone to get their JID!*\n\n*EG:* ${prefix}${command} @username`);
      }
    } else {
      jid = m.chat;
    }

    reply(`*JID:* ${jid}`);
  }
}, {
  command: ['say', 'tts'],
  operate: async ({ m, args, reply, Matrix }) => {
    let text = args.join(" ");
    if (!text) return reply("*Text needed!*");

    try {
      const ttsData = await googleTTS.getAllAudioBase64(text, {
        lang: "en",
        slow: false,
        host: "https://translate.google.com",
        timeout: 10000,
      });

      if (!ttsData.length) return reply("*Failed to generate TTS audio.*");

      const tempFiles = [];
      for (let i = 0; i < ttsData.length; i++) {
        let filePath = `/tmp/tts_part${i}.mp3`;
        fs.writeFileSync(filePath, Buffer.from(ttsData[i].base64, "base64"));
        tempFiles.push(filePath);
      }

      
      let mergedFile = "/tmp/tts_merged.mp3";
      let ffmpegCommand = `ffmpeg -i "concat:${tempFiles.join('|')}" -acodec copy ${mergedFile}`;
      exec(ffmpegCommand, async (err) => {
        if (err) {
          console.error("FFmpeg error:", err);
          return reply("*Error merging audio files.*");
        }

        await Matrix.sendMessage(
          m.chat,
          {
            audio: fs.readFileSync(mergedFile),
            mimetype: "audio/mp4",
            ptt: true,
            fileName: "tts_audio.mp3",
          },
          { quoted: m }
        );

        tempFiles.forEach(file => fs.unlinkSync(file));
        fs.unlinkSync(mergedFile);
      });
    } catch (error) {
      console.error("Error in TTS Command:", error);
      reply("*An error occurred while processing the TTS request.*");
    }
  }
}, {
  command: ["speak"], // Changed command name for clarity
  operate: async ({ m, text, reply, prefix, command, Matrix }) => {
    const apiKey = "MatrixZatKing";
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs voice ID

    if (!text) {
      return reply(`*Usage: ${prefix}${command} [text]*`);
    }

    const textToSpeak = encodeURIComponent(text.trim());
    const apiUrl = `https://api.nexoracle.com/tts/elevenlabs?apikey=${apiKey}&id=${voiceId}&text=${textToSpeak}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unable to parse error response" }));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        return reply(`API request failed with status ${response.status}: ${errorMessage}`);
      }

      const data = await response.json();

      if (data.status === 200 && data.result) {
        const audioUrl = data.result;
        const audioBuffer = await fetch(audioUrl).then(res => res.buffer()); //Download the audio

        await Matrix.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: m }); //Send audio message
      } else {
        reply(`API error: ${data.status} - ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error generating TTS audio:", error);
      reply("An error occurred while generating the TTS audio.");
    }
  }
}, {
  command: ["virustotal", "vt"],
  tags: ["tools"],
  help: ["virustotal [url]"],
  operate: async ({ m, reply, args, Matrix }) => {
    // --- Premium Check for VirusTotal ---
    const userId = m.sender;
    const serviceName = 'virustotal'; // Define a service name for this command

    premiumManager.registerService(serviceName); // Register the service

    if (!premiumManager.isPremium(userId, serviceName)) {
      if (Matrix && Matrix.sendMessage) {
        await Matrix.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      } else if (m?.react) {
        await m.react("🚫");
      }
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }
    // --- End Premium Check ---

    const url = args[0];
    if (!url) {
      return reply(`⏳ Usage: virustotal [url]\nExample: virustotal https://example.com\n\n*🚀🌹𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗤𝗨𝗘𝗘𝗡-𝗔𝗗𝗜𝗭𝗔🌹🚀*`);
    }

    const apiKey = "89a4067f5e3053161115c9017225aac756fb25cf1528ba6d8e7ae968143ed6ce"; // Your VirusTotal API key

    try {
      await Matrix.sendMessage(m.chat, {
        react: { text: "⏳", key: m.key }
      });

      await fetch("https://www.virustotal.com/vtapi/v2/url/scan", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `apikey=${apiKey}&url=${encodeURIComponent(url)}`
      });

      const maxAttempts = 5;
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      let data, attempt = 0;

      while (attempt < maxAttempts) {
        await delay(4000);
        const res = await fetch(`https://www.virustotal.com/vtapi/v2/url/report?apikey=${apiKey}&resource=${encodeURIComponent(url)}`);
        data = await res.json();

        if (data.response_code === 1 && data.positives !== undefined) break;
        attempt++;
      }

      if (!data || data.response_code !== 1) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "❌", key: m.key }
        });
        return reply("❌ Scan result not ready or failed to retrieve.\n\n*🔮🌹𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗕𝘆 𝗤𝘂𝗲𝗲𝗻-𝗔𝗱𝗶𝘇𝗮🔮🌹*");
      }

      const positives = data.positives ?? 0;
      const total = data.total ?? "N/A";

      const statusText = positives > 0
        ? `⚠️ *DANGEROUS* (${positives}/${total} scanners detected threats)`
        : `✅ *SAFE* (${positives}/${total} threats detected)`;

      let threatDetails = "";
      if (positives > 0 && data.scans) {
        const detected = Object.entries(data.scans)
          .filter(([_, res]) => res.detected && res.result)
          .map(([engine, res]) => `• ${engine}: ${res.result}`);
        if (detected.length) {
          threatDetails = `\n\n*Detected Threats:*\n${detected.join("\n")}`;
        }
      }

      await Matrix.sendMessage(m.chat, {
        react: { text: positives > 0 ? "⚠️" : "✅", key: m.key }
      });

      reply(
        `🚀 *VirusTotal Scan*\n\n` +
        `*URL:* ${url}\n` +
        `*Status:* ${statusText}${threatDetails}\n\n` +
        `*🔮🌹𝗤𝘂𝗲𝗲𝗻-𝗔𝗱𝗶𝘇𝗮-𝗕𝗼𝘁🌹🔮*`
      );

    } catch (err) {
      console.error(err);
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      reply("❌ Scan failed. Please try again later.\n\n*🔮🌹𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗕𝘆 𝗤𝘂𝗲𝗲𝗻-𝗔𝗱𝗶𝘇𝗮🌹🔮*");
    }
  }
}, {
  command: ["removebg", "rmbg"],
  tags: ["tools"],
  help: ["removebg"],
  operate: async ({ Matrix, m, reply }) => {
    try {
      const q = m.quoted ? m.quoted : m;
      const mime = (q.msg || q).mimetype || '';

      if (!mime.startsWith("image/") || !/\/(jpe?g|png)/.test(mime)) {
        return reply("❌ Please reply to a valid image (jpg, webp, jpeg, png).");
      }

      await Matrix.sendMessage(m.chat, {
        react: { text: "⏳", key: m.key }
      });

      const img = await Matrix.downloadMediaMessage(q);
      const formData = new FormData();
      formData.append("size", "auto");
      formData.append("image_file", img, "image.jpg");

      const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": "Zp1HW5vtCXNDZe6XLBheY4xP", // Your API key
        },
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(response.data, "binary");
      await Matrix.sendMessage(m.chat, {
        image: buffer,
        caption: "✅ *Background removed successfully!🚀*",
      }, { quoted: m });

      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });

    } catch (err) {
      console.error(err);
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      reply("❌ Failed to remove background. Make sure your image is valid and try again.");
    }
  }
}, {
  command: ["walink"],
  tags: ["tools"],
  help: ["walink"],
  operate: async ({ Matrix, m, text, reply, command, prefix }) => {
    await Matrix.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    });

    let waLin = '';
    if (text) {
      waLin = text.replace(/[^0-9]/g, '');
    } else if (m.quoted) {
      waLin = m.quoted.sender.replace(/[^0-9]/g, '');
    } else if (m.mentionedJid && m.mentionedJid[0]) {
      waLin = m.mentionedJid[0].replace(/[^0-9]/g, '');
    } else {
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      return reply(
        `*Please provide a number, quote a user, or mention someone!*\n\n` +
        `*Examples:*\n` +
        `- ${prefix + command} 2349012345678\n` +
        `- Reply to a user's message with: ${prefix + command}\n` +
        `- Mention a user like: ${prefix + command} @someone`
      );
    }

    const waLink = `https://wa.me/${waLin}`;
    const message = `*WhatsApp Link:*\n${waLink}`;

    await Matrix.sendMessage(m.chat, {
      text: message,
      quoted: m,
      contextInfo: {
        mentionedJid: [m.sender],
      },
    });

    await Matrix.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    });
  }
}, {
  command: ["channelinfo"],
  tags: ["tools"],
  help: ["wastalk"],
  operate: async ({ Matrix, m, text, reply, command, prefix }) => {
    // React with a loading emoji to indicate the fetching process
    await Matrix.sendMessage(m.chat, {
      react: { text: "🪀", key: m.key }
    });

    // Extract URL from text, quoted message, or mentioned user
    let url = text || (m.quoted ? m.quoted.text : "").trim();

    if (!url || !url.includes("whatsapp.com/channel/")) {
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      return reply(
        `*Please provide a valid WhatsApp Channel URL.*\n\n` +
        `*Example:* ${prefix + command} https://whatsapp.com/channel/0029Vb5JJ438kyyGlFHTyZ0n`
      );
    }

    try {
      // Fetch channel info from external API
      const res = await axios.get(`https://apis-keith.vercel.app/stalker/wachannel?url=${encodeURIComponent(url)}`);
      const data = res.data;

      // If no valid data is returned
      if (!data.status) {
        return reply("❌ Failed to fetch channel data. Please try again later.");
      }

      const result = data.result;

      // Construct the caption with channel details
      const caption = `🔍 *WhatsApp Channel Info*\n\n` +
                      `*📛 Title:* ${result.title}\n` +
                      `*🧑‍🤝‍🧑 Followers:* ${result.followers}\n\n` +
                      `*📝 Description:*\n${result.description}`;

      // Send the channel info message
      await Matrix.sendMessage(m.chat, {
        image: { url: result.img },
        caption,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: m });

      // React with a checkmark to indicate success
      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });
    } catch (err) {
      console.error("WAStalk Error:", err);
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      reply("❌ Something went wrong while fetching the channel info. Please try again later.");
    }
  }
}, {
  command: ["nglsend"],
  tags: ["tools"],
  help: ["nglsend <ngl-link>|<message>"],
  operate: async ({
    Matrix: _0x60dc07,
    m: _0x409431,
    reply: _0x11daec,
    text: _0x282cf1
  }) => {
    if (!_0x282cf1) {
      return _0x11daec("Please provide your NGL link and a message!\nExample: *.nglsend https://ngl.link/yourusername|Hello there!*");
    }

    try {
      const [_0x49e064, _0x59948a] = _0x282cf1.split("|").map(_0x44e557 => _0x44e557.trim());

      if (!_0x49e064 || !_0x59948a) {
        return _0x11daec("Invalid format! Please use the format:\n*.nglsend https://ngl.link/yourusername|Your message*");
      }

      const _0x3e55ed = `https://api.siputzx.my.id/api/tools/ngl?link=${encodeURIComponent(_0x49e064)}&text=${encodeURIComponent(_0x59948a)}`;
      const _0x36cb8e = await fetch(_0x3e55ed);
      if (!_0x36cb8e.ok) {
        throw new Error("API request failed with status " + _0x36cb8e.status);
      }

      const _0x56d785 = await _0x36cb8e.json();
      if (_0x56d785.status === true) {
        _0x11daec("✅ Successfully sent the message to NGL!\n\n*Message Sent:* " + _0x59948a);
      } else {
        _0x11daec("❌ Failed to send the message to NGL. Please try again later.");
      }

    } catch (_0xc86c4c) {
      console.error("Error sending NGL message:", _0xc86c4c);
      _0x11daec("An error occurred while sending your NGL message. Please try again later.");
    }
  }
}, {
  command: ["remindme", "remind"],
  operate: async ({
    Matrix: _0x3fbb3e,
    m: _0x52a939,
    reply: _0x1bde34,
    text: _0x30c487
  }) => {
    await _0x3fbb3e.sendMessage(_0x52a939.chat, {
      react: {
        text: "⏰",
        key: _0x52a939.key
      }
    });

    if (!_0x30c487) {
      await _0x3fbb3e.sendMessage(_0x52a939.chat, {
        react: {
          text: "❌",
          key: _0x52a939.key
        }
      });

      return _0x1bde34(
        `⚠️ *Examples:*\n\n` +
        `• \`remindme 10m Take a break!\`\n` +
        `• \`remindme 2h Check the oven\`\n` +
        `• \`remindme 1d Submit assignment\`\n` +
        `• \`remindme 30d Join meeting\`\n\n` +
        `Supported formats: \`m\`, \`h\`, \`d\``
      );
    }

    const _0x17ab72 = _0x30c487.trim().split(" ");
    const _0x5dfb95 = _0x17ab72.shift();
    const _0x2b2ef1 = _0x17ab72.join(" ").trim();

    const _0x56cc5d = parseTime(_0x5dfb95);
    if (!_0x56cc5d) {
      return _0x1bde34("❌ *Invalid time format.* Use `10m`, `2h`, `1d`, or 30d vacation`.");
    }

    if (!_0x2b2ef1) return _0x1bde34("⏳ *What should I remind you about?*");

    addReminder(
      _0x52a939.chat,
      _0x2b2ef1,
      _0x56cc5d,
      (r) => _0x3fbb3e.sendMessage(r.chat, { text: `⏰ Reminder:\n${r.message}` })
    );

    const _0x37fc9c = new Date(_0x56cc5d).toLocaleString("en-GB", {
      timeZone: "Africa/Lagos", // adjust to your user base
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    const _0xeta = (() => {
      const ms = _0x56cc5d - Date.now();
      const s = Math.floor((ms / 1000) % 60);
      const m = Math.floor((ms / (1000 * 60)) % 60);
      const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
      const d = Math.floor(ms / (1000 * 60 * 60 * 24));
      return `${d ? `${d}d ` : ""}${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s ? `${s}s` : ""}`.trim();
    })();

    _0x1bde34(`✅ Reminder set for:\n⏰ *${_0x37fc9c}*\n⏳ In: *${_0xeta}*\n📌 *${_0x2b2ef1}*`);
  }
}, {
  command: ["calc"],
  operate: async ({
    Matrix: _0x56a354, // Assuming 'Matrix' is your messaging object
    m,
    text,
    reply,
    prefix,
    command
  }) => {
    // React with a calculator emoji when the command is received
    await _0x56a354.sendMessage(m.chat, {
      react: {
        text: "🧮",
        key: m.key
      }
    });

    if (!text) {
      await _0x56a354.sendMessage(m.chat, {
        react: {
          text: "❓",
          key: m.key
        }
      });
      return reply(`*Usage: ${prefix}${command} [your calculation]*`);
    }
    try {
      const expression = text.trim(); // Remove extra whitespace
      const apiUrl = `https://apis.davidcyriltech.my.id/tools/calculate?expr=${encodeURIComponent(expression)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        await _0x56a354.sendMessage(m.chat, {
          react: {
            text: "⚠️",
            key: m.key
          }
        });
        const errorData = await response.json().catch(() => ({ message: "Unable to parse error response" }));
        return reply(`API request failed with status ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        await _0x56a354.sendMessage(m.chat, {
          react: {
            text: "✅",
            key: m.key
          }
        });
        reply(`Result of ${data.expression}: ${data.result}`);
      } else {
        await _0x56a354.sendMessage(m.chat, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        reply(data.message || "API request failed.");
      }
    } catch (error) {
      console.error("Error calculating:", error);
      await _0x56a354.sendMessage(m.chat, {
        react: {
          text: "🚫",
          key: m.key
        }
      });
      reply("An error occurred while performing the calculation.");
    }
  }
}, {
  command: ["base64encoder", "encode"],
  operate: async ({ m, text, reply, prefix, command }) => {
    if (!text) {
      return reply(`*Usage: ${prefix}${command} [text to encode]*`);
    }

    try {
      const textToEncode = text.trim();
      const apiUrl = `https://api.siputzx.my.id/api/tools/text2base64?text=${encodeURIComponent(textToEncode)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unable to parse error response" }));
        return reply(`API request failed with status ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      if (data.status) {
        reply(`Base64 encoded text: \`${data.data.base64}\``);
      } else {
        reply(data.message || "API request failed.");
      }
    } catch (error) {
      console.error("Error encoding text:", error);
      reply("An error occurred while encoding the text.");
    }
  }
}, {
  command: ["base64decoder", "decode"],
  operate: async ({ m, text, reply, prefix, command }) => {
    if (!text) {
      return reply(`*Usage: ${prefix}${command} [base64 text to decode]*`);
    }

    const apiKey = "08da4ef3bedbb2a90a"; // Your API key
    const apiUrl = `https://api.nexoracle.com/converter/decode-base64?apikey=${apiKey}&text=${encodeURIComponent(text.trim())}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unable to parse error response" }));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        return reply(`API request failed with status ${response.status}: ${errorMessage}`);
      }

      const data = await response.json();

      if (data.status === 200) {
        if (data.result && data.result.text) {
          reply(`Decoded text: \`${data.result.text}\``);
        } else {
          reply("*API returned a successful status but no decoded text.*");
        }
      } else {
        reply(`API error: ${data.status} - ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error decoding Base64:", error);
      reply("An error occurred while decoding the Base64 text.");
    }
  }
}, {
  command: ["iplookup", "ip"],
  tags: ["tools"],
  help: ["iplookup [IP address]"],
  operate: async ({ m, reply, args, Matrix }) => {
    const ip = args[0];
    if (!ip) {
      return reply(`🌐 Usage: iplookup [IP address]\nExample: iplookup 102.176.94.246\n\n*🌹Powered By Adiza🌹*`);
    }

    try {
      await Matrix.sendMessage(m.chat, {
        react: { text: "⏳", key: m.key }
      });

      const response = await fetch(`https://ipwhois.app/json/${ip}`);
      const data = await response.json();

      if (data.success === false || !data.ip) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "❌", key: m.key }
        });
        return reply("❌ Could not retrieve IP details.\n\n*🌹Powered By Adiza🌹*");
      }

      const safe = (val) => val || "N/A";

      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });

      reply(
        `🌍 *IP Lookup Result*\n\n` +
        `*IP Address:* ${safe(data.ip)}\n` +
        `*Hostname:* ${safe(data.hostname)}\n` +
        `*City:* ${safe(data.city)}, ${safe(data.region)}\n` +
        `*Country:* ${safe(data.country)} (${safe(data.country_code)})\n` +
        `*Continent:* ${safe(data.continent)}\n` +
        `*Coordinates:* ${safe(data.latitude)}, ${safe(data.longitude)}\n` +
        `*Timezone:* ${safe(data.timezone)} (${safe(data.timezone_gmt)})\n` +
        `*Current Time:* ${safe(data.current_time)}\n` +
        `*Currency:* ${safe(data.currency_name)} (${safe(data.currency)})\n` +
        `*Calling Code:* +${safe(data.country_phone)}\n` +
        `*Languages:* ${safe(data.languages)}\n` +
        `*ISP:* ${safe(data.isp)}\n` +
        `*Organization:* ${safe(data.org)}\n` +
        `*Connection Type:* ${safe(data.connection_type)}\n\n` +
        `*🌹Powered By Queen-Adiza🌹*`
      );
    } catch (err) {
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      reply("❌ Lookup failed. Please try again later.\n\n*🌹Powered By Queen-Adiza🌹*");
    }
  }
}, {
  command: ["modapk"],
  operate: async ({ Matrix: David, m, reply, text, command }) => {
    const axios = require('axios');
    const cheerio = require('cheerio');

    async function mods(apk) {
      const url = `https://m.happymod.com/search.html?q=${apk}`;
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const apps = [];

      $('.app-info-list .s-app-block').each((index, element) => {
        const app = {
          creator: '`Matrix King`',
          status: 200,
          title: $(element).find('.info-wrap .nowrap a').text().trim(),
          image: $(element).find('.img img').attr('data-src'),
          downloadUrl: `https://m.happymod.com${$(element).find('.down a').attr('href')}`
        };
        apps.push(app);
        if (apps.length >= 5) return false;
      });

      return apps;
    }

    if (!text) {
      return reply(`Enter Text, *Like This Format*: .${command} minecraft`);
    }

    try {
      const response = await mods(text);
      let result = '';

      response.forEach((app, index) => {
        result += `*${index + 1}*. ${app.title}:\n`;
        result += `∘ Download ${app.downloadUrl}\n\n`;
      });

      await David.sendMessage(m.chat, {
        text: result,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            title: `M O D S  S E A R C H`,
            body: `Looking for Cool and Free Apk Mods!`,
            sourceUrl: 'https://m.happymod.com',
            thumbnailUrl: 'https://imgur.com/a/PD8nT5X',
            mediaType: 2,
            renderLargerThumbnail: true
          }
        }
      });
    } catch (error) {
      console.error("Error fetching mod search results:", error);
      reply("Something went wrong while searching for mods.");
    }
  }
}, {
  command: ["tempmail"],
  operate: async ({
    reply
  }) => {
    try {
      const apiUrl = "https://bk9.fun/tools/tempmail";
      const response = await fetch(apiUrl);

      if (!response.ok) {
        return reply(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.status) {
        const email = data.BK9[0]; // Extract the email address from the response.
        const expiry = data.BK9[2]; // Extract the expiry time

        if(email){
          reply(`Your temporary email address is: ${email}\nIt will expire approximately on: ${expiry}`);
        }else{
          reply("*No email address found in API response*");
        }

      } else {
        reply(data.message || "API request failed.");
      }
    } catch (error) {
      console.error("Error fetching temporary email:", error);
      reply("An error occurred while fetching a temporary email address.");
    }
  }
}, {
  command: ['ssweb', 'screenshot', 'ss'],
  operate: async ({ Matrix, m, reply, args }) => {
    const q = args.join(" ");
    if (!q) return reply(`Please provide a URL to screenshot!`);
    
    const apiURL = `https://api.tioo.eu.org/sshp?url=${q}`;
    
    try {
      await Matrix.sendMessage(m.chat, { image: { url: apiURL } }, { quoted: m });
    } catch (error) {
      console.error('Error generating screenshot:', error);
      reply("An error occurred while generating the image.");
    }
  }
}, {
  command: ['sswebpc'],
  operate: async ({ Matrix, m, reply, args }) => {
    const q = args.join(" ");
    if (!q) return reply(`Please provide a URL to screenshot!`);
    
    const apiURL = `https://api.tioo.eu.org/sspc?url=${q}`;
    
    try {
      await Matrix.sendMessage(m.chat, { image: { url: apiURL } }, { quoted: m });
    } catch (error) {
      console.error('Error generating screenshot:', error);
      reply("An error occurred.");
    }
  }
},
 {
  command: ['sswebtab'],
  operate: async ({ Matrix, m, reply, args }) => {
    const q = args.join(" ");
    if (!q) return reply(`Please provide a URL to screenshot!`);
    
    const apiURL = `https://api.tioo.eu.org/sstab?url=${q}`;
    
    try {
      await Matrix.sendMessage(m.chat, { image: { url: apiURL } }, { quoted: m });
    } catch (error) {
      console.error('Error generating screenshot:', error);
      reply("An error occurred.");
    }
  }
},
 {
  command: ['sticker', 's'],
  operate: async ({ Matrix, m, reply, args, prefix, command }) => {
 
    const quoted = m.quoted || m.msg?.quoted;
    if (!quoted) {
      return reply(`Send or reply to images, videos, or gifs with captions ${prefix + command}`);
    }

    const mime = quoted.mimetype || quoted.msg?.mimetype;
    if (!mime) {
      return reply(`The quoted message does not contain media. Please send or reply to an image, video, or gif.`);
    }

    const swns = args.join(" ");
    const pcknms = swns.split("|")[0];
    const atnms = swns.split("|")[1];

    try {
      if (/image/.test(mime)) {
        const media = await quoted.download();
        await Matrix.sendImageAsSticker(m.chat, media, m, {
          packname: pcknms ? pcknms : global.packname,
          author: atnms ? atnms : global.author,
        });
      }
      else if (/video/.test(mime)) {
        if ((quoted.msg || quoted).seconds > 10) {
          return reply("The video length must be 10 seconds or less. Please try again.");
        }
        const media = await quoted.download();
        await Matrix.sendVideoAsSticker(m.chat, media, m, {
          packname: pcknms ? pcknms : global.packname,
          author: atnms ? atnms : global.author,
        });
      }
    
      else {
        return reply(`Send or reply to images, videos, or gifs with captions ${prefix + command}`);
      }
    } catch (error) {
      console.error('Error processing sticker:', error);
      reply('An error occurred while processing the sticker.');
    }
  }
},
 {
  command: ['fancy', 'styletext'],
  operate: async ({ m, text, Matrix, reply }) => {
    
    if (!text) return reply('*Enter a text!*');
    
    try {
      let anu = await styletext(text);
      let teks = `Styles for ${text}\n\n`;
      
      for (let i of anu) {
        teks += `□ *${i.name}* : ${i.result}\n\n`;
      }
      
      reply(teks);
    } catch (error) {
      console.error(error);
      reply('*An error occurred while fetching fancy text styles.*');
    }
  }
},
 {
  command: ['take', 'wm', 'steal'],
  operate: async ({ Matrix, m, reply, args, pushname }) => {
    if (!m.quoted) return reply('Please reply to a sticker to add watermark or metadata.');

    try {
      let stick = args.join(" ").split("|");
      let packName = stick[0] && stick[0].trim() !== "" ? stick[0] : pushname || global.packname;
      let authorName = stick[1] ? stick[1].trim() : "";
      let mime = m.quoted.mimetype || '';
      if (!/webp/.test(mime)) return reply('Please reply to a sticker.');

      let stickerBuffer = await m.quoted.download();
      if (!stickerBuffer) return reply('Failed to download the sticker. Please try again.');

      let stickerWithExif = await addExif(stickerBuffer, packName, authorName);

      if (stickerWithExif) {
        await Matrix.sendFile(
          m.chat,
          stickerWithExif,
          'sticker.webp',
          '',
          m,
          null,
          { mentions: [m.sender] }
        );
      } else {
        throw new Error('Failed to process the sticker with metadata.');
      }
    } catch (error) {
      console.error('Error in watermark/sticker metadata plugin:', error);
      reply('An error occurred while processing the sticker.');
    }
  }
},
 {
  command: ['tinyurl', 'shortlink'],
  operate: async ({ m, text, prefix, command, reply }) => {
    if (!text) return reply(`*Example: ${prefix + command} https://instagram.com/heyits_matrix*`);
    
    try {
      const response = await axios.get(`https://tinyurl.com/api-create.php?url=${text}`);
      reply(response.data);
    } catch (error) {
      console.error(error);
      reply('*An error occurred while shortening the URL.*');
    }
  }
},
 {
  command: ['toimage', 'toimg'],
  operate: async ({ Matrix, m, reply, args, prefix, command }) => {
    const quoted = m.quoted || m.msg?.quoted;
    const mime = quoted?.mimetype || quoted?.msg?.mimetype;
    if (!quoted || !/webp/.test(mime)) {
      return reply(`*Send or reply to a sticker with the caption ${prefix + command}*`);
    }

    try {
      const media = await quoted.download();
      const inputPath = path.join(__dirname, getRandom('.webp'));
      fs.writeFileSync(inputPath, media);
      const outputPath = path.join(__dirname, getRandom('.png'));
      exec(`ffmpeg -i ${inputPath} ${outputPath}`, (err) => {
        fs.unlinkSync(inputPath); 

        if (err) {
          console.error('Error converting to image:', err);
          return reply('An error occurred while converting the sticker to an image.');
        }
        const buffer = fs.readFileSync(outputPath);
        Matrix.sendMessage(m.chat, { image: buffer }, { quoted: m });    
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error('Error converting to image:', error);
      reply('An error occurred while converting the sticker to an image.');
    }
  }
}, {
  command: ["currency"],
  operate: async ({ m, text, reply, prefix, command }) => {
    //Check for correct input format: amount, from_currency, to_currency
    const parts = text.trim().split(" ");
    if (parts.length !== 3) {
      return reply(`*Usage: ${prefix}${command} [amount] [from_currency] [to_currency]*\nExample: ${prefix}${command} 100 USD GHS`);
    }

    const amount = parseFloat(parts[0]);
    const fromCurrency = parts[1].toUpperCase();
    const toCurrency = parts[2].toUpperCase();

    if (isNaN(amount) || amount <= 0) {
      return reply("Invalid amount. Please enter a positive number.");
    }

    try {
      const apiUrl = `https://apis.davidcyriltech.my.id/tools/convert?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unable to parse error response" }));
        return reply(`API request failed with status ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        reply(`${amount} ${fromCurrency} is equal to ${data.result} ${toCurrency}`);
      } else {
        reply(data.message || "API request failed.");
      }
    } catch (error) {
      console.error("Error converting currency:", error);
      reply("An error occurred while converting the currency.");
    }
  }
}, {
  command: ['tourl', 'url'],
  operate: async ({ m, Matrix, reply }) => {
    const quoted = m.quoted || m.msg?.quoted;
    const mime = quoted?.mimetype || quoted?.msg?.mimetype;

    if (!quoted || !mime) {
      return reply('*Please reply to a media message!*');
    }

    try {
      const mediaUrl = await handleMediaUpload(quoted, Matrix, mime);
      reply(`*Uploaded successfully:*\n${mediaUrl}`);
    } catch (error) {
      console.error(error);
      reply('*An error occurred while uploading the media.*');
    }
  }
}, {
  command: ["teraboxdl", "tbxd"],
  operate: async ({ m, text, reply, prefix, command }) => {
    if (!text) {
      return reply(`*Usage: ${prefix}${command} [Terabox download link]*`);
    }

    try {
      const teraboxLink = text.trim();
      const apiUrl = `https://vapis.my.id/api/terabox?url=${encodeURIComponent(teraboxLink)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unable to parse error response" }));
        const errorMessage = `API request failed with status ${response.status}: ${errorData.message || response.statusText}`;
        return reply(errorMessage);
      }

      const data = await response.json();

      if (data.status && data.data && data.data.length > 0) {
        const file = data.data[0]; // Assuming only one file is returned
        reply(`Filename: ${file.filename}\nSize: ${file.size} bytes\nDownload URL: ${file.downloadUrl}`);
      } else {
        reply(data.message || "API request failed.  No download URL found.");
      }
    } catch (error) {
      console.error("Error getting Terabox download link:", error);
      reply("An error occurred while processing the Terabox link.");
    }
  }
}, {
  command: ["checktime"],
  operate: async ({ Matrix, m, reply, text, prefix, command }) => {
    // React with loading emoji first
    await Matrix.sendMessage(m.chat, {
      react: {
        text: "⏳",
        key: m.key
      }
    });

    if (!text) {
      await Matrix.sendMessage(m.chat, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      return reply(`*Usage:* ${prefix}${command} [country or city name]\n\nExample: ${prefix}${command} India`);
    }

    const timezones = {
      ghana: "Africa/Accra",
      india: "Asia/Kolkata",
      nigeria: "Africa/Lagos",
      usa: "America/New_York",
      uk: "Europe/London",
      canada: "America/Toronto",
      australia: "Australia/Sydney",
      japan: "Asia/Tokyo",
      germany: "Europe/Berlin",
      france: "Europe/Paris",
      china: "Asia/Shanghai",
      russia: "Europe/Moscow",
      brazil: "America/Sao_Paulo",
      kenya: "Africa/Nairobi",
      southafrica: "Africa/Johannesburg"
    };

    try {
      const input = text.trim().toLowerCase().replace(/\s+/g, '');
      const zone = timezones[input] || text.trim();
      const query = encodeURIComponent(zone);
      const apiUrl = `https://timeapi.io/api/Time/current/zone?timeZone=${query}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        await Matrix.sendMessage(m.chat, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply(`Failed to fetch time for *${text}*.`);
      }

      const data = await response.json();

      if (!data || !data.dateTime) {
        await Matrix.sendMessage(m.chat, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return reply(`Time data not found for "*${text}*".`);
      }

      const time = new Date(data.dateTime);
      const formattedTime = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const formattedDate = time.toDateString();

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "✅",
          key: m.key
        }
      });

      reply(`Current time in *${text}*:\n*${formattedTime}* (${formattedDate})`);
    } catch (error) {
      console.error("Time fetch error:", error);
      await Matrix.sendMessage(m.chat, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      reply("An error occurred while fetching the time.");
    }
  }
}, {
  command: ['shazam'],
  operate: async ({ m, reply, Matrix }) => {
    const quoted = m.quoted || m.msg?.quoted;
    if (!quoted) return reply("*Please reply to an audio or video message to identify the song.*");

    const mimetype = quoted.mimetype || quoted.msg?.mimetype || '';
    if (!mimetype.includes('audio') && !mimetype.includes('video')) {
      return reply("*Please reply to a valid audio or video message.*");
    }

    try {
      // Download and save media file to disk
      const filePath = await Matrix.downloadAndSaveMediaMessage(quoted, 'shazam');

      // Trim first 15 seconds of audio
      const trimmedAudioBuffer = await audioCut(filePath, 0, 15);

      if (!trimmedAudioBuffer || trimmedAudioBuffer.length === 0) {
        return reply("❌ Failed to process trimmed audio.");
      }

      // Convert trimmed audio buffer to base64
      const audioBase64 = trimmedAudioBuffer.toString('base64');

      console.log(`Trimmed audio base64 length: ${audioBase64.length}`);

      // Call your Cloudflare Worker Shazam proxy API
      const response = await fetch('https://adiza-shazam-recognition.matrixzat99.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64 })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        return reply(`❌ API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log('ACRCloud response:', JSON.stringify(data, null, 2));

      // --- FIX: Check both music and humming ---
      let song = null;
      if (data.metadata) {
        if (Array.isArray(data.metadata.music) && data.metadata.music.length > 0) {
          song = data.metadata.music[0];
        } else if (Array.isArray(data.metadata.humming) && data.metadata.humming.length > 0) {
          song = data.metadata.humming[0];
        }
      }

      if (!song) {
        return reply("❌ No song recognized. Try with a clearer or longer audio clip.");
      }

      const title = song.title || 'Unknown';
      const artists = song.artists?.map(a => a.name).join(', ') || 'Unknown';
      const album = song.album?.name || 'Unknown';
      const releaseDate = song.release_date || 'Unknown';
      const youtubeUrl = song.external_metadata?.youtube?.vid ? `https://youtu.be/${song.external_metadata.youtube.vid}` : null;

      let replyText = `🎵 *Song Recognized!*\n\n*Title:* ${title}\n*Artist(s):* ${artists}\n*Album:* ${album}\n*Release Date:* ${releaseDate}`;
      if (youtubeUrl) replyText += `\n*YouTube:* ${youtubeUrl}`;

      await reply(replyText);

    } catch (error) {
      console.error('Error in shazam command:', error);
      reply("❌ An error occurred while processing the song recognition.");
    }
  }
}, {
  command: ["translate", "tr"],
  operate: async ({ m, text, reply, prefix, command }) => {
    if (!text) {
      return reply(`*Usage: ${prefix}${command} [language code] [text to translate]*`);
    }

    const args = text.trim().split(" ");
    if (args.length < 2) {
      return reply(`*Usage: ${prefix}${command} [language code] [text to translate]*`);
    }

    const targetLanguage = args[0].toLowerCase();
    const textToTranslate = args.slice(1).join(" ");

    try {
      const apiUrl = `https://api.popcat.xyz/translate?to=${targetLanguage}&text=${encodeURIComponent(textToTranslate)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unable to parse error response" }));
        const errorMessage = `API request failed with status ${response.status}: ${errorData.message || response.statusText}`;
        return reply(errorMessage);
      }

      const data = await response.json();

      if (data.translated) {
        reply(`Translation to ${targetLanguage}: ${data.translated}`);
      } else {
        reply(data.message || "API request failed. No translation found.");
      }
    } catch (error) {
      console.error("Error during translation:", error);
      reply("An error occurred during the translation process.");
    }
  }
}, {
  command: ["list"],
  operate: async ({
    m,
    Matrix,
    reply
  }) => {
    const menuText = `🚀⏳🚀
╔═━「 *🔮AI MENU🔮* 」━═╗
- 🌹𝙟𝙖𝙧𝙫𝙞𝙨: Access a virtual AI assistant for general tasks and queries.
- 🌹𝙜𝙚𝙢𝙞𝙣𝙞: Interact with Google’s Gemini AI for advanced chat and content generation.
- 🌹𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙚: Create text, images, or other content using AI.
- 🌹𝙙𝙗𝙧𝙭: Use the DBRX large language model for AI-powered conversations.
- 🌹𝙘𝙝𝙖𝙩𝙜𝙥𝙩: Chat with OpenAI’s ChatGPT for natural language responses.
- 🌹𝙢𝙖𝙩𝙧𝙞𝙭: Engage with an AI model inspired by the Matrix universe or themed interactions.
- 🌹𝙤𝙥𝙚𝙣𝙖𝙞: Access OpenAI’s suite of AI models for various tasks.
- 🌹𝙙𝙚𝙚𝙥𝙨𝙚𝙚𝙠𝙡𝙡𝙢: Use DeepSeek’s large language model for AI-driven answers.
- 🌹𝙙𝙤𝙥𝙥𝙡𝙚𝙖𝙞: Interact with a Dopple AI-powered chatbot.
- 🌹𝙜𝙥𝙩: General access to a GPT-based AI model.
- 🌹𝙜𝙥𝙩2: Use the GPT-2 language model for text generation.
- 🌹𝙞𝙢𝙖𝙜𝙚𝙣: Generate images from text prompts using AI.
- 🌹𝙞𝙢𝙖𝙜𝙞𝙣𝙚: Create visual content or artwork from descriptions.
- 🌹𝙡𝙚𝙩𝙩𝙚𝙧𝙖𝙞: Compose letters or emails automatically using AI.
- 🌹𝙡𝙡𝙖𝙢𝙖: Chat with Meta’s Llama AI language model.
- 🌹𝙢𝙚𝙩𝙖𝙖𝙞: Access Meta’s AI assistant for chat, image generation, and more.
- 🌹𝙢𝙞𝙨𝙩𝙧𝙖𝙡: Use the Mistral AI model for fast, high-quality responses.
- 🌹𝙥𝙝𝙤𝙩𝙤𝙖𝙞: Enhance, edit, or generate photos using AI tools.

╔═━「 *🔮AUDIO MENU🔮* 」━═╗
- 🌹𝙗𝙖𝙨𝙨: Add or boost bass in audio files.
- 🌹𝙗𝙡𝙤𝙬𝙣: Apply a “blown speaker” effect to audio.
- 🌹𝙙𝙚𝙚𝙥: Make audio sound deeper or lower-pitched.
- 🌹𝙚𝙖𝙧𝙧𝙖𝙥𝙚: Intensify audio volume for a distorted effect.
- 🌹𝙧𝙚𝙫𝙚𝙧𝙨𝙚: Play audio backwards.
- 🌹𝙧𝙤𝙗𝙤𝙩: Add a robotic effect to audio.
- 🌹𝙫𝙤𝙡𝙖𝙪𝙙𝙞𝙤: Adjust the volume of audio clips.

╔═━「 (*🔮DOWNLOAD MENU🔮*) 」━═╗
- 🌹𝙖𝙥𝙠: Download Android APK files.
- 🌹𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙: General file download command.
- 🌹𝙛𝙗: Download videos or media from Facebook.
- 🌹𝙜𝙙𝙧𝙞𝙫𝙚: Download files from Google Drive.
- 🌹𝙜𝙞𝙩𝙘𝙡𝙤𝙣𝙚: Clone a GitHub repository.
- 🌹𝙞𝙢𝙖𝙜𝙚: Download images from a given link.
- 🌹𝙞𝙣𝙨𝙩𝙖𝙜𝙧𝙖𝙢: Download media from Instagram.
- 🌹𝙞𝙩𝙪𝙣𝙚𝙨: Download music from iTunes.
- 🌹𝙢𝙚𝙙𝙞𝙖𝙛𝙞𝙧𝙚: Download files from Mediafire.
- 🌹𝙥𝙞𝙣𝙩𝙚𝙧𝙚𝙨𝙩: Download images from Pinterest.
- 🌹𝙥𝙡𝙖𝙮: Play or download music by song name.
- 🌹𝙨𝙤𝙣𝙜: Download a specific song.
- 🌹𝙥𝙡𝙖𝙮𝙙𝙤𝙘: Play or download document files.
- 🌹𝙧𝙞𝙣𝙜𝙩𝙤𝙣𝙚: Download or create ringtones.
- 🌹𝙨𝙖𝙫𝙚𝙨𝙩𝙖𝙩𝙪𝙨: Save WhatsApp status updates.
- 🌹𝙩𝙞𝙠𝙦𝙪𝙤𝙩𝙚: Download TikTok video quotes.
- 🌹𝙩𝙞𝙠𝙩𝙤𝙠: Download TikTok videos.
- 🌹𝙩𝙞𝙠𝙩𝙤𝙠𝙖𝙪𝙙𝙞𝙤: Download audio from TikTok videos.
- 🌹𝙫𝙞𝙙𝙚𝙤: Download videos from various sources.
- 🌹𝙫𝙞𝙙𝙚𝙤𝙙𝙤𝙘: Download video documents.
- 🌹𝙭𝙫𝙞𝙙𝙚𝙤𝙨: Download videos from Xvideos (adult content).
- 🌹𝙮𝙩𝙢𝙥3: Convert and download YouTube videos as MP3.
- 🌹𝙮𝙩𝙢𝙥3𝙙𝙤𝙘: Download YouTube audio as a document.
- 🌹𝙮𝙩𝙢𝙥4: Convert and download YouTube videos as MP4.
- 🌹𝙮𝙩𝙢𝙥4𝙙𝙤𝙘: Download YouTube videos as documents.

╔═━「 (*🔮EPHOTO360 MENU🔮*) 」━═╗
- 🌹1917𝙨𝙩𝙮𝙡𝙚: Apply a 1917 movie-inspired photo effect.
- 🌹𝙖𝙙𝙫𝙖𝙣𝙘𝙚𝙙𝙜𝙡𝙤𝙬: Add advanced glowing effects to text or images.
- 🌹𝙗𝙡𝙖𝙘𝙠𝙥𝙞𝙣𝙠𝙡𝙤𝙜𝙤: Create a logo in Blackpink’s style.
- 🌹𝙗𝙡𝙖𝙘𝙠𝙥𝙞𝙣𝙠𝙨𝙩𝙮𝙡𝙚: Apply Blackpink-themed effects.
- 🌹𝙘𝙖𝙧𝙩𝙤𝙤𝙣𝙨𝙩𝙮𝙡𝙚: Turn photos into cartoon-style images.
- 🌹𝙙𝙚𝙖𝙙𝙥𝙤𝙤𝙡: Add Deadpool-themed effects.
- 🌹𝙙𝙚𝙡𝙚𝙩𝙞𝙣𝙜𝙩𝙚𝙭𝙩: Create an effect of text being deleted.
- 🌹𝙙𝙧𝙖𝙜𝙤𝙣𝙗𝙖𝙡𝙡: Add Dragon Ball anime effects.
- 🌹𝙚𝙛𝙛𝙚𝙘𝙩𝙘𝙡𝙤𝙪𝙙𝙨: Overlay cloud effects on images.
- 🌹𝙛𝙡𝙖𝙜3𝙙𝙩𝙚𝙭𝙩: Make 3D text with a flag design.
- 🌹𝙛𝙡𝙖𝙜𝙩𝙚𝙭𝙩: Add flag-style effects to text.
- 🌹𝙛𝙧𝙚𝙚𝙘𝙧𝙚𝙖𝙩𝙚: Freestyle creation of effects or edits.
- 🌹𝙜𝙖𝙡𝙖𝙭𝙮𝙨𝙩𝙮𝙡𝙚: Apply galaxy-themed effects.
- 🌹𝙜𝙖𝙡𝙖𝙭𝙮𝙬𝙖𝙡𝙡𝙥𝙖𝙥𝙚𝙧: Create galaxy-inspired wallpapers.
- 🌹𝙜𝙡𝙞𝙩𝙘𝙝𝙩𝙚𝙭𝙩: Add glitch effects to text.
- 🌹𝙜𝙡𝙤𝙬𝙞𝙣𝙜𝙩𝙚𝙭𝙩: Make text glow.
- 🌹𝙜𝙧𝙖𝙙𝙞𝙚𝙣𝙩𝙩𝙚𝙭𝙩: Apply gradient coloring to text.
- 🌹𝙜𝙧𝙖𝙛𝙛𝙞𝙩𝙞: Add graffiti-style effects.
- 🌹𝙞𝙣𝙘𝙖𝙣𝙙𝙚𝙨𝙘𝙚𝙣𝙩: Give images an incandescent lighting effect.
- 🌹𝙡𝙞𝙜𝙝𝙩𝙚𝙛𝙛𝙚𝙘𝙩𝙨: Add various light effects.
- 🌹𝙡𝙤𝙜𝙤𝙢𝙖𝙠𝙚𝙧: Create custom logos.
- 🌹𝙡𝙪𝙭𝙪𝙧𝙮𝙜𝙤𝙡𝙙: Apply luxury gold effects.
- 🌹𝙢𝙖𝙠𝙞𝙣𝙜𝙣𝙚𝙤𝙣: Create neon-style effects.
- 🌹𝙢𝙖𝙩𝙧𝙞𝙭: Add Matrix movie-inspired effects.
- 🌹𝙢𝙪𝙡𝙩𝙞𝙘𝙤𝙡𝙤𝙧𝙚𝙙𝙣𝙚𝙤𝙣: Neon effects with multiple colors.
- 🌹𝙣𝙚𝙤𝙣𝙜𝙡𝙞𝙩𝙘𝙝: Combine neon and glitch effects.
- 🌹𝙥𝙖𝙥𝙚𝙧𝙘𝙪𝙩𝙨𝙩𝙮𝙡𝙚: Papercut-style image effects.
- 🌹𝙥𝙞𝙭𝙚𝙡𝙜𝙡𝙞𝙩𝙘𝙝: Pixelated glitch effect.
- 🌹𝙧𝙤𝙮𝙖𝙡𝙩𝙚𝙭𝙩: Royal or regal text effects.
- 🌹𝙨𝙖𝙣𝙙: Add sand effects to images or text.
- 🌹𝙨𝙪𝙢𝙢𝙚𝙧𝙗𝙚𝙖𝙘𝙝: Summer beach-themed effects.
- 🌹𝙩𝙤𝙥𝙤𝙜𝙧𝙖𝙥𝙝𝙮: Topographic map-style effects.
- 🌹𝙩𝙮𝙥𝙤𝙜𝙧𝙖𝙥𝙝𝙮: Artistic text designs.
- 🌹𝙬𝙖𝙩𝙚𝙧𝙘𝙤𝙡𝙤𝙧𝙩𝙚𝙭𝙩: Watercolor-style text effects.
- 🌹𝙬𝙧𝙞𝙩𝙚𝙩𝙚𝙭𝙩: Add custom text to images

╔═━「 (*🔮FUN MENU🔮*) 」━═╗
- 🌹𝙙𝙖𝙧𝙚: Get a random dare.
- 🌹𝙛𝙖𝙘𝙩: Receive a random fact.
- 🌹𝙟𝙤𝙠𝙚𝙨: Get a random joke.
- 🌹𝙢𝙚𝙢𝙚𝙨: View or generate memes.
- 🌹𝙦𝙪𝙤𝙩𝙚𝙨: Get inspirational or famous quotes.
- 🌹𝙦𝙪𝙤𝙩𝙚𝙫𝙤𝙞𝙘𝙚: Listen to a quote as audio.
- 🌹𝙩𝙧𝙞𝙫𝙞𝙖: Answer trivia questions.
- 🌹𝙩𝙧𝙪𝙩𝙝: Get a random truth question.
- 🌹𝙩𝙧𝙪𝙩𝙝𝙙𝙚𝙩𝙚𝙘𝙩𝙤𝙧: Detect if a statement is true or false.
- 🌹𝙭𝙭𝙦𝙘: Play a quick quiz or challenge

╔═━「 (*🔮GROUP MENU🔮*) 」━═╗
- 🌹𝙖𝙙𝙙: Add a user to the group.
- 🌹𝙖𝙣𝙩𝙞𝙗𝙖𝙙𝙬𝙤𝙧𝙙: Block bad words in the group.
- 🌹𝙖𝙣𝙩𝙞𝙗𝙤𝙩: Prevent bots from joining or working in a group.
- 🌹𝙖𝙣𝙩𝙞𝙡𝙞𝙣𝙠: Block group links.
- 🌹𝙖𝙣𝙩𝙞𝙘𝙤𝙣𝙩𝙖𝙘𝙩: Block group contacts.
- 🌹𝙖𝙣𝙩𝙞𝙖𝙪𝙙𝙞𝙤: Block group audios.
- 🌹𝙖𝙣𝙩𝙞𝙞𝙢𝙖𝙜𝙚: Block group images.
- 🌹𝙖𝙣𝙩𝙞𝙢𝙚𝙙𝙞𝙖: Block all media sharing.
- 🌹𝙖𝙣𝙩𝙞𝙫𝙞𝙧𝙩𝙚𝙭: Prevent Virtex (malicious message) spam.
- 🌹𝙖𝙣𝙩𝙞𝙫𝙞𝙧𝙪𝙨: Scan for and block viruses.
- 🌹𝙖𝙣𝙩𝙞𝙫𝙞𝙙𝙚𝙤: Block groups videos.
- 🌹𝙖𝙣𝙩𝙞𝙨𝙩𝙞𝙘𝙠𝙚𝙧: Block sticker sharing.
- 🌹𝙖𝙣𝙩𝙞𝙨𝙥𝙖𝙢: Block spam messages.
- 🌹𝙖𝙣𝙩𝙞𝙨𝙥𝙖𝙢1: Enhanced spam protection.
- 🌹𝙖𝙣𝙩𝙞𝙡𝙞𝙣𝙠𝙜𝙘: Block group chat links.
- 🌹𝙖𝙥𝙥𝙧𝙤𝙫𝙚𝙖𝙡𝙡: Approve all pending requests.
- 🌹𝙘𝙡𝙤𝙨𝙚: Close the group for messaging.
- 🌹𝙘𝙡𝙤𝙨𝙚𝙩𝙞𝙢𝙚: Schedule group closing time.
- 🌹𝙙𝙚𝙡𝙥𝙥𝙜𝙧𝙤𝙪𝙥: Delete group profile picture.
- 🌹𝙙𝙚𝙢𝙤𝙩𝙚: Demote a group admin.
- 🌹𝙙𝙞𝙨𝙖𝙥𝙥𝙧𝙤𝙫𝙚𝙖𝙡𝙡: Disapprove all requests.
- 🌹𝙚𝙙𝙞𝙩𝙨𝙚𝙩𝙩𝙞𝙣𝙜𝙨: Edit group settings.
- 🌹𝙡𝙞𝙣𝙠: Get the group invite link.
- 🌹𝙝𝙞𝙙𝙚𝙩𝙖𝙜: Tag without showing usernames.
- 🌹𝙞𝙣𝙫𝙞𝙩𝙚: Invite users to the group.
- 🌹𝙠𝙞𝙘𝙠: Remove a user from the group.
- 🌹𝙡𝙞𝙨𝙩𝙤𝙣𝙡𝙞𝙣𝙚: List online members.
- 🌹𝙡𝙞𝙨𝙩𝙧𝙚𝙦𝙪𝙚𝙨𝙩𝙨: List pending join requests.
- 🌹𝙢𝙚𝙙𝙞𝙖𝙩𝙖𝙜: Tag users in media.
- 🌹𝙤𝙥𝙚𝙣: Open the group for messaging.
- 🌹𝙤𝙥𝙚𝙣𝙩𝙞𝙢𝙚: Schedule group opening time.
- 🌹𝙥𝙤𝙡𝙡: Create a poll.
- 🌹𝙥𝙧𝙤𝙢𝙤𝙩𝙚: Promote a user to admin.
- 🌹𝙧𝙚𝙨𝙚𝙩𝙡𝙞𝙣𝙠: Reset group invite link.
- 🌹𝙨𝙚𝙩𝙙𝙚𝙨𝙘: Set group description.
- 🌹𝙟𝙤𝙞𝙣𝙡𝙞𝙨𝙩: Show join requests.
- 🌹𝙨𝙚𝙩𝙜𝙧𝙤𝙪𝙥𝙣𝙖𝙢𝙚: Change group name.
- 🌹𝙨𝙚𝙩𝙥𝙥𝙜𝙧𝙤𝙪𝙥: Set group profile picture.
- 🌹𝙩𝙖𝙜𝙖𝙙𝙢𝙞𝙣: Tag all admins.
- 🌹𝙩𝙖𝙜𝙖𝙡𝙡: Tag all members.
- 🌹𝙩𝙤𝙩𝙖𝙡𝙢𝙚𝙢𝙗𝙚𝙧𝙨: Show total group members.
- 🌹𝙪𝙨𝙚𝙧𝙞𝙙: Get a user’s WhatsApp ID.
- 🌹𝙫𝙘𝙛: Share contact in VCF format.

╔═━「 (*🔮HEROKU MENU🔮*) 」━═╗
- 🌹𝙖𝙙𝙙𝙫𝙖𝙧: Add a new environment variable.
- 🌹𝙙𝙚𝙡𝙫𝙖𝙧: Delete an environment variable.
- 🌹𝙜𝙚𝙩𝙫𝙖𝙧: Retrieve an environment variable.
- 🌹𝙨𝙚𝙩𝙗𝙤𝙩𝙣𝙖𝙢𝙚: Set the bot’s display name.
- 🌹𝙨𝙚𝙩𝙣𝙖𝙢𝙚: Change the bot owner’s name.
- 🌹𝙨𝙚𝙩𝙤𝙬𝙣𝙚𝙧𝙣𝙪𝙢𝙗𝙚𝙧: Set the owner’s phone number.
- 🌹𝙨𝙚𝙩𝙫𝙖𝙧: Set or update an environment variable.

╔═━「 (*🔮IMAGE MENU🔮*) 」━═╗
- 🌹𝙧𝙚𝙢𝙞𝙣𝙞: Enhance image quality using AI.
- 🌹𝙬𝙖𝙡𝙡𝙥𝙖𝙥𝙚𝙧: Get or generate wallpapers.
- 🌹𝙬𝙞𝙠𝙞𝙢𝙚𝙙𝙞𝙖: Search and download images from Wikimedia.... 

╔═━「 (*🔮OTHER MENU🔮*) 」━═╗
- 🌹𝙗𝙤𝙩𝙨𝙩𝙖𝙩𝙪𝙨: Check the bot’s current status.
- 🌹𝙥𝙖𝙞𝙧: Pair the bot with another device or service.
- 🌹𝙥𝙞𝙣𝙜: Test bot response time.
- 🌹𝙧𝙪𝙣𝙩𝙞𝙢𝙚: Show how long the bot has been running.
- 🌹𝙧𝙚𝙥𝙤: Get the bot’s source code repository.
- 🌹𝙩𝙞𝙢𝙚: Show the current time.

╔═━「 (*🔮OWNER MENU🔮*) 」━═╗
- 🌹𝙗𝙡𝙤𝙘𝙠: Block a user.
- 🌹𝙙𝙚𝙡𝙚𝙩𝙚: Delete a message or data.
- 🌹𝙙𝙚𝙡𝙟𝙪𝙣𝙠: Remove junk files.
- 🌹𝙙𝙞𝙨𝙠: Show disk usage.
- 🌹𝙫𝙫: get viewonce in the same chat. 
- 🌹𝙫𝙫1: get viewonce in the same chat.
- 🌹𝙫𝙫2: Get viewonce in your dm.
- 🌹𝙜𝙘𝙖𝙙𝙙𝙥𝙧𝙞𝙫𝙖𝙘𝙮: Control group add privacy settings.
- 🌹𝙖𝙡𝙞𝙫𝙚: Show that the bot is running.
- 🌹𝙜𝙚𝙩𝙨𝙚𝙨𝙨𝙞𝙤𝙣: Retrieve bot session.
- 🌹𝙜𝙚𝙩𝙥𝙥: Get profile picture.
- 🌹𝙪𝙥𝙙𝙖𝙩𝙚: Update the bot.
- 🌹𝙪𝙨𝙚𝙧𝙞𝙣𝙛𝙤: Get user information.
- 🌹𝙜𝙧𝙤𝙪𝙥𝙞𝙙: Get group ID.
- 🌹𝙝𝙤𝙨𝙩𝙞𝙥: Show host server IP.
- 🌹𝙥𝙞𝙣𝙘𝙝𝙖𝙩: Pin a chat.
- 🌹𝙪𝙣𝙥𝙞𝙣𝙘𝙝𝙖𝙩: Unpin a chat.
- 🌹𝙡𝙞𝙨𝙩𝙗𝙡𝙤𝙘𝙠: List blocked users.
- 🌹𝙟𝙤𝙞𝙣: Join a group via link.
- 🌹𝙡𝙖𝙨𝙩𝙨𝙚𝙚𝙣: Show last seen status.
- 🌹𝙡𝙚𝙖𝙫𝙚: Leave a group.
- 🌹𝙡𝙞𝙨𝙩𝙗𝙖𝙙𝙬𝙤𝙧𝙙: List blocked words.
- 🌹𝙡𝙞𝙨𝙩𝙞𝙜𝙣𝙤𝙧𝙚𝙡𝙞𝙨𝙩: List ignored users.
- 🌹𝙡𝙞𝙨𝙩𝙨𝙪𝙙𝙤: List sudo users.
- 🌹𝙢𝙤𝙙𝙚𝙨𝙩𝙖𝙩𝙪𝙨: Show bot mode.
- 🌹𝙤𝙣𝙡𝙞𝙣𝙚: Show online status.
- 🌹𝙤𝙬𝙣𝙚𝙧: Show owner information.
- 🌹𝙥𝙥𝙥𝙧𝙞𝙫𝙖𝙘𝙮: Set profile picture privacy.
- 🌹𝙧𝙚𝙖𝙘𝙩: React to a message.
- 🌹𝙧𝙚𝙖𝙙𝙧𝙚𝙘𝙚𝙞𝙥𝙩𝙨: Toggle read receipts.
- 🌹𝙘𝙡𝙚𝙖𝙧𝙘𝙝𝙖𝙩: Clear chat history.
- 🌹𝙧𝙚𝙥𝙤𝙧𝙩𝙗𝙪𝙜: Report a bug.
- 🌹𝙗𝙞𝙤𝙜𝙧𝙖𝙥𝙝𝙮: Set biography.
- 🌹𝙧𝙚𝙦𝙪𝙚𝙨𝙩: Make a request to the owner.
- 🌹𝙧𝙚𝙨𝙩𝙖𝙧𝙩: Restart the bot.
- 🌹𝙨𝙚𝙩𝙗𝙞𝙤: Set bio/status.
- 🌹𝙨𝙚𝙩𝙥𝙧𝙤𝙛𝙞𝙡𝙚𝙥𝙞𝙘: Set profile picture.
- 🌹𝙩𝙤𝙫𝙞𝙚𝙬𝙤𝙣𝙘𝙚: Send media as view-once.
- 🌹𝙪𝙣𝙗𝙡𝙤𝙘𝙠: Unblock a user.

╔═━「 (*🔮REACTION MENU🔮*) 」━═╗
- 🌹8𝙗𝙖𝙡𝙡: Magic 8-ball style random answer.
- 🌹𝙖𝙫𝙖𝙩𝙖𝙧: Show or generate user avatar.
- 🌹𝙖𝙬𝙤𝙤: Send an “awoo” reaction.
- 🌹𝙗𝙞𝙩𝙚: Send a bite reaction.
- 🌹𝙗𝙡𝙪𝙨𝙝: Send a blush reaction.
- 🌹𝙗𝙤𝙣𝙠: Send a bonk reaction.
- 🌹𝙗𝙪𝙡𝙡𝙮: Send a bully reaction.
- 🌹𝙘𝙧𝙞𝙣𝙜𝙚: Send a cringe reaction.
- 🌹𝙘𝙧𝙮: Send a crying reaction.
- 🌹𝙘𝙪𝙙𝙙𝙡𝙚: Send a cuddle reaction.
- 🌹𝙙𝙖𝙣𝙘𝙚: Send a dance reaction.
- 🌹𝙛𝙚𝙚𝙙: Send a feeding reaction.
- 🌹𝙛𝙤𝙭𝙜𝙞𝙧𝙡: Send a foxgirl anime reaction.
- 🌹𝙜𝙚𝙘𝙜: Send a random anime reaction.
- 🌹𝙜𝙡𝙤𝙢𝙥: Send a glomp (hug) reaction.
- 🌹𝙜𝙤𝙤𝙨𝙚: Send a goose reaction.
- 🌹𝙝𝙖𝙣𝙙𝙝𝙤𝙡𝙙: Send a hand-holding reaction.
- 🌹𝙝𝙖𝙥𝙥𝙮: Send a happy reaction.
- 🌹𝙝𝙞𝙜𝙝𝙛𝙞𝙫𝙚: Send a high-five reaction.
- 🌹𝙝𝙪𝙜: Send a hug reaction.
- 🌹𝙠𝙞𝙡𝙡: Send a kill reaction (anime/meme).
- 🌹𝙠𝙞𝙨𝙨: Send a kiss reaction.
- 🌹𝙡𝙞𝙘𝙠: Send a lick reaction.
- 🌹𝙡𝙞𝙯𝙖𝙧𝙙: Send a lizard reaction.
- 🌹𝙢𝙚𝙤𝙬: Send a meow/cat reaction.
- 🌹𝙣𝙤𝙢: Send a nom (bite) reaction.
- 🌹𝙥𝙖𝙩: Send a pat reaction.
- 🌹𝙥𝙤𝙠𝙚: Send a poke reaction.
- 🌹𝙨𝙝𝙞𝙣𝙤𝙗𝙪: Send a Shinobu anime reaction.
- 🌹𝙨𝙡𝙖𝙥: Send a slap reaction.
- 🌹𝙨𝙢𝙞𝙡𝙚: Send a smile reaction.
- 🌹𝙨𝙢𝙪𝙜: Send a smug reaction.
- 🌹𝙨𝙥𝙖𝙣𝙠: Send a spank reaction.
- 🌹𝙩𝙞𝙘𝙠𝙡𝙚: Send a tickle reaction.
- 🌹𝙬𝙖𝙫𝙚: Send a wave reaction.
- 🌹𝙬𝙞𝙣𝙠: Send a wink reaction.
- 🌹𝙬𝙤𝙤𝙛: Send a dog/woof reaction.
- 🌹𝙮𝙚𝙚𝙩: Send a yeet (throw) reaction.

╔═━「 (*🔮RELIGION MENU🔮*) 」━═╗
- 🌹𝙗𝙞𝙗𝙡𝙚: Access Bible verses or information.
- 🌹𝙦𝙪𝙧𝙖𝙖𝙣: Access Quranic verses or information.
- 🌹𝙜𝙞𝙩𝙖𝙖: Access Bhagavad Gita verses or information.

╔═━「 (*🔮SEARCH MENU🔮*) 」━═╗
- 🌹𝙙𝙞𝙘𝙩𝙞𝙤𝙣𝙖𝙧𝙮: Look up word definitions.
- 🌹𝙙𝙞𝙘𝙩𝙞𝙤𝙣𝙖𝙧𝙮2: Alternative dictionary lookup.
- 🌹𝙩𝙞𝙠𝙩𝙤𝙠𝙞𝙣𝙛𝙤: Get tiktok users info/details.
- 🌹𝙞𝙢𝙙𝙗: Search for movie information on IMDb.
- 🌹𝙡𝙮𝙧𝙞𝙘𝙨: Find song lyrics.
- 🌹𝙡𝙮𝙧𝙞𝙘𝙨2: Alternative lyrics search.
- 🌹𝙨𝙝𝙖𝙯𝙖𝙢: Identify songs from audio.
- 🌹𝙨𝙩𝙞𝙘𝙠𝙚𝙧-𝙨𝙚𝙖𝙧𝙘𝙝: Search for stickers.
- 🌹𝙬𝙚𝙖𝙩𝙝𝙚𝙧: Get current weather updates.
- 🌹𝙮𝙩𝙨: Search for movies on YTS.

╔═━「 (*🔮SETTINGS MENU🔮*) 」━═╗
- 🌹𝙖𝙙𝙙𝙗𝙖𝙙𝙬𝙤𝙧𝙙: Add a word to the blocklist.
- 🌹𝙖𝙙𝙙𝙞𝙜𝙣𝙤𝙧𝙚𝙡𝙞𝙨𝙩: Add a user to the ignore list.
- 🌹𝙖𝙙𝙙𝙨𝙪𝙙𝙤: Add a sudo (admin) user.
- 🌹𝙖𝙡𝙬𝙖𝙮𝙨𝙤𝙣𝙡𝙞𝙣𝙚: Keep the bot always online.
- 🌹𝙖𝙣𝙩𝙞𝙘𝙖𝙡𝙡: Block incoming calls.
- 🌹𝙖𝙣𝙩𝙞𝙙𝙚𝙡𝙚𝙩𝙚: Prevent message deletion.
- 🌹𝙖𝙣𝙩𝙞𝙚𝙙𝙞𝙩: Prevent message editing.
- 🌹𝙖𝙪𝙩𝙤𝙗𝙞𝙤: Automatically update bio/status.
- 🌹𝙖𝙪𝙩𝙤𝙧𝙚𝙖𝙘𝙩𝙨𝙩𝙖𝙩𝙪𝙨: Auto-react to status updates.
- 🌹𝙖𝙪𝙩𝙤𝙫𝙞𝙚𝙬𝙨𝙩𝙖𝙩𝙪𝙨: Auto-view status updates.
- 🌹𝙖𝙪𝙩𝙤𝙧𝙚𝙖𝙘𝙩: Auto-react to messages.
- 🌹𝙖𝙪𝙩𝙤𝙧𝙚𝙖𝙙: Auto-read messages.
- 🌹𝙖𝙪𝙩𝙤𝙩𝙮𝙥𝙚: Auto-type responses.
- 🌹𝙖𝙪𝙩𝙤𝙧𝙚𝙘𝙤𝙧𝙙: Auto-send audio recordings.
- 🌹𝙖𝙪𝙩𝙤𝙧𝙚𝙘𝙤𝙧𝙙𝙩𝙮𝙥𝙞𝙣𝙜: Auto-record typing status.
- 🌹𝙘𝙝𝙖𝙩𝙗𝙤𝙩: Toggle chatbot mode.
- 🌹𝙙𝙚𝙡𝙚𝙩𝙚𝙗𝙖𝙙𝙬𝙤𝙧𝙙: Remove a word from blocklist.
- 🌹𝙙𝙚𝙞𝙜𝙣𝙤𝙧𝙚𝙡𝙞𝙨𝙩: Remove user from ignore list.
- 🌹𝙙𝙚𝙡𝙨𝙪𝙙𝙤: Remove a sudo user.
- 🌹𝙢𝙤𝙙𝙚: Change bot mode (public/private).
- 🌹𝙨𝙚𝙩𝙢𝙚𝙣𝙪: Customize the menu.
- 🌹𝙨𝙚𝙩𝙥𝙧𝙚𝙛𝙞𝙭: Set command prefix.
- 🌹𝙨𝙚𝙩𝙨𝙩𝙖𝙩𝙪𝙨𝙚𝙢𝙤𝙟𝙞: Set emoji for status.
- 🌹𝙬𝙚𝙡𝙘𝙤𝙢𝙚: Set welcome message.
- 🌹𝙜𝙚𝙩𝙨𝙚𝙩𝙩𝙞𝙣𝙜𝙨: Show current settings.
- 🌹𝙧𝙚𝙨𝙚𝙩𝙨𝙚𝙩𝙩𝙞𝙣𝙜: Reset settings to default.

╔═━「 (*🔮TOOLS MENU🔮*) 」━═╗
- 🌹𝙗𝙧𝙤𝙬𝙨𝙚: Browse the web via the bot.
- 🌹𝙚𝙢𝙤𝙟𝙞𝙢𝙞𝙭: Combine emojis.
- 🌹𝙛𝙡𝙞𝙥𝙩𝙚𝙭𝙩: Flip text upside down.
- 🌹𝙜𝙨𝙢𝙖𝙧𝙚𝙣𝙖: Search for mobile phones on GSMArena.
- 🌹𝙜𝙚𝙣𝙥𝙖𝙨𝙨: Generate a password.
- 🌹𝙙𝙚𝙫𝙞𝙘𝙚: Get device information.
- 🌹𝙢𝙤𝙙𝙖𝙥𝙠: Download or request modded APKs.
- 🌹𝙞𝙥𝙡𝙤𝙤𝙠𝙪𝙥: Lookup IP address information.
- 🌹𝙩𝙚𝙢𝙥𝙢𝙖𝙞𝙡: Generate a temporary email address.
- 🌹𝙤𝙗𝙛𝙪𝙨𝙘𝙖𝙩𝙚: Obfuscate text or code.
- 🌹𝙨𝙥𝙚𝙖𝙠: Convert text to speech.
- 🌹𝙫𝙞𝙧𝙪𝙨𝙩𝙤𝙩𝙖𝙡: Scan links for viruses.
- 🌹𝙧𝙚𝙢𝙤𝙫𝙚𝙗𝙜: Remove background from images.
- 🌹𝙬𝙖𝙡𝙞𝙣𝙠: Generate WhatsApp links.
- 🌹𝙘𝙝𝙖𝙣𝙣𝙚𝙡𝙞𝙣𝙛𝙤: For getting info about channels. 
- 🌹𝙧𝙚𝙢𝙞𝙣𝙙𝙢𝙚: Set reminders.
- 🌹𝙩𝙤𝙢𝙥3: Convert video to audio.
- 🌹𝙘𝙖𝙡𝙘: calculator
- 🌹𝙗𝙖𝙨𝙚64𝙚𝙣𝙘𝙤𝙙𝙚𝙧: Encode text to Base64.
- 🌹𝙗𝙖𝙨𝙚64𝙙𝙚𝙘𝙤𝙙𝙚𝙧: Decode Base64 text.
- 🌹𝙦𝙧𝙘𝙤𝙙𝙚: Generate QR codes.
- 🌹𝙟𝙞𝙙: Get WhatsApp JID (user ID).
- 🌹𝙨𝙖𝙮: Make the bot say a message.
- 🌹𝙨𝙨𝙬𝙚𝙗: Take a website screenshot.
- 🌹𝙨𝙨𝙬𝙚𝙗𝙥𝙘: Screenshot website in PC view.
- 🌹𝙨𝙨𝙬𝙚𝙗𝙩𝙖𝙗: Screenshot website in tablet view.
- 🌹𝙘𝙝𝙖𝙣𝙣𝙚𝙡: channel link.
- 🌹𝙨𝙩𝙞𝙘𝙠𝙚𝙧: Create stickers.
- 🌹𝙛𝙖𝙣𝙘𝙮: Generate fancy text.
- 🌹𝙩𝙖𝙠𝙚: Take ownership of something (admin function).
- 🌹𝙩𝙞𝙣𝙮𝙪𝙧𝙡: Shorten URLs.
- 🌹𝙩𝙤𝙞𝙢𝙖𝙜𝙚: Convert stickers to images.
- 🌹𝙘𝙪𝙧𝙧𝙚𝙣𝙘𝙮: Convert currencies.
- 🌹𝙩𝙤𝙪𝙧𝙡: Convert files to URL.
- 🌹𝙩𝙚𝙧𝙖𝙗𝙤𝙭𝙙𝙡: Download from Terabox.
- 🌹𝙘𝙝𝙚𝙘𝙠𝙩𝙞𝙢𝙚: Check time in different countries.
- 🌹𝙛𝙞𝙣𝙙: Find information or files.
- 🌹𝙩𝙧𝙖𝙣𝙨𝙡𝙖𝙩𝙚: Translate text.
- 🌹𝙫𝙘𝙘: Generate virtual credit card (for testing).

╔═━「 *🔮VIDEO MENU🔮* 」━═╗
- 🌹𝙫𝙤𝙡𝙫𝙞𝙙𝙚𝙤: Adjust video volume.
`;

    await Matrix.sendMessage(m.chat, {
      text: menuText
    }, {
      quoted: m
    });
  }
}, {
  command: ['vcc'],
  operate: async ({ m, reply, args }) => {
    const type = args[0] || 'MasterCard';
    const count = args[1] || 1;
    const apiUrl = `https://api.awan-attack.my.id/vcc-generator?type=${type}&count=${count}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.data && response.data.data.length > 0) {
        let vccList = response.data.data.map((vcc, index) => {
          return `VCC ${index + 1}:\nCardholder Name: ${vcc.cardholderName}\nNumber: ${vcc.cardNumber}\nCVC: ${vcc.cvv}\nExpiration Date: ${vcc.expirationDate}`;
        }).join('\n\n');

        reply(`Here are the VCC(s) you requested:\n\n${vccList}\n\nExample of how to create a VCC:\n1. Visit the official website of the bank or VCC service provider.\n2. Choose the desired VCC type (e.g., MasterCard, Visa).\n3. Fill out the registration form with correct information.\n4. Wait for the VCC verification and activation process.\n\nAfter successfully activating the VCC, make sure to:\n- Store VCC data securely.\n- Use the VCC only for legitimate transactions.\n- Check the VCC balance regularly.`);
      } else {
        reply('Sorry, failed to retrieve VCC data or no data found.');
      }
    } catch (error) {
      console.error('Error fetching VCC data:', error);
      reply('Sorry, an error occurred while retrieving VCC data.');
    }
  }
},
];