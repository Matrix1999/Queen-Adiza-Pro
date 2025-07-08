const { fetchJson } = require('../../lib/myfunc');
const { ringtone } = require('../../lib/scraper');
const fetch = require('node-fetch'); 
const myTikTokVideos = require("../../Media/tiktokquote.js");
const { toMp3, audioToVideo } = require("../../lib/converter"); 
const FormData = require("form-data");
const { Buffer } = require("buffer");
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const axios = require('axios');
const os = require('os'); 
const yts = require('yt-search');
const prefixes = [".", ","];

// show typing
async function showTyping(MatrixInstance, chatId) {
    if (MatrixInstance && MatrixInstance.sendPresenceUpdate) {
        // 'composing' typically shows the typing indicator
        await MatrixInstance.sendPresenceUpdate('composing', chatId);
    }
    // You might also want a small delay to ensure the typing indicator is seen
    await new Promise(resolve => setTimeout(resolve, 500));
}
// --- End showTyping definition ---


// Define your TikTok Audio API URL
const TIKTOK_AUDIO_API_URL = 'https://adiza-tiktok-downloader.matrixzat99.workers.dev/?url=';


module.exports = [ {
  command: ['apk', 'apkdl'],
  operate: async ({ m, text, Matrix, botname, reply }) => {
    if (!text) return reply("*Which apk do you want to download?*");
    
    try {
      let kyuu = await fetchJson(`https://bk9.fun/search/apk?q=${text}`);
      let matrix = await fetchJson(`https://bk9.fun/download/apk?id=${kyuu.BK9[0].id}`);

      await Matrix.sendMessage(
        m.chat,
        {
          document: { url: matrix.BK9.dllink },
          fileName: matrix.BK9.name,
          mimetype: "application/vnd.android.package-archive",
          contextInfo: {
            externalAdReply: {
              title: botname,
              body: `${matrix.BK9.name}`,
              thumbnailUrl: `${matrix.BK9.icon}`,
              sourceUrl: `${matrix.BK9.dllink}`,
              mediaType: 2,
              showAdAttribution: true,
              renderLargerThumbnail: false
            }
          }
        },
        { quoted: m }
      );
    } catch (error) {
      reply(`*Error fetching APK details*\n${error.message}`);
    }
  }
 }, {
  command: ['download'],
  operate: async ({ m, text, Matrix, reply }) => {
    if (!text) return reply('Enter download URL');
    
    try {
      let res = await fetch(text, { method: 'GET', redirect: 'follow' });
      let contentType = res.headers.get('content-type');
      let buffer = await res.buffer();
      let extension = contentType.split('/')[1]; 
      let filename = res.headers.get('content-disposition')?.match(/filename="(.*)"/)?.[1] || `download-${Math.random().toString(36).slice(2, 10)}.${extension}`;

      let mimeType;
      switch (contentType) {
        case 'audio/mpeg':
          mimeType = 'audio/mpeg';
          break;
        case 'image/png':
          mimeType = 'image/png';
          break;
        case 'image/jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'application/pdf':
          mimeType = 'application/pdf';
          break;
        case 'application/zip':
          mimeType = 'application/zip';
          break;
        case 'video/mp4':
          mimeType = 'video/mp4';
          break;
        case 'video/webm':
          mimeType = 'video/webm';
          break;
        case 'application/vnd.android.package-archive':
          mimeType = 'application/vnd.android.package-archive';
          break;
        default:
          mimeType = 'application/octet-stream';
      }

      Matrix.sendMessage(m.chat, { document: buffer, mimetype: mimeType, fileName: filename }, { quoted: m });
    } catch (error) {
      reply(`Error downloading file: ${error.message}`);
    }
  }
}, {
  command: ["fb", "facebook"],
  operate: async ({
    m: _0x152311,
    text: _0x4c920f,
    Matrix: _0x27929e,
    reply: _0x3291fc,
    fetchJson // Assuming fetchJson is available in the context
  }) => {
    // React with download emoji when command is received
    await _0x27929e.sendMessage(_0x152311.chat, {
      react: {
        text: "⌛",
        key: _0x152311.key
      }
    });

    if (!_0x4c920f) {
      await _0x27929e.sendMessage(_0x152311.chat, {
        react: {
          text: "❌",
          key: _0x152311.key
        }
      });
      return _0x3291fc("*Please provide a Facebook video url!*");
    }
    try {
      var _0x1c570a = await fetchJson("https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=" + _0x4c920f);
      if (!_0x1c570a || !_0x1c570a.data || !_0x1c570a.data.high) {
        await _0x27929e.sendMessage(_0x152311.chat, {
          react: {
            text: "❌",
            key: _0x152311.key
          }
        });
        return _0x3291fc("*Failed to fetch Facebook video data.*");
      }
      var _0x27ca33 = _0x1c570a.data.high;
      await _0x27929e.sendMessage(_0x152311.chat, {
        video: {
          url: _0x27ca33,
          caption: global.botname
        }
      }, {
        quoted: _0x152311
      });

      // React with success emoji
      await _0x27929e.sendMessage(_0x152311.chat, {
        react: {
          text: "✅",
          key: _0x152311.key
        }
      });

    } catch (_0x53bd40) {
      console.error("facebook command failed:", _0x53bd40);
      await _0x27929e.sendMessage(_0x152311.chat, {
        react: {
          text: "❌",
          key: _0x152311.key
        }
      });
      _0x3291fc("Error fetching video: " + _0x53bd40.message);
    }
  }
}, {
  command: ['gdrive'],
  operate: async ({ Matrix, m, reply, text }) => {
    if (!text) return reply("*Please provide a Google Drive file URL*");

    try {
      let response = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${encodeURIComponent(text)}`);
      let data = await response.json();

      if (response.status !== 200 || !data.status || !data.data) {
        return reply("*Please try again later or try another command!*");
      } else {
        const downloadUrl = data.data.download;
        const filePath = path.join(__dirname, `${data.data.name}`);

        const writer = fs.createWriteStream(filePath);
        const fileResponse = await axios({
          url: downloadUrl,
          method: 'GET',
          responseType: 'stream'
        });

        fileResponse.data.pipe(writer);

        writer.on('finish', async () => {
          await Matrix.sendMessage(m.chat, {
            document: { url: filePath },
            fileName: data.data.name,
            mimetype: fileResponse.headers['content-type']
          });

          fs.unlinkSync(filePath);
        });

        writer.on('error', (err) => {
          console.error('Error downloading the file:', err);
          reply("An error occurred while downloading the file.");
        });
      }
    } catch (error) {
      console.error('Error fetching Google Drive file details:', error);
      reply("An error occurred while fetching the Google Drive file details.");
    }
  }
}, {
  command: ['gitclone'],
  operate: async ({ m, args, prefix, command, Matrix, reply, mess, isUrl }) => {
    if (!args[0])
      return reply(`*GitHub link to clone?*\nExample :\n${prefix}${command} https://github.com/Matrix1999/Matrix-YTD`);
    
    if (!isUrl(args[0]))
      return reply("*Link invalid! Please provide a valid URL.*");

    const regex1 = /(?:https|git)(?::\/\/|@)(www\.)?github\.com[\/:]([^\/:]+)\/(.+)/i;
    const [, , user, repo] = args[0].match(regex1) || [];
    
    if (!repo) {
      return reply("*Invalid GitHub link format. Please double-check the provided link.*");
    }
    
    const repoName = repo.replace(/.git$/, "");
    const url = `https://api.github.com/repos/${user}/${repoName}/zipball`;
    
    try {
      const response = await fetch(url, { method: "HEAD" });
      const filename = response.headers
        .get("content-disposition")
        .match(/attachment; filename=(.*)/)[1];
      
      await Matrix.sendMessage(
        m.chat,
        {
          document: { url: url },
          fileName: filename + ".zip",
          mimetype: "application/zip",
        },
        { quoted: m }
      );
    } catch (err) {
      console.error(err);
      reply(mess.error);
    }
  }
}, {
  command: ['image', 'img'],
  operate: async ({ Matrix, m, reply, text }) => {
    if (!text) return reply("*Please provide a search query*");

    try {
      let response = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);
      let data = await response.json();

      if (response.status !== 200 || !data.status || !data.data || data.data.length === 0) {
        return reply("*Please try again later or try another command!*");
      } else {
        // Send the first 5 images
        const images = data.data.slice(0, 5);

        for (const image of images) {
          await Matrix.sendMessage(m.chat, {
            image: { url: image.images_url },
          });
        }
      }
    } catch (error) {

      reply("An error occurred while fetching images.");
    }
  }
}, {
  command: ["img"],
  tags: ["ai", "tools"],
  help: ["img <number> <prompt>"],
  operate: async ({ Matrix, m, text, args, reply }) => {
    try {
      if (!text) return reply(`*Example:* .img 3 anime cat girl`);

      // Parse number of images and prompt
      const count = parseInt(args[0]);
      const numImages = isNaN(count) ? 5 : Math.min(count, 12); // Max 12 images
      const prompt = isNaN(count) ? text : args.slice(1).join(" ");

      if (!prompt) return reply(`*Please provide a prompt to generate images.*\n*Example:* .img 2 sunset over mountains`);

      await Matrix.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });

      const apiUrl = `https://img.hazex.workers.dev/?prompt=${encodeURIComponent(prompt)}`;
      const footer = "\n> *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 🌹𝐀𝐝𝐢𝐳𝐚𝐭𝐮🌹©*";

      for (let i = 0; i < numImages; i++) {
        await Matrix.sendMessage(m.chat, {
          image: { url: apiUrl },
          caption: `${footer}`
        }, { quoted: m });
      }

      await Matrix.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {

      await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      reply("*An error occurred while generating images. Try again later.*");
    }
  }
}, {
  command: ["tomp3"],
  tags: ["tools"],
  help: ["videotomp3 "],
  operate: async ({ Matrix, m, quoted, reply }) => {
    await Matrix.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    });
    if (!quoted || quoted.mtype !== "videoMessage") {
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      return reply("*Please reply to a video to convert it to MP3!*");
    }

    try {
      const { toMp3 } = require("../../lib/converter");
      const media = await quoted.download();
      const audio = await toMp3(media, "mp4"); // Specify input format as 'mp4'

      await Matrix.sendMessage(m.chat, {
        audio: audio.data,
        mimetype: "audio/mpeg",
        ptt: false,
        quoted: m
      });
      await audio.delete?.();
      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });
    } catch (e) {
      console.error(e);
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      reply("*Failed to convert video to MP3.*");
    }
  }
}, {
  command: ["tovideo"],
  tags: ["tools"],
  help: ["audiotovideo"],
  operate: async ({ Matrix, m, quoted, reply }) => {
    try {
      await Matrix.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      if (!quoted || !["audioMessage", "ptt"].includes(quoted.mtype)) {
        await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return reply("*Reply to an audio message to convert it into video.*");
      }

      const { audioToVideo } = require("../../lib/converter");
      const media = await quoted.download();

      if (!media || media.length === 0) {
        await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return reply("*Failed to download audio. Please try again.*");
      }

      console.log(`[${m.sender}] Audio downloaded, size: ${media.length} bytes`);

      const video = await audioToVideo(media, "mp3");

      if (!video?.data || video?.data?.length === 0) {
        console.error(`[${m.sender}] FFmpeg output is empty.`);
        await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return reply("*Conversion failed. FFmpeg returned no data.*");
      }

      await Matrix.sendMessage(m.chat, {
        video: video.data,
        mimetype: "video/mp4",
        caption: "✅ Audio converted to video successfully🚀.",
        quoted: m
      });

      await Matrix.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      await video.delete?.();

    } catch (err) {
      console.error(`[${m.sender}] Error during .tovideo:`, err);
      await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      reply("*An error occurred during conversion. Check logs.*");
    }
  }
}, {
  command: ["instagram", "insta"],
  operate: async ({
    Matrix: _0x5e1205,
    m: _0x1987c6,
    reply: _0x463896,
    text: _0x207a28
  }) => {
    // React with ⏳ when the command starts
    await _0x5e1205.sendMessage(_0x1987c6.chat, {
      react: {
        text: "⏳",
        key: _0x1987c6.key
      }
    });

    if (!_0x207a28) {
      await _0x5e1205.sendMessage(_0x1987c6.chat, {
        react: {
          text: "❌",
          key: _0x1987c6.key
        }
      });
      return _0x463896("*Please provide an Instagram URL!*");
    }

    const _0x4dc8de = "https://api.nexoracle.com/downloader/insta?apikey=MatrixZatKing&url=" + encodeURIComponent(_0x207a28);

    try {
      const _0x581760 = await fetch(_0x4dc8de);
      const _0x257dc5 = await _0x581760.json();

      if (!_0x257dc5 || !_0x257dc5.result || !_0x257dc5.result.video) {
        await _0x5e1205.sendMessage(_0x1987c6.chat, {
          react: {
            text: "❌",
            key: _0x1987c6.key
          }
        });
        return _0x463896("*Failed to retrieve the video!*");
      }

      const _0x51c63b = _0x257dc5.result.video;
      const _0x281b63 = _0x257dc5.result.title || "Instagram Video";

      await _0x5e1205.sendMessage(_0x1987c6.chat, {
        video: { url: _0x51c63b },
        mimetype: "video/mp4",
        fileName: _0x281b63 + ".mp4"
      }, {
        quoted: _0x1987c6
      });

      // React with ✅ on success
      await _0x5e1205.sendMessage(_0x1987c6.chat, {
        react: {
          text: "✅",
          key: _0x1987c6.key
        }
      });

    } catch (_0x20b62e) {
      console.error("Download command failed:", _0x20b62e);
      await _0x5e1205.sendMessage(_0x1987c6.chat, {
        react: {
          text: "❌",
          key: _0x1987c6.key
        }
      });
      _0x463896("Error: " + _0x20b62e.message);
    }
  }
}, {
  command: ['itunes'],
  operate: async ({ m, text, Matrix, reply }) => {
    if (!text) return reply("*Please provide a song name*");
    
    try {
      let res = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(text)}`);
      if (!res.ok) {
        throw new Error(`*API request failed with status ${res.status}*`);
      }
      let json = await res.json();
      let songInfo = `*Song Information:*\n
 • *Name:* ${json.name}\n
 • *Artist:* ${json.artist}\n
 • *Album:* ${json.album}\n
 • *Release Date:* ${json.release_date}\n
 • *Price:* ${json.price}\n
 • *Length:* ${json.length}\n
 • *Genre:* ${json.genre}\n
 • *URL:* ${json.url}`;
     
      if (json.thumbnail) {
        await Matrix.sendMessage(
          m.chat,
          { image: { url: json.thumbnail }, caption: songInfo },
          { quoted: m }
        );
      } else {
        reply(songInfo);
      }
    } catch (error) {
      console.error(error);
      reply(`Error fetching song information: ${error.message}`);
    }
  }
}, {
  command: ['mediafire'],
  operate: async ({ Matrix, m, reply, text }) => {
    if (!text) return reply("*Please provide a MediaFire file URL*");

    try {
      let response = await fetch(`https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(text)}`);
      let data = await response.json();

      if (response.status !== 200 || !data.status || !data.data) {
        return reply("*Please try again later or try another command!*");
      } else {
        const downloadUrl = data.data.downloadLink;
        const filePath = path.join(__dirname, `${data.data.fileName}.zip`);

        const writer = fs.createWriteStream(filePath);
        const fileResponse = await axios({
          url: downloadUrl,
          method: 'GET',
          responseType: 'stream'
        });

        fileResponse.data.pipe(writer);

        writer.on('finish', async () => {
          
          await Matrix.sendMessage(m.chat, {
            document: { url: filePath },
            fileName: data.data.fileName,
            mimetype: 'application/zip'
          });

          fs.unlinkSync(filePath);
        });

        writer.on('error', (err) => {
          console.error('Error downloading the file:', err);
          reply("An error occurred while downloading the file.");
        });
      }
    } catch (error) {
      console.error('Error fetching MediaFire file details:', error);
      reply("An error occurred while fetching the MediaFire file details.");
    }
  }
}, {
  command: ['pinterest'],
  operate: async ({ Matrix, m, reply, text }) => {
    if (!text) return reply("*Please provide a search query*");

    try {
      let response = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);
      let data = await response.json();

      if (response.status !== 200 || !data.status || !data.data || data.data.length === 0) {
        return reply("*Please try again later or try another command!*");
      } else {
        // Send only the first image
        const image = data.data[0];

        await Matrix.sendMessage(m.chat, {
          image: { url: image.images_url },
          caption: `Title: ${image.grid_title}\nLink: ${image.link}`
        });
      }
    } catch (error) {
      console.error('Error fetching Pinterest images:', error);
      reply("An error occurred while fetching Pinterest images.");
    }
  }
}, {
  command: ["play"],
  operate: async ({
    Matrix: _0x56a354,
    m: _0x4303a2,
    reply: _0x5aafa4,
    text: _0x32bfab,
    fetchMp3DownloadUrl: _0x138024
  }) => {
    // React with download emoji when command is received
    await _0x56a354.sendMessage(_0x4303a2.chat, {
      react: {
        text: "⏳",
        key: _0x4303a2.key
      }
    });

    if (!_0x32bfab) {
      await _0x56a354.sendMessage(_0x4303a2.chat, {
        react: {
          text: "❌",
          key: _0x4303a2.key
        }
      });
      return _0x5aafa4("*Please provide a song name!*");
    }

    try {
      const _0x65ceaf = await yts(_0x32bfab);
      if (!_0x65ceaf || _0x65ceaf.all.length === 0) {
        await _0x56a354.sendMessage(_0x4303a2.chat, {
          react: {
            text: "❌",
            key: _0x4303a2.key
          }
        });
        return _0x5aafa4("*The song you are looking for was not found.*");
      }

      const _0x58b4cc = _0x65ceaf.all[0];
      const _0x6668b4 = await _0x138024(_0x58b4cc.url);

      await _0x56a354.sendMessage(_0x4303a2.chat, {
        audio: {
          url: _0x6668b4
        },
        mimetype: "audio/mpeg",
        fileName: _0x58b4cc.title + ".mp3"
      }, {
        quoted: _0x4303a2
      });

      // React with success emoji
      await _0x56a354.sendMessage(_0x4303a2.chat, {
        react: {
          text: "✅",
          key: _0x4303a2.key
        }
      });

    } catch (_0x377fb4) {
      console.error("play command failed:", _0x377fb4);
      await _0x56a354.sendMessage(_0x4303a2.chat, {
        react: {
          text: "❌",
          key: _0x4303a2.key
        }
      });
      _0x5aafa4("Error: " + _0x377fb4.message);
    }
  }
}, {
  command: ["music"],
  tags: ["media"],
  help: ["music [song name]"],
  operate: async ({ m, reply, args, Matrix }) => {
    const prefixes = [".", ","];
    const text = m?.message?.conversation || m?.message?.extendedTextMessage?.text || "";
    const usedPrefix = prefixes.find(p => text.startsWith(p)) || ".";
    const commandName = "music";

    const songName = args.join(" ");
    if (!songName) {
      return reply(`*Example*: ${usedPrefix + commandName} Pony by Daddy Lumba`);
    }

    try {
      // React: Processing
      await Matrix.sendMessage(m.chat, {
        react: { text: "🎵", key: m.key }
      });

      const axios = require("axios");

      // Using the new API
      const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(songName)}`;
      const res = await axios.get(apiUrl);

      if (!res.data?.status || !res.data?.result) {
        return reply(`*No results found for:* ${songName}`);
      }

      const { title, video_url, thumbnail, duration, views, published, download_url } = res.data.result;

      // React: Success
      await Matrix.sendMessage(m.chat, {
        react: { text: "👍", key: m.key }
      });

      const caption =
        `🎶 *QUEEN ADIZA_MUSIC - PLAYER*\n` +
        `🤖 *Title:* ${title}\n` +
        `👀 *Views:* ${views}\n` +
        `⏳ *Duration:* ${duration}\n` +
        `⏰ *Uploaded:* ${published}\n` +
        `🔗 *Url:* ${video_url}\n` +
        `🥇 *🌹𝗤𝘂𝗲𝗲𝗻-𝗔𝗱𝗶𝘇𝗮-𝗕𝗼𝘁🌹*`;

      await Matrix.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption
      }, { quoted: m });

      // Sending the audio
      await Matrix.sendMessage(m.chat, {
        audio: { url: download_url },
        mimetype: "audio/mp4",
        fileName: `${title || "song"}.mp3`,
        caption: `🎶 *Here's your song:* ${title || "your requested track"}\n🔊 *Enjoy the vibes powered by Queen Adiza!*`
      }, { quoted: m });

      setTimeout(async () => {
        await Matrix.sendMessage(m.chat, { react: { text: "💃", key: m.key } });
        await Matrix.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });
        await Matrix.sendMessage(m.chat, { text: "🚀 *Boom!* Your music just dropped. Time to blast it loud!" });
      }, 5000);

    } catch (error) {
      console.error("Error during song command:", error);
      reply("*An error occurred while processing your song. Try again later.*");
    }
  }
}, {
  command: ["spotify"],
  tags: ["media"],
  help: ["music [spotify track link]"],
  operate: async ({ m, reply, args, Matrix }) => {
    const prefixes = [".", ","];
    const text = m?.message?.conversation || m?.message?.extendedTextMessage?.text || "";
    const usedPrefix = prefixes.find(p => text.startsWith(p)) || ".";
    const commandName = "spotify";

    const spotifyUrl = args.join(" ");
    if (!spotifyUrl || !spotifyUrl.includes("spotify.com/track")) {
      return reply(`*Example:* ${usedPrefix + commandName} https://open.spotify.com/track/3lWzVNe1yFZlkeBBzUuZYu`);
    }

    try {
      await Matrix.sendMessage(m.chat, {
        react: { text: "🎵", key: m.key }
      });

      const axios = require("axios");
      const apiUrl = `https://api.nexoracle.com/downloader/spotify?apikey=MatrixZatKing&url=${encodeURIComponent(spotifyUrl)}`;
      const res = await axios.get(apiUrl);

      if (res.data.status !== 200 || !res.data.result) {
        return reply("*Unable to fetch song. Make sure the Spotify link is valid.*");
      }

      const { title, artist, album_artist, cover_url, download, url } = res.data.result;

      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });

      const caption =
        `🎶 *QUEEN ADIZA - SPOTIFY DOWNLOADER*\n` +
        `🎧 *Title:* ${title}\n` +
        `🧑‍🎤 *Artist:* ${artist}\n` +
        `💽 *Album Artist:* ${album_artist}\n` +
        `🔗 *Spotify URL:* ${url}\n` +
        `🌹 *Powered by Queen-Adiza*`;

      await Matrix.sendMessage(m.chat, {
        image: { url: cover_url },
        caption
      }, { quoted: m });

      await Matrix.sendMessage(m.chat, {
        audio: { url: download },
        mimetype: "audio/mp4",
        fileName: `${title || "song"}.mp3`,
        caption: `🎶 *Here's your Spotify track:* ${title || "your requested track"}\n🔊 *Enjoy powered by Queen Adiza!*`
      }, { quoted: m });

    } catch (error) {
      console.error("Spotify Music Error:", error);
      reply("*Failed to process your Spotify link. Please try again later or use a different one.*");
    }
  }
}, {
  command: ["song"],
  tags: ["media"],
  help: ["song [song name]"],
  operate: async ({ m, reply, args, Matrix }) => {
    const prefixes = [".", ","];
    const text = m?.message?.conversation || m?.message?.extendedTextMessage?.text || "";
    const usedPrefix = prefixes.find(p => text.startsWith(p)) || ".";
    const commandName = "song";

    const songName = args.join(" ");
    if (!songName) {
      return reply(`*Example*: ${usedPrefix + commandName} Grace By Stonebwoy`);
    }

    try {
      // React: Processing
      await Matrix.sendMessage(m.chat, {
        react: { text: "🎵", key: m.key }
      });

      const yts = require("yt-search");
      const axios = require("axios");
      const searchResult = await yts(songName);
      const video = searchResult.videos[0];

      if (!video) {
        return reply(`*No results found for:* ${songName}`);
      }

      // React: Success
      await Matrix.sendMessage(m.chat, {
        react: { text: "👍", key: m.key }
      });

      const caption =
        `🎶 *QUEEN ADIZA_MUSIC - PLAYER*\n` +
        `🎧 *Title:* ${video.title}\n` +
        `👀 *Views:* ${video.views}\n` +
        `⏳ *Duration:* ${video.timestamp}\n` +
        `🕒 *Uploaded:* ${video.ago}\n` +
        `🔗 *Url:* ${video.url}\n` +
        `🔥 *🌹𝗤𝘂𝗲𝗲𝗻-𝗔𝗱𝗶𝘇𝗮-𝗠𝘂𝘀𝗶𝗰🌹*`;

      await Matrix.sendMessage(m.chat, {
        image: { url: video.thumbnail },
        caption
      }, { quoted: m });

      const apiUrl = `https://api.nexoracle.com/downloader/yt-audio2?apikey=MatrixZatKing&url=${encodeURIComponent(video.url)}`;
      const res = await axios.get(apiUrl);

      if (res.data?.status === 200 && res.data?.result?.audio) {
        const { audio, title } = res.data.result;

        await Matrix.sendMessage(m.chat, {
          audio: { url: audio },
          mimetype: "audio/mp4",
          fileName: `${title || "song"}.mp3`,
          caption: `🎶 *Here's your song:* ${title || "your requested track"}\n🔊 *Enjoy the vibes powered by Queen Adiza!*`
        }, { quoted: m });

        setTimeout(async () => {
          await Matrix.sendMessage(m.chat, { react: { text: "💃", key: m.key } });
          await Matrix.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });
          await Matrix.sendMessage(m.chat, { text: "🚀 *Music Alert:* Song delivered safely. Enjoy!" });
        }, 5000);
      } else {
        reply("*Failed to fetch the song audio! Please try again later.*");
      }

    } catch (error) {
      console.error("Error during song command:", error);
      reply("*An error occurred while processing your song. Try again later.*");
    }
  }
}, {
  command: ['playdoc', 'songdoc'],
  operate: async ({ Matrix, m, reply, text, fetchMp3DownloadUrl }) => {
    if (!text) return reply('*Please provide a song name!*');

    try {
      const search = await yts(text);
      if (!search || search.all.length === 0) return reply('*The song you are looking for was not found.*');

      const video = search.all[0];
      const downloadUrl = await fetchMp3DownloadUrl(video.url);

      await Matrix.sendMessage(m.chat, {
        document: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: m });

    } catch (error) {
      console.error('playdoc command failed:', error);
      reply(`Error: ${error.message}`);
    }
  }
},
 {
  command: ['ringtone'],
  operate: async ({ m, text, prefix, command, Matrix, reply }) => {
    if (!text) return reply(`*Example: ${prefix + command} black rover*`);
    
    try {
      let anutone2 = await ringtone.ringtone(text);
      let result = anutone2[Math.floor(Math.random() * anutone2.length)];
      
      await Matrix.sendMessage(
        m.chat,
        {
          audio: { url: result.audio },
          fileName: result.title + ".mp3",
          mimetype: "audio/mpeg",
        },
        { quoted: m }
      );
    } catch (error) {
      reply(`Error fetching ringtone: ${error.message}`);
    }
  }
}, 
  {
    command: ['savestatus', 'save'],
    operate: async ({ m, args, saveStatusMessage }) => {

      const saveToDM = args.includes('dm') || args.includes('me');       

      await saveStatusMessage(m, saveToDM);
    }
  },
 {
  command: ["tiktok", "tikdl", "tiktokvideo"],
  operate: async ({
    m,           // Message object
    args,        // Command arguments (array)
    fetchJson,   // Function to fetch JSON from a URL
    Matrix,      // Your bot instance
    reply        // Function to send a reply
  }) => {
    // React with download emoji when command is received
    await Matrix.sendMessage(m.chat, {
      react: { text: "📥", key: m.key }
    });

    // Check if a TikTok URL was provided
    if (!args[0]) {
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      return reply("*Please provide a TikTok video url!*");
    }

    try {
      const apiUrl = "https://adiza-tiktok-downloader.matrixzat99.workers.dev/?url=" + encodeURIComponent(args[0]);
      const result = await fetchJson(apiUrl);

      // Check for valid video URL in API response
      if (!result.download || !result.download.video) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "❌", key: m.key }
        });
        return reply("*Failed to get video link. Please check the TikTok URL and try again.*");
      }

      await Matrix.sendMessage(
        m.chat,
        {
          caption: global.wm,
          video: { url: result.download.video },
          fileName: "video.mp4",
          mimetype: "video/mp4"
        },
        { quoted: m }
      );

      // React with success emoji
      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });

    } catch (err) {
      console.error("tiktok command failed:", err);
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      reply("Error fetching video: " + (err.message || err));
    }
  }
}, {
  command: ["tikquote", "tikquotes"],
  operate: async ({ m, fetchJson, Matrix, reply }) => {
    try {
      const randomUrl = myTikTokVideos[Math.floor(Math.random() * myTikTokVideos.length)];
      const res = await fetchJson(`https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${randomUrl}`);

      if (!res?.data?.video) return reply("Failed to fetch video.");

      await Matrix.sendMessage(m.chat, {
        caption: global.wm,
        video: { url: res.data.video },
        fileName: "tikquote_video.mp4",
        mimetype: "video/mp4"
      }, { quoted: m });

    } catch (err) {
      reply("Error fetching video: " + err.message);
    }
  }
}, {
  command: ['twitter', 'twitdl', 'x'],
  tags: ['downloader'],
  help: ['twitter <url>', 'twitdl <url>'],
  operate: async ({ m, text, args, Matrix, reply }) => {
    const url = args[0] || text;
    if (!url || !/^https?:\/\/(x|twitter)\.com\/.+/i.test(url)) {
      return reply(`*Example usage:*\n.twitter https://x.com/...`);
    }

    try {
      // React with "loading" emoji
      await Matrix.sendMessage(m.chat, {
        react: { text: "⌛", key: m.key }
      });

      const fetch = require('node-fetch');
      const res = await fetch(`https://www.velyn.biz.id/api/downloader/twitter?url=${encodeURIComponent(url)}`);
      const json = await res.json();

      if (!json.status || !json.data?.media?.length) {
        // React with failure emoji
        await Matrix.sendMessage(m.chat, {
          react: { text: "❌", key: m.key }
        });
        return reply('❌ Failed to fetch data. Make sure the URL is valid and media is found.');
      }

      const { authorName, authorUsername, likes, retweets, replies, date, media } = json.data;

      // Nicely formatted caption for WhatsApp
      const caption = 
`*🐦 Twitter Downloader*

👤 *Author:* ${authorName} (@${authorUsername})

❤️ *Likes:* ${likes}  
🔁 *Retweets:* ${retweets}  
💬 *Replies:* ${replies}

🗓️ *Date:* ${date}

🔗 [Open Tweet](${url})`;

      for (const item of media) {
        if (!item.url) continue;

        const urlLower = item.url.toLowerCase();
        if (urlLower.endsWith('.mp4') || urlLower.endsWith('.mov')) {
          await Matrix.sendMessage(
            m.chat,
            {
              video: { url: item.url },
              fileName: 'twitter_video.mp4',
              mimetype: 'video/mp4',
              caption
            },
            { quoted: m }
          );
        } else if (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg') || urlLower.endsWith('.png') || urlLower.endsWith('.gif')) {
          await Matrix.sendMessage(
            m.chat,
            {
              image: { url: item.url },
              caption
            },
            { quoted: m }
          );
        } else {
          await Matrix.sendMessage(
            m.chat,
            {
              document: { url: item.url },
              fileName: 'twitter_media',
              caption
            },
            { quoted: m }
          );
        }
      }

      // React with success emoji after sending all media
      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });

    } catch (e) {
      console.error(e);
      // React with failure emoji on error
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      reply('❌ Error contacting API or processing media.');
    }
  }
}, {
  command: ["video"],
  operate: async ({
    Matrix: _0x45aa8d,
    m: _0x694674,
    reply: _0x1c3456,
    text: _0xaea5d4,
    fetchVideoDownloadUrl: _0x294844
  }) => {
    // React with download emoji when command is received
    await _0x45aa8d.sendMessage(_0x694674.chat, {
      react: {
        text: "📥",
        key: _0x694674.key
      }
    });

    if (!_0xaea5d4) {
      await _0x45aa8d.sendMessage(_0x694674.chat, {
        react: {
          text: "❌",
          key: _0x694674.key
        }
      });
      return _0x1c3456("*Please provide a video name!*");
    }
    try {
      const _0x5ddf21 = await yts(_0xaea5d4);
      if (!_0x5ddf21 || _0x5ddf21.all.length === 0) {
        await _0x45aa8d.sendMessage(_0x694674.chat, {
          react: {
            text: "❌",
            key: _0x694674.key
          }
        });
        return _0x1c3456("*The video you are looking for was not found.*");
      }
      const _0xed2c9d = _0x5ddf21.all[0];
      const _0x518f0e = await _0x294844(_0xed2c9d.url);
      await _0x45aa8d.sendMessage(_0x694674.chat, {
        video: {
          url: _0x518f0e.data.dl
        },
        mimetype: "video/mp4",
        fileName: _0x518f0e.data.title + ".mp4",
        caption: _0x518f0e.data.title
      }, {
        quoted: _0x694674
      });

      // React with success emoji
      await _0x45aa8d.sendMessage(_0x694674.chat, {
        react: {
          text: "✅",
          key: _0x694674.key
        }
      });

    } catch (_0x5118b0) {
      console.error("video command failed:", _0x5118b0);
      await _0x45aa8d.sendMessage(_0x694674.chat, {
        react: {
          text: "❌",
          key: _0x694674.key
        }
      });
      _0x1c3456("Error: " + _0x5118b0.message);
    }
  }
}, {
  command: ['videodoc'],
  operate: async ({ Matrix, m, reply, text, fetchVideoDownloadUrl }) => {
    if (!text) return reply('*Please provide a song name!*');

    try {
      const search = await yts(text);
      if (!search || search.all.length === 0) return reply('*The song you are looking for was not found.*');

      const video = search.all[0]; 
      const videoData = await fetchVideoDownloadUrl(video.url);

      await Matrix.sendMessage(m.chat, {
        document: { url: videoData.download_url },
        mimetype: 'video/mp4',
        fileName: `${videoData.title}.mp4`,
        caption: videoData.title
      }, { quoted: m });

    } catch (error) {
      console.error('videodoc command failed:', error);
      reply(`Error: ${error.message}`);
    }
  }
}, {
  command: ['xvideos', 'porn', 'xdl'],
  operate: async ({ m, text, isCreator, reply, mess, Matrix, fetchJson, quoted }) => {
  if (!isCreator) return reply(mess.owner);
	if (!text) return reply('*Please provide a porn video search query!*');
    let kutu = await fetchJson(`https://api-aswin-sparky.koyeb.app/api/search/xnxx?search=${text}`)
	let kyuu = await fetchJson(`https://api-aswin-sparky.koyeb.app/api/downloader/xnxx?url=${kutu.result.result[0].link}`)
await Matrix.sendMessage(m.chat, {
 video: {url: kyuu.data.files.high}, 
 caption: global.wm,
 contextInfo: {
        externalAdReply: {
          title: global.botname,
          body: `${kutu.result.result[0].title}`,
          sourceUrl: `${kutu.result.result[0].link}`,
          mediaType: 2,
          mediaUrl: `${kutu.result.result[0].link}`,
        }
      }
    }, { quoted: m });
    
	let kyut = await fetchJson(`https://api-aswin-sparky.koyeb.app/api/downloader/xnxx?url=${kutu.result.result[1].link}`)
await Matrix.sendMessage(m.chat, {
 video: {url: kyut.data.files.high}, 
 caption: global.wm,
 contextInfo: {
        externalAdReply: {
          title: global.botname,
          body: `${kutu.result.result[1].title}`,
          sourceUrl: `${kutu.result.result[1].link}`,
          mediaType: 2,
          mediaUrl: `${kutu.result.result[1].link}`,
        }
      }
    }, { quoted: m });
  }
}, {
  command: ['ytmp3'],
  operate: async ({ Matrix, m, reply, text, fetchMp3DownloadUrl }) => {
    if (!text) return reply('*Please provide a valid YouTube link!*');

    try {
      const urlMatch = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
      if (!urlMatch) return reply('*Seems like your message does not contain a valid YouTube link*');

      const link = urlMatch[0];
      const downloadUrl = await fetchMp3DownloadUrl(link);

      await Matrix.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg'
      }, { quoted: m });

    } catch (error) {
      console.error('ytmp3 command failed:', error);
      reply(`Error: ${error.message}`);
    }
  }
},
 {
  command: ['ytmp3doc'],
  operate: async ({ Matrix, m, reply, text, fetchMp3DownloadUrl }) => {
    if (!text) return reply('*Please provide a valid YouTube link!*');

    try {
      const urlMatch = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
      if (!urlMatch) return reply('*Seems like your message does not contain a valid YouTube link*');

      const link = urlMatch[0];
      const downloadUrl = await fetchMp3DownloadUrl(link);

      await Matrix.sendMessage(m.chat, {
        document: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${link}.mp3`
      }, { quoted: m });

    } catch (error) {
      console.error('ytmp3doc command failed:', error);
      reply(`Error: ${error.message}`);
    }
  }
}, {
  command: ['ytmp4'],
  operate: async ({ m, text, Matrix, reply }) => {
    if (!text) {
      return reply(`*Example*: .ytmp4 https://youtube.com/watch?v=60ItHLz5WEA`);
    }

    try {
      // React with loading emoji
      await Matrix.sendMessage(m.chat, {
        react: { text: "🔍", key: m.key }
      });

      // Fetch video details from David Cyriltech API
      const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);

      if (!response.data.success) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "❌", key: m.key }
        });
        return reply("❌ Error fetching the video!");
      }

      const { title, download_url, thumbnail } = response.data.result;

      // Send video preview with thumbnail and info
      await Matrix.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption:
          `🎬 *Video Found* 🎬\n\n` +
          `🎞️ *Title:* ${title}\n` +
          `🔗 *YouTube Link:* ${text}\n\n` +
          `📥 Downloading *video file* for you...`
      }, { quoted: m });

      // Send the video file
      await Matrix.sendMessage(m.chat, {
        video: { url: download_url },
        mimetype: 'video/mp4',
        caption: `🎬 *Title:* ${title}`
      }, { quoted: m });

      // React with success emoji
      await Matrix.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      });

    } catch (error) {
      console.error("ytmp4 command error:", error);
      await Matrix.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      reply("❌ An error occurred while processing your request.");
    }
  }
}, 

  {
  command: ['ytube'],
  operate: async ({ Matrix, m, reply, text, fetchVideoDownloadUrl }) => {
    if (!text) return reply('*Please provide a valid YouTube link!*');

    try {
      const urlMatch = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
      if (!urlMatch) return reply('*Seems like your message does not contain a valid YouTube link*');

      const link = urlMatch[0];
      const videoData = await fetchVideoDownloadUrl(link);

      await Matrix.sendMessage(m.chat, {
        video: { url: videoData.download_url },
        mimetype: 'video/mp4',
        fileName: `${videoData.title}.mp4`,
        caption: videoData.title
      }, { quoted: m });

    } catch (error) {
      console.error('ytmp4 command failed:', error);
      reply(`Error: ${error.message}`);
    }
  }
},
{
  command: ['ytmp4doc'],
  operate: async ({ Matrix, m, reply, text, fetchVideoDownloadUrl }) => {
    if (!text) return reply('*Please provide a valid YouTube link!*');

    try {
      const urlMatch = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
      if (!urlMatch) return reply('*Seems like your message does not contain a valid YouTube link*');

      const link = urlMatch[0];
      const videoData = await fetchVideoDownloadUrl(link);

      await Matrix.sendMessage(m.chat, {
        document: { url: videoData.download_url },
        mimetype: 'video/mp4',
        fileName: `${videoData.title}.mp4`,
        caption: videoData.title
      }, { quoted: m });

    } catch (error) {
      console.error('ytmp4doc command failed:', error);
      reply(`Error: ${error.message}`);
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
  command: ["mega"],
  operate: async ({ Matrix, m, reply, args }) => {
    const url = args[0];
    if (!url) {
      return reply("*Example:* .mega https://mega.nz/file/XXXXX#YYYYY");
    }

    try {
      // React to the message (optional, for WhatsApp-like bots)
      if (Matrix.sendMessage && m.key) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "📥", key: m.key }
        });
      }

      const apiUrl = "https://api.emirkabal.com/mega?url=" + encodeURIComponent(url);
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.downloadUrl) {
        throw new Error("No download link found");
      }

      await Matrix.sendMessage(m.chat, {
        document: { url: data.downloadUrl },
        caption: "📥 *Mega.nz Download*\n> *Powered by Queen Adiza AI*",
      }, { quoted: m });

    } catch (error) {
      console.error(error);
      reply("❌ Failed to download from Mega.nz!");
    }
  }
}, {
  command: ["zippyshare"],
  operate: async ({ Matrix, m, reply, args }) => {
    const url = args[0];
    if (!url) {
      return reply("*Example:* .zippyshare https://www.zippyshare.com/v/xxxxxx/file.html");
    }

    try {
      // Optional: React to the message (for WhatsApp-like bots)
      if (Matrix.sendMessage && m.key) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "📥", key: m.key }
        });
      }

      const apiUrl = "https://api.alandikasaputra.repl.co/zippyshare?url=" + encodeURIComponent(url);
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.download) {
        throw new Error("No download link found");
      }

      await Matrix.sendMessage(m.chat, {
        document: { url: data.download },
        caption: "📥 *Zippyshare Download*\n> *Powered by Queen Adiza AI*"
      }, { quoted: m });

    } catch (error) {
      console.error(error);
      reply("❌ Failed to download from Zippyshare!");
    }
  }
}, {
  command: ["dropbox"],
  operate: async ({ Matrix, m, reply, args }) => {
    const url = args[0];
    if (!url) {
      return reply("*Example:* .dropbox https://www.dropbox.com/s/xxxxxx/file.zip?dl=0");
    }

    try {
      // Optional: React to the message (for WhatsApp-like bots)
      if (Matrix.sendMessage && m.key) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "📥", key: m.key }
        });
      }

      // Convert Dropbox sharing link to direct download link
      const directUrl = url.replace("?dl=0", "?dl=1");
      // Extract file name from URL
      const fileName = url.split("/").pop().replace(/\?.*/, "");

      await Matrix.sendMessage(m.chat, {
        document: { url: directUrl },
        fileName: fileName,
        caption: "📥 *Dropbox Download*\n> *Powered by Queen Adiza AI*"
      }, { quoted: m });

    } catch (error) {
      console.error(error);
      reply("❌ Failed to download from Dropbox!");
    }
  }
}, {
  command: ["bing"],
  operate: async ({ Matrix, m, reply, args }) => {
    const prompt = args.join(" ");
    if (!prompt) {
      return reply(`*Example*: .bing naruto`);
    }

    try {
      // React to the message (optional)
      if (Matrix.sendMessage && m.key) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "🔍", key: m.key }
        });
      }

      const baseUrl = `https://api.agungny.my.id/api/seaart?prompt=${encodeURIComponent(prompt)}`;
      const urls = [];
      for (let seed = 0; seed < 5; seed++) {
        urls.push(`${baseUrl}&seed=${seed}`);
      }

      const caption = "\n\n*> 'ɢᴇɴᴇʀᴀᴛᴇᴅ ʙʏ ǫᴜᴇᴇɴ ᴀᴅɪᴢᴀ ᴀɪ'*";

      for (const url of urls) {
        await Matrix.sendMessage(m.chat, {
          image: { url },
          caption,
        }, { quoted: m });
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      reply("*An error occurred while fetching images. Please try again later.*");
    }
  }
}, {
    command: ['hdvideo'],
    operate: async ({ m, reply, Matrix }) => {
      if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes('video')) {
        return reply('❌ Reply to a *video* to enhance it.');
      }

      const tempFolder = './temp';
      const inputPath = `${tempFolder}/input_${m.sender}.mp4`;
      const outputPath = `${tempFolder}/output_${m.sender}.mp4`;

      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }

      try {
        // React with hourglass emoji to indicate processing start
        await Matrix.sendMessage(m.chat, {
          react: { text: '⏳', key: m.key }
        });

        const media = await m.quoted.download();
        fs.writeFileSync(inputPath, media);

        console.log(`🎥 Enhancing video for ${m.sender}...`);

        // Faster FFmpeg command without minterpolate (which is slow)
        // Keeps brightness, contrast, saturation, and unsharp filters
        const ffmpegCmd = `ffmpeg -i ${inputPath} -vf "eq=brightness=0.1:contrast=1.2:saturation=1.3,unsharp=5:5:0.8" -c:a copy ${outputPath}`;

        exec(ffmpegCmd, async (err) => {
          if (err) {
            console.error('❌ FFmpeg Error:', err);
            await Matrix.sendMessage(m.chat, {
              react: { text: '❌', key: m.key }
            });
            return reply('❌ Error enhancing video.');
          }

          console.log(`✅ Video enhancement completed: ${outputPath}`);

          const enhancedVideo = fs.readFileSync(outputPath);

          await Matrix.sendMessage(
            m.chat,
            {
              video: enhancedVideo,
              mimetype: 'video/mp4',
              caption: '\n>🌹𝗤𝘂𝗲𝗲𝗻 𝗔𝗱𝗶𝘇𝗮🌹'
            },
            { quoted: m }
          );

          // React with checkmark emoji to indicate success
          await Matrix.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
          });

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
          console.log('🗑️ Temporary files deleted.');
        });
      } catch (error) {
        console.error('❌ Video Processing Error:', error);
        await Matrix.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        });
        reply('❌ Failed to process video.');
      }
    }
  },   { 
    command: ["tiktokaudio", "ttaudio"],
    operate: async ({
      m, // Message object
      args, // Command arguments (array)
      Matrix, // Your bot instance
      reply // Function to send a reply
    }) => {
      // React with 🎧 emoji when command is received
      await Matrix.sendMessage(m.chat, {
        react: { text: "🎧", key: m.key }
      });

      // Check if a TikTok URL was provided
      if (!args[0]) {
        await Matrix.sendMessage(m.chat, {
          react: { text: "❌", key: m.key }
        });
        return reply("*Please provide a TikTok video URL to extract audio!*");
      }

      const tiktokUrl = args[0];
      let filePath = ''; // To store path of downloaded audio file

      try {
        await showTyping(Matrix, m.chat); // Assuming showTyping is defined elsewhere
        const processingMsg = await reply(`🎧 *Extracting audio...* This might take a moment. ⏳`);
        console.log(`[TikTokAudio] Attempting to extract audio from: ${tiktokUrl}`);

        const apiUrl = `${TIKTOK_AUDIO_API_URL}${encodeURIComponent(tiktokUrl)}`;
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();

        // --- THE CRUCIAL CHANGE IS HERE ---
        // Expected structure: data.download.audio
        if (!data.success || !data.download || !data.download.audio) {
          await Matrix.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
          });
          // Provide more specific error if possible
          const errorMessage = data.message || (data.download && data.download.error) || 'Failed to get audio link from API response.';
          return reply(`*TikTok Audio API Error:* ${errorMessage} Please check the TikTok URL and try again. 🚫`);
        }

        await Matrix.sendMessage(m.chat, { text: "⬇️ *Downloading audio file...* 📥" }, { quoted: processingMsg });

        const audioDownloadUrl = data.download.audio; // <--- CORRECTED: Accessing data.download.audio
        const fileName = `tiktok_audio_${Date.now()}.mp3`;
        filePath = path.join(os.tmpdir(), fileName);

        const fileStreamResponse = await axios({
          method: 'get',
          url: audioDownloadUrl,
          responseType: 'stream'
        });

        if (fileStreamResponse.status !== 200) {
          throw new Error(`Failed to download audio from provided link. Status: ${fileStreamResponse.status}`);
        }

        const writer = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          fileStreamResponse.data.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const stats = fs.statSync(filePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        const maxFileSizeMB = 50; // Audio files are typically smaller, but set a limit
        if (fileSizeMB > maxFileSizeMB) {
          fs.unlinkSync(filePath);
          throw new Error(`Audio file too large (${fileSizeMB.toFixed(2)} MB). Max limit is ${maxFileSizeMB} MB.`);
        }

        await Matrix.sendMessage(m.chat, { text: `⬆️ *Uploading audio to WhatsApp...* 📤` }, { quoted: processingMsg });

        await Matrix.sendMessage(m.chat, {
          audio: fs.readFileSync(filePath),
          mimetype: 'audio/mpeg', // Correct mimetype for MP3
          fileName: fileName,
          caption: `✅ *TikTok Audio Extracted Successfully!* 🎶 Here is the audio from: *${tiktokUrl}*`,
        }, { quoted: m });

        await Matrix.sendMessage(m.chat, { react: { text: "✅", key: m.key } }); // Final success react
        console.log(`[TikTokAudio] Audio file sent: ${filePath}`);

      } catch (err) {
        console.error("[TikTokAudio] Error during audio download:", err);
        await Matrix.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        const errorMessage = `❌ *Error Occurred!* ⚠️ \n\`\`\`${err.message}\`\`\`\n\nCould not extract TikTok audio. Please ensure the URL is valid and try again.`;
        await reply(errorMessage);

      } finally {
        // Clean up the temporary file
        if (filePath && fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('[TikTokAudio] Failed to delete temporary audio file:', err);
            else console.log('[TikTokAudio] Temporary audio file deleted:', filePath);
          });
        }
      }
    }
  }

];