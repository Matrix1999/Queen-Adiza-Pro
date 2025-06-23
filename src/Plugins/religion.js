const fetch = require('node-fetch'); 

module.exports = [ {
  command: ['bible'],
  operate: async ({ m, text, prefix, command, reply }) => {
    const BASE_URL = "https://bible-api.com";

    try {
      let chapterInput = text.split(" ").join("").trim();
      if (!chapterInput) {
        throw new Error(`*Please specify the chapter number or name. Example: ${prefix + command} John 3:16*`);
      }
      chapterInput = encodeURIComponent(chapterInput);
      let chapterRes = await fetch(`${BASE_URL}/${chapterInput}`);
      if (!chapterRes.ok) {
        throw new Error(`*Please specify the chapter number or name. Example: ${prefix + command} John 3:16*`);
      }
      
      let chapterData = await chapterRes.json();
      let bibleChapter = `
*The Holy Bible*\n
*Chapter ${chapterData.reference}*\n
Type: ${chapterData.translation_name}\n
Number of verses: ${chapterData.verses.length}\n
*Chapter Content:*\n
${chapterData.text}\n`;
      
      reply(bibleChapter);
    } catch (error) {
      reply(`Error: ${error.message}`);
    }
  }
}, {
  command: ["torah"],
  operate: async ({ reply, args }) => {
    const reference = args.join(" ");
    if (!reference) {
      return reply("Please provide a reference (e.g., *Genesis 1:1*).");
    }

    try {
      // Sefaria expects references with spaces replaced by dots
      const apiUrl = "https://www.sefaria.org/api/texts/" + reference.replace(/\s/g, ".");
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.text) {
        const text = Array.isArray(data.text) ? data.text.join("\n") : data.text;
        reply(`✡ *Torah* 🔯\n*${reference}*\n\n${text}`);
      } else {
        reply("Verse not found. Try: *!torah Genesis 1:1*");
      }
    } catch (error) {
      console.error("Torah API Error:", error);
      reply("Failed to fetch. Check the reference.");
    }
  }
}, {
  command: ["gita", "gita-verse", "bhagavatgita"],
  operate: async ({
    m,
    reply,
    baileys // Replace with the actual name of your Baileys instance
  }) => {
    try {
      let verseNumber = m.text.split(' ')[1];
      if (!verseNumber || isNaN(verseNumber)) {
        verseNumber = Math.floor(Math.random() * 700) + 1;
      }
      const res = await fetch(`https://gita-api.vercel.app/odi/verse/${verseNumber}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          `API request failed with status ${res.status} and message: ${error.detail?.[0]?.msg || error.message}`
        );
      }
      const json = await res.json();
      const gitaVerse = `
🕉 *Bhagavad Gita: Sacred Teachings*\n
📜 *Chapter ${json.chapter_no}: ${json.chapter_name}*\n
Verse ${json.verse_no}:\n
" ${json.verse} "\n
*🔮 Translation:*\n
${json.translation}\n
*🧘‍♂️ Spiritual Insight (Purport):*\n
${json.purport}`;
      reply(gitaVerse);
      //Audio sending removed
    } catch (error) {
      console.error(error);
      reply("Error: " + error.message);
    }
  }
}, {
  command: ['quran'],
  operate: async ({ m, text, Xploader, reply }) => {
    try {
      let surahInput = text.split(" ")[0];
      if (!surahInput) {
        throw new Error(`*Please specify the surah number or name*`);
      }
      
      let surahListRes = await fetch("https://quran-endpoint.vercel.app/quran");
      let surahList = await surahListRes.json();
      let surahData = surahList.data.find(
        (surah) =>
          surah.number === Number(surahInput) ||
          surah.asma.ar.short.toLowerCase() === surahInput.toLowerCase() ||
          surah.asma.en.short.toLowerCase() === surahInput.toLowerCase()
      );
      
      if (!surahData) {
        throw new Error(`Couldn't find surah with number or name "${surahInput}"`);
      }
      
      let res = await fetch(`https://quran-endpoint.vercel.app/quran/${surahData.number}`);
      if (!res.ok) {
        let error = await res.json();
        throw new Error(`API request failed with status ${res.status} and message ${error.message}`);
      }

      let json = await res.json();
      let quranSurah = `
*Quran: The Holy Book*\n
*Surah ${json.data.number}: ${json.data.asma.ar.long} (${json.data.asma.en.long})*\n
Type: ${json.data.type.en}\n
Number of verses: ${json.data.ayahCount}\n
*Explanation:*\n
${json.data.tafsir.id}`;
      
      reply(quranSurah);

      if (json.data.recitation.full) {
        await Xploader.sendMessage(
          m.chat,
          {
            audio: { url: json.data.recitation.full },
            mimetype: "audio/mp4",
            ptt: true,
            fileName: `recitation.mp3`,
          },
          { quoted: m }
        );
      }
    } catch (error) {
      reply(`Error: ${error.message}`);
    }
  }
},
];