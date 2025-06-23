const fetch = require('node-fetch');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment-timezone');
const yts = require('yt-search');

module.exports = [  {
  command: ["dictionary"],
  operate: async ({
    Matrix: _0x52ad33,
    m: _0x236b21,
    reply: _0x4f3082,
    text: _0x1c5889
  }) => {
    if (!_0x1c5889) {
      return _0x4f3082("Ready to rumble with words? 💪📖  What word is puzzling you? 🤔 Let's conquer the dictionary! 📚⚔️ Tell me your word and let's see what we find! 🤩.");
    }
    try {
      const _0x498ddf = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + _0x1c5889);
      const _0x2e1bad = await _0x498ddf.json();
      if (!_0x2e1bad.length) {
        throw new Error();
      }
      const _0xc470c7 = _0x2e1bad[0].meanings[0].definitions.map((_0xe44f19, _0x8e13ba) => "*Definition " + (_0x8e13ba + 1) + ":* " + _0xe44f19.definition).join("\n\n");
      _0x52ad33.sendMessage(_0x236b21.chat, {
        text: "📖 *Definitions for:* " + _0x1c5889 + "\n\n" + _0xc470c7
      }, {
        quoted: _0x236b21
      });
    } catch (_0x1af231) {
      _0x4f3082("❌ No definition found for *" + _0x1c5889 + "*");
    }
  }
}, {
  command: ["dictionary2"],
  operate: async ({
    m: _0x3bef50,
    text: _0x558d73,
    Matrix: _0x27bb39,
    reply: _0x32ec02
  }) => {
    if (!_0x558d73) {
      return _0x32ec02("Hey there, word wizard! ✨ What word are you curious about today? 🤔 Let's dive into the dictionary! 📚📖  Tell me your word and let's have some fun! 🥳?");
    }
    try {
      const {
        data: _0x533b21
      } = await axios.get("http://api.urbandictionary.com/v0/define?term=" + _0x558d73);
      if (!_0x533b21.list.length) {
        throw new Error();
      }
      const _0x1eb6d6 = _0x533b21.list[0].definition.replace(/|/g, "");
      const _0x2e866c = _0x533b21.list[0].example.replace(/|/g, "");
      _0x27bb39.sendMessage(_0x3bef50.chat, {
        text: "📖 *Urban Definition of:* " + _0x558d73 + "\n\n*Definition:* " + _0x1eb6d6 + "\n\n*Example:* " + _0x2e866c
      }, {
        quoted: _0x3bef50
      });
    } catch (_0x357401) {
      _0x32ec02("❌ No definition found for *" + _0x558d73 + "*");
    }
  }
}, {
  command: ["tiktokinfo", "tiktokstalk", "ttstalk"],
  desc: "Fetch TikTok user profile details.",
  category: "search",
  react: "📱",
  filename: __filename,
  operate: async ({
    m: _0x4381e7,
    args: _0x377205,
    fetchJson: _0x15d24e,
    Matrix: _0x2bb4b0,
    reply: _0x49759b
  }) => {
    if (!_0x377205[0]) {
      await _0x2bb4b0.sendMessage(_0x4381e7.chat, {
        react: {
          text: "❌",
          key: _0x4381e7.key
        }
      });
      return _0x49759b("❎ Please provide a TikTok username.\n\n*Example:* .tiktokinfo mrbeast");
    }

    try {
      await _0x2bb4b0.sendMessage(_0x4381e7.chat, {
        react: {
          text: "⏳",
          key: _0x4381e7.key
        }
      });

      const _0x4e1b4d = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(_0x377205[0])}`;
      const _0x2b9f31 = await _0x15d24e(_0x4e1b4d);

      if (!_0x2b9f31.status) {
        await _0x2bb4b0.sendMessage(_0x4381e7.chat, {
          react: {
            text: "❌",
            key: _0x4381e7.key
          }
        });
        return _0x49759b("❌ User not found. Please check the username and try again.");
      }

      const _0x2ea997 = _0x2b9f31.data.user;
      const _0x1c184e = _0x2b9f31.data.stats;

      const _0x5c39a5 = `🎭 *TikTok Profile Stalker* 🎭

👤 *Username:* @${_0x2ea997.uniqueId}
📛 *Nickname:* ${_0x2ea997.nickname}
✅ *Verified:* ${_0x2ea997.verified ? "Yes ✅" : "No ❌"}
📍 *Region:* ${_0x2ea997.region}
📝 *Bio:* ${_0x2ea997.signature || "No bio available."}
🔗 *Bio Link:* ${_0x2ea997.bioLink?.link || "No link available."}

📊 *Statistics:*
👥 *Followers:* ${_0x1c184e.followerCount.toLocaleString()}
👤 *Following:* ${_0x1c184e.followingCount.toLocaleString()}
❤️ *Likes:* ${_0x1c184e.heartCount.toLocaleString()}
🎥 *Videos:* ${_0x1c184e.videoCount.toLocaleString()}

📅 *Account Created:* ${new Date(_0x2ea997.createTime * 1000).toLocaleDateString()}
🔒 *Private Account:* ${_0x2ea997.privateAccount ? "Yes 🔒" : "No 🌍"}

🔗 *Profile URL:* https://www.tiktok.com/@${_0x2ea997.uniqueId}
`;

      await _0x2bb4b0.sendMessage(_0x4381e7.chat, {
        image: { url: _0x2ea997.avatarLarger },
        caption: _0x5c39a5
      }, {
        quoted: _0x4381e7
      });

      await _0x2bb4b0.sendMessage(_0x4381e7.chat, {
        react: {
          text: "✅",
          key: _0x4381e7.key
        }
      });

    } catch (_0x3f85cc) {
      console.error("❌ TikTok stalk error:", _0x3f85cc);
      await _0x2bb4b0.sendMessage(_0x4381e7.chat, {
        react: {
          text: "❌",
          key: _0x4381e7.key
        }
      });
      _0x49759b("⚠️ An error occurred while fetching TikTok profile data.");
    }
  }
}, {
  command: ["check-apikey", "apikeystatus"],
  operate: async ({ m, text, reply }) => {
    if (!text) {
      return reply("Please provide your API key or a full API URL.\nExample:\n*.check-apikey MatrixZatKing*\n*.check-apikey https://api.nexoracle.com/check/apikey?apikey=MatrixZatKing*");
    }

    let url = "";
    if (text.includes("http")) {
      url = text.trim();
    } else {
      // If only API key is provided, use the API status checker
      url = `https://api.nexoracle.com/check/apikey?apikey=${encodeURIComponent(text.trim())}`;
    }

    try {
      const res = await axios.get(url);
      const data = res.data;

      if (!data || !data.result) {
        return reply("❌ Invalid or expired API key.");
      }

      let message = "🔍 *API Key Status:*\n\n";
      message += "👤 *Owner:* " + data.owner + "\n";
      message += "📛 *Username:* " + data.result.Username + "\n";
      message += "💳 *Plan:* " + data.result.Plan + "\n";
      message += "🔢 *API Limit:* " + data.result.Api_Limit + "\n";
      message += "📅 *Expiry Date:* " + data.result.Expirey_Date + "\n";
      message += "✅ *Message:* " + data.result.Message + "\n";

      reply(message);
    } catch (err) {
      console.error("API key check error:", err?.response?.data || err.message);
      reply("*An error occurred while checking the API key.*");
    }
  }
}, {
  command: ["domain-details"],
  operate: async ({ m, text, reply, Matrix }) => {
    try {
      const axios = require("axios");
      const domain = text.trim().toLowerCase();

      if (!domain || !/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(domain)) {
        return reply("*Invalid domain format.* Please enter a valid domain like \"example.com\"");
      }

      const url = `https://api.nexoracle.com/details/domain?apikey=MatrixZatKing&q=${encodeURIComponent(domain)}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data?.result) {
        return reply(`*No details found* for domain: "${domain}". It might not be available.`);
      }

      // Remove duplicates from the result array
      const uniqueSubdomains = [...new Set(data.result)];

      let message = `🔍 *Domain Details for:* "${domain}"\n\n`;
      message += "🌐 *Subdomains:*\n";

      if (uniqueSubdomains.length > 0) {
        uniqueSubdomains.forEach(subdomain => {
          message += `- ${subdomain}\n`;
        });
      } else {
        message += "No subdomains found.\n";
      }

      reply(message);
    } catch (err) {
      console.error("Error fetching domain details:", err);
      reply("*An error occurred* while fetching domain details. Please try again later.");
    }
  }
}, {
  command: ["wiki", "wikipedia"],
  operate: async ({ Matrix: sock, m, reply, text }) => {
    if (!text) return reply("*Please provide a search term*\nExample: .wiki Elon Musk");

    await sock.sendMessage(m.chat, {
      react: { text: "📚", key: m.key }
    });

    try {
      const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`);
      const data = res.data;

      if (data.extract) {
        let response = `*${data.title}*\n\n${data.extract}`;
        if (data.content_urls?.desktop?.page) {
          response += `\n\n🔗 More info: ${data.content_urls.desktop.page}`;
        }
        reply(response);
      } else {
        reply("*No results found on Wikipedia for:* " + text);
      }
    } catch (err) {
      console.error("Wikipedia error:", err.message);
      reply("*Failed to fetch from Wikipedia. Try again later.*");
    }
  }
}, {
  command: ["lyrics"],
  operate: async ({
    m: _0x43c434,
    text: _0xd760ca,
    Matrix: _0xa8cd1,
    reply: _0x353bbc
  }) => {
    if (!_0xd760ca) {
      return _0x353bbc("Provide a song name.");
    }
    try {
      const _0x5aa356 = "https://xploader-api.vercel.app/lyrics?query=" + encodeURIComponent(_0xd760ca);
      const _0x87b88 = await fetch(_0x5aa356);
      const _0x149136 = await _0x87b88.json();
      if (!_0x149136.length || !_0x149136[0].song || !_0x149136[0].artist || !_0x149136[0].lyrics) {
        throw new Error();
      }
      _0xa8cd1.sendMessage(_0x43c434.chat, {
        text: "🎵 *Lyrics for:* " + _0x149136[0].song + " - " + _0x149136[0].artist + "\n\n" + _0x149136[0].lyrics
      }, {
        quoted: _0x43c434
      });
    } catch (_0x2077ed) {
      console.error("❌ Unable to fetch lyrics:", _0x2077ed);
      _0x353bbc("❌ Unable to fetch lyrics.");
    }
  }
}, {
  command: ["lyrics2"],
  operate: async ({ m, text, Matrix, reply }) => {
    if (!text) {
      return reply("Provide a song name.");
    }
    try {
      const apiUrl = `https://api.popcat.xyz/lyrics?song=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unable to parse error response" }));
        return reply(`API request failed with status ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      if (!data.title || !data.artist || !data.lyrics) {
        return reply("Lyrics not found for this song."); //Handle cases where the API doesn't find lyrics
      }

      const lyrics = `🎵 *Lyrics for:* ${data.title} - ${data.artist}\n\n${data.lyrics}`;
      Matrix.sendMessage(m.chat, { text: lyrics }, { quoted: m });
    } catch (error) {
      console.error("❌ Unable to fetch lyrics:", error);
      reply("❌ Unable to fetch lyrics.");
    }
  }
},  {
    command: ['imdb', 'movie'],
    operate: async ({ Matrix, m, reply, text }) => {
      if (!text) return reply("Provide a movie or series name.");
      
      try {
        const { data } = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`);
        if (data.Response === "False") throw new Error();

        const imdbText = `🎬 *IMDB SEARCH*\n\n`
          + `*Title:* ${data.Title}\n*Year:* ${data.Year}\n*Rated:* ${data.Rated}\n`
          + `*Released:* ${data.Released}\n*Runtime:* ${data.Runtime}\n*Genre:* ${data.Genre}\n`
          + `*Director:* ${data.Director}\n*Actors:* ${data.Actors}\n*Plot:* ${data.Plot}\n`
          + `*IMDB Rating:* ${data.imdbRating} ⭐\n*Votes:* ${data.imdbVotes}`;

        Matrix.sendMessage(m.chat, { image: { url: data.Poster }, caption: imdbText }, { quoted: m });
      } catch (error) {
        reply("❌ Unable to fetch IMDb data.");
      }
    }
  }, {
  command: ['lyrics'],
  operate: async ({ m, text, Matrix, reply }) => {
    if (!text) return reply("Provide a song name.");
    
    try {
      const apiUrl = `https://xploader-api.vercel.app/lyrics?query=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.length || !result[0].song || !result[0].artist || !result[0].lyrics) throw new Error();

      Matrix.sendMessage(m.chat, {
        text: `🎵 *Lyrics for:* ${result[0].song} - ${result[0].artist}\n\n${result[0].lyrics}`
      }, { quoted: m });
    } catch (error) {
      console.error('❌ Unable to fetch lyrics:', error);
      reply("❌ Unable to fetch lyrics.");
    }
  }
}, {
  command: ["sticker-search"],
  operate: async ({ Matrix: David, m, reply, text }) => {
    if (!text) return reply('Enter the theme!');

    try {
      const response = await fetch('https://endpoint.web.id/search/sticker?key=gojou&query=' + encodeURIComponent(text));
      const tick = await response.json();

      if (tick.status) {
        const result = tick.result;
        let responseMessage = `*Title:* ${result.title}\n*Author:* ${result.author}\n*Author Link:* ${result.author_link}\n\n*Stickers:*\n`;

        result.sticker.forEach((stickerUrl, index) => {
          responseMessage += `Sticker ${index + 1}: ${stickerUrl}\n`;
        });

        reply(responseMessage);
      } else {
        reply('No results found.');
      }
    } catch (error) {
      console.error("Error fetching sticker search results:", error);
      reply('There was an error!');
    }
  }
}, {
  command: ["githubuser"],
  operate: async ({ Matrix, m, reply, args }) => {
    const username = args[0];
    if (!username) {
      return reply(
        "🚫 *Queen Adiza* 🚫\nPlease provide a GitHub username!\n\n_Scripted By Matrix_"
      );
    }

    try {
      await Matrix.sendMessage(m.chat, {
        text: "🔍 *🌹Queen Adiza🌹* is fetching GitHub data...",
      });

      const url = `https://api.github.com/users/${encodeURIComponent(username)}`;
      const res = await fetch(url);

      if (res.status === 404) {
        return reply("❌ User not found!\n\n_Queen Adiza | Matrix_");
      }
      if (!res.ok) {
        throw new Error("API Error: " + res.status);
      }

      const data = await res.json();

      const message = `
*💎 Queen Adizatu - GitHub Profile Search*

👤 *Name:* ${data.name || "Not provided"}
📌 *Username:* @${data.login}
🔗 *Profile:* ${data.html_url}
📝 *Bio:* ${data.bio || "No bio available"}

📊 *Stats:*
┣✦ Repos: ${data.public_repos}
┣✦ Gists: ${data.public_gists}
┣✦ Followers: ${data.followers}
┗✦ Following: ${data.following}

🏢 *Details:*
┣✦ Company: ${data.company || "None"}
┣✦ Location: ${data.location || "Not specified"}
┗✦ Created: ${new Date(data.created_at).toLocaleDateString()}

_⌛ Queen Adiza | Powered by Matrix_
      `.trim();

      reply(message);
    } catch (error) {
      reply(`❌ *Error!*\n${error.message}\n\n_Queen Adiza | Matrix-X-King_`);
    }
  }
}, {
  command: ["adiza-file"],
  operate: async ({ Matrix, m, reply }) => {
    const owner = "Matrix1999";
    const repo = "Queen-Adiza";
    const branch = "main";
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;

    try {
      await reply(`📦 Downloading ZIP file from ${owner}/${repo}...`);

      const response = await fetch(zipUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();

      await Matrix.sendMessage(m.chat, {
        document: Buffer.from(buffer),
        mimetype: "application/zip",
        fileName: `${repo}-${branch}.zip`
      }, { quoted: m });

      await reply("✅ ZIP file has been successfully sent!");
    } catch (err) {
      await reply("❌ Error downloading or sending ZIP file: " + err.message);
    }
  }
}, {
  command: ["gitlist"],
  operate: async ({ Matrix, m, reply, args }) => {
    const username = args[0];
    if (!username) {
      return reply(
        `🤖 *Queen Adiza AI* says:\n❌ Provide a GitHub username!\nExample:\n.gitlist Matrix1999`
      );
    }

    const apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}/repos`;

    try {
      const res = await fetch(apiUrl);
      const repos = await res.json();

      if (res.status === 404 || !Array.isArray(repos) || repos.length === 0) {
        return reply(`❌ No repositories found for *${username}*.`);
      }

      let message = `📜 *Repositories of ${username}*\n\n`;
      repos.slice(0, 5).forEach((repo, index) => {
        message += `🔹 ${index + 1}. *${repo.name}*\n   🔗 ${repo.html_url}\n`;
      });

      reply(message);
    } catch (error) {
      reply("❌ Failed to fetch repository list.");
    }
  }
}, {
  command: ["gitdownload"],
  operate: async ({ Matrix, m, reply, args }) => {
    const repoUrl = args[0];
    if (!repoUrl) {
      return reply(
        `🤖 *Queen Adiza AI* says:\n❌ Provide a GitHub repository link!\nExample:\n.gitdownload https://github.com/Matrix1999/Queen-Adiza`
      );
    }

    // Extract owner and repo from the URL
    const match = repoUrl.match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i);
    let owner, repo;
    if (match) {
      [, owner, repo] = match;
    }
    if (!owner || !repo) {
      return reply("❌ Invalid GitHub repository URL.");
    }
    repo = repo.replace(/.git$/, "").replace(/\/$/, "");

    const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;

    try {
      // Get the filename from the Content-Disposition header
      const headRes = await fetch(zipUrl, { method: "HEAD" });
      if (!headRes.ok) {
        throw new Error("GitHub request failed with status " + headRes.status);
      }
      const disposition = headRes.headers.get("content-disposition");
      let fileName = repo + ".zip";
      if (disposition) {
        const matchFile = disposition.match(/attachment; filename=(.*)/);
        if (matchFile) {
          fileName = matchFile[1] + ".zip";
        }
      }

      // Send the ZIP file as a document
      await Matrix.sendMessage(m.chat, {
        document: { url: zipUrl },
        fileName: fileName,
        mimetype: "application/zip"
      }, { quoted: m });

      reply("✅ Repository ZIP sent successfully!");
    } catch (error) {
      reply("❌ Failed to download repository.\n" + error.message);
    }
  }
}, {
  command: ["user"],
  operate: async ({ reply, db }) => {
    try {
      const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      const totalUsers = await db.collection('users').countDocuments();
      const activeUsers = await db.collection('users').countDocuments({ lastActive: { $gte: recentDate } });
      const newUsers = await db.collection('users').countDocuments({ createdAt: { $gte: recentDate } });
      const failures = await db.collection('errors').countDocuments({ date: { $gte: recentDate } });

      // Placeholder: implement your own logic to get currently connected users
      const connectedUsers = 0;

      const message = `
🚀 **User Stats Overview** 🚀

📊 **Total Users:** ${totalUsers}
👑 **Active Users (last 7 days):** ${activeUsers}
🆕 **New Users (last 7 days):** ${newUsers}
❌ **Total Failures:** ${failures}
🌐 **Currently Connected Users:** ${connectedUsers}

❤️‍🔥 *Created by MATRIX* 🚀
      `.trim();

      reply(message);
    } catch (error) {
      console.error(error);
      reply("⚠️ An error occurred while fetching user stats. Please try again later.");
    }
  }
}, {
  command: ["ram"],
  operate: async ({ reply }) => {
    try {
      const memoryUsage = process.memoryUsage();
      const heapTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
      const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      const rssMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);

      const message = `
*QUEEN ADIZA AI RAM*
🧠 *Memory Usage:* 
🔹 *Heap Total:* ${heapTotalMB} MB
🔹 *Heap Used:* ${heapUsedMB} MB
🔹 *RSS (Total Memory):* ${rssMB} MB

💥 *Performance:* 
🌟 All systems running smoothly!

⚡ *Powered by Matrix*
      `.trim();

      reply(message);
    } catch (error) {
      console.error("Error fetching memory usage:", error);
      reply("⚠️ An error occurred while fetching the memory usage. Please try again later.");
    }
  }
}, {
    command: ['weather'],
    operate: async ({ Matrix, m, reply, text }) => {
      if (!text) return reply("Provide a location.");

      try {
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
        
        const weatherInfo = `🌤️ *Weather for ${text}*\n\n`
          + `🌡️ *Temperature:* ${data.main.temp}°C (Feels like ${data.main.feels_like}°C)\n`
          + `🌪️ *Weather:* ${data.weather[0].main} - ${data.weather[0].description}\n`
          + `💨 *Wind Speed:* ${data.wind.speed} m/s\n`
          + `📍 *Coordinates:* ${data.coord.lat}, ${data.coord.lon}\n`
          + `🌍 *Country:* ${data.sys.country}`;

        Matrix.sendMessage(m.chat, { text: weatherInfo }, { quoted: m });
      } catch (error) {
        reply("❌ Unable to fetch weather data.");
      }
    }
  }, {
  command: ["searchrepo"],
  operate: async ({ Matrix, m, reply, args }) => {
    const query = args.join(" ").trim();
    if (!query) {
      return reply(
        "🚫 *Queen Adiza AI*\nPlease provide a search term!\nExample: .searchrepo whatsapp bot\n\n_Dev: Matrix"
      );
    }

    try {
      await Matrix.sendMessage(m.chat, {
        text: "🔎 *Queen Adiza AI* is searching GitHub...",
      });

      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("API Error: " + res.status);
      }

      const data = await res.json();

      if (data.total_count === 0) {
        return reply(
          "🔍 *No repositories found!*\nTry different keywords.\n\n_Queen Adiza Bot | Matrix_"
        );
      }

      const repo = data.items[0];
      const message = `
*📦 Queen Adiza AI - Repository Found*

🎯 *Name:* ${repo.name}
👑 *Owner:* ${repo.owner.login}
⭐ *Stars:* ${repo.stargazers_count}
🍴 *Forks:* ${repo.forks_count}
🔗 *URL:* ${repo.html_url}

📝 *Description:*
${repo.description || "No description available"}

📅 *Last Updated:* ${new Date(repo.updated_at).toLocaleDateString()}
🌐 *Language:* ${repo.language || "Not specified"}

_💻 Queen Adiza AI Beta | Scripted by Matrix_
      `.trim();

      reply(message);
    } catch (error) {
      reply(
        `❌ *Search Failed!*\n${error.message}\n\n_Queen Adiza AI Beta | Matrix_`
      );
    }
  }
}, {
  command: ["gitsearch"],
  operate: async ({ Matrix, m, reply, args, prefix }) => {
    if (!args[0]) {
      return reply(
        `🤖 *Queen Adiza AI* says:\n❌ Provide a search query!\nExample:\n${prefix}gitsearch AI chatbot`
      );
    }

    const query = encodeURIComponent(args.join(" "));
    const webUrl = `https://github.com/search?q=${query}&type=repositories`;
    const apiUrl = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=3`;

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (res.status !== 200 || !data.items || data.items.length === 0) {
        throw new Error("No repositories found for this query.");
      }

      const resultsText = data.items
        .map(
          (repo, i) =>
            `🔹 *${i + 1}. ${repo.name}*\n` +
            `👤 *Owner:* ${repo.owner.login}\n` +
            `⭐ *Stars:* ${repo.stargazers_count}\n` +
            `🍴 *Forks:* ${repo.forks_count}\n` +
            `📝 *Description:* ${repo.description || "No description"}\n` +
            `🔗 *Repo URL:* ${repo.html_url}`
        )
        .join("\n\n");

      reply(
        `🔍 *GitHub Repository Search Results for:* _"${args.join(" ")}"_\n\n` +
          resultsText +
          `\n\n🌍 *See more results:* [Click here](${webUrl})`
      );
    } catch (error) {
      reply(`❌ Error fetching GitHub search results!\n${error.message}`);
    }
  }
}, {
  command: ["gitreadme"],
  operate: async ({ Matrix, m, reply, args, prefix }) => {
    const repoUrl = args[0];
    if (!repoUrl) {
      return reply(
        `🤖 *Queen Adiza* says:\n❌ Provide a valid GitHub repository link!\nExample:\n${prefix}gitreadme https://github.com/Matrix1999/Queen-Adiza`
      );
    }

    // Regex to extract owner and repo from GitHub URL
    const match = repoUrl.match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/([^\/:]+)(?:.git)?/i);
    if (!match) {
      return reply("❌ Invalid GitHub repository URL!");
    }

    const [, owner, repo] = match;
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;

    try {
      const res = await fetch(readmeUrl);
      const text = await res.text();

      if (res.status !== 200) {
        throw new Error("README file not found or unavailable.");
      }

      reply(
        `📖 *README for ${repo}*\n\n${text.substring(0, 4000)}\n\n🔗 *Full README:* [Click here](${readmeUrl})`
      );
    } catch (error) {
      reply(`❌ Error fetching README!\n${error.message}`);
    }
  }
}, {
  command: ["repostats"],
  operate: async ({ Matrix, m, reply }) => {
    try {
      const repoApiUrl = "https://api.github.com/repos/Matrix1999/Queen-Adiza";
      const res = await fetch(repoApiUrl);

      if (!res.ok) {
        throw new Error("API Error: " + res.status);
      }

      const data = await res.json();

      const message = `
*📊 Queen Adiza AI - Repository Stats*

📌 *Repository:* ${data.full_name}
⭐ *Stars:* ${data.stargazers_count}
🍴 *Forks:* ${data.forks_count}
👀 *Watchers:* ${data.watchers_count}

📅 *Created:* ${new Date(data.created_at).toLocaleDateString()}
🔄 *Last Push:* ${new Date(data.pushed_at).toLocaleDateString()}

🔗 *URL:* ${data.html_url}
📝 *Description:* ${data.description || "No description"}

_⚡ Current Version: 2.1.0 | Developed by Matrix_
      `.trim();

      reply(message);
    } catch (error) {
      reply(
        `❌ Couldn't fetch repo stats!\n${error.message}\n\n_Queen Adiza_`
      );
    }
  }
}, {
  command: ["gitcommit"],
  operate: async ({ Matrix, m, reply }) => {
    try {
      const apiUrl = "https://api.github.com/repos/Matrix1999/Queen-Adiza/commits/main";
      const res = await fetch(apiUrl);

      if (!res.ok) {
        throw new Error("API Error: " + res.status);
      }

      const commit = await res.json();

      const message = `
📌 *Latest Commit:*
┣✦ *Author:* ${commit.commit.author.name}
┣✦ *Message:* ${commit.commit.message}
┣✦ *Date:* ${new Date(commit.commit.author.date).toLocaleString()}
┗✦ *Hash:* ${commit.sha.substring(0, 7)}

🔗 *URL:* ${commit.html_url}

_💾 Queen Adiza | Developer: Matrix_
      `.trim();

      reply(message);
    } catch (error) {
      reply(`❌ Failed to fetch commit!\n${error.message}`);
    }
  }
}, {
  command: ["repofiles"],
  operate: async ({ Matrix, m, reply }) => {
    try {
      const apiUrl = "https://api.github.com/repos/Matrix1999/Queen-Adiza/contents/";
      const res = await fetch(apiUrl);

      if (!res.ok) {
        throw new Error("API Error: " + res.status);
      }

      const files = await res.json();

      if (!Array.isArray(files) || files.length === 0) {
        return reply("❌ No files found in the repository.");
      }

      let message = "📂 *Repository Files:*\n";
      files.forEach(file => {
        message += `┣✦ ${file.name} (${file.type})\n`;
      });
      message += `\n_🔍 Total Files: ${files.length}_\n\n_💻 Queen Adiza AI | Matrid`;

      reply(message);
    } catch (error) {
      reply(`❌ Failed to fetch files!\n${error.message}`);
    }
  }
}, {
    command: ['yts', 'ytsearch'],
    operate: async ({ Matrix, m, reply, text, prefix, command }) => {
      if (!text) return reply(`📌 *Example: ${prefix + command} Eminem Godzilla*`);

      try {
        const searchResults = await yts(text);
        if (!searchResults.all.length) return reply("❌ *No YouTube results found.*");

        let responseText = `🎥 *YouTube Search Results for:* ${text}\n\n`;
        searchResults.all.slice(0, 10).forEach((video, index) => {
          responseText += `□ *${index + 1}.* ${video.title}\n□ *Uploaded:* ${video.ago}\n□ *Views:* ${video.views}\n□ *Duration:* ${video.timestamp}\n□ *URL:* ${video.url}\n\n─────────────────\n\n`;
        });

        await Matrix.sendMessage(
          m.chat,
          { image: { url: searchResults.all[0].thumbnail }, caption: responseText },
          { quoted: m }
        );
      } catch (error) {
        console.error("YT Search command failed:", error);
        reply("❌ *An error occurred while fetching YouTube search results.*");
      }
    }
  }
];