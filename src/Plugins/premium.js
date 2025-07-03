const axios = require('axios');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const os = require('os'); 


// Define your API URLs
const CLOUDFLARE_API_URL = 'https://adiza-webcloner.matrixzat99.workers.dev/?url=';

const VERCEL_API_URL = 'https://adiza-web-to-zip.vercel.app/api/zip?url=';
 
 
// --- NEW: Array of Webclone Photo Links ---
const webclonePhotoLinks = [
  'https://i.ibb.co/PvJwL8CL/alan.jpg',
  'https://i.ibb.co/vvs2jkPt/source.jpg',
  'https://i.ibb.co/qHQPbLX/hub.jpg'
];

// --- Helper Functions ---

const showTyping = async (Matrix, chatId) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
};

const sendMessageWithImage = async ({ Matrix, m, imageUrl, caption, extraOptions = {} }) => {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        const messageOptions = {
            image: buffer,
            caption: caption,
            ...extraOptions
        };

        await Matrix.sendMessage(m.chat, messageOptions, { quoted: m });
        console.log('Image and caption sent successfully.');
    } catch (error) {
        console.error('Error sending image message:', error);
        await Matrix.sendMessage(m.chat, { text: 'Failed to send details. Please try again later.' }, { quoted: m });
    }
};

// --- Command Definitions ---

module.exports = [
    {
        command: ['netflix'],
        operate: async ({
            Matrix: MatrixInstance,
            m,
            reply,
            text
        }) => {
            const userId = m.sender;
                        

            await MatrixInstance.sendMessage(m.chat, { react: { text: "🍿", key: m.key } });
            await showTyping(MatrixInstance, m.chat);
            console.log('Netflix command received for WhatsApp display...');

            const imageUrls = [
                'https://files.catbox.moe/2cej96.jpg',
                'https://files.catbox.moe/ad4tht.png'
            ];
            const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
            const netflixDetails = `
╔═════ ≪ 🔮 ≫ ═════╗
❤️‍🔥🍿 *N E T F L I X* 🍿❤️‍🔥
╚═════ ≪ •❈• ≫ ═════╝
💎✨ *P R E M I U M* ✨💎

📧 *Email:* \`adizaqueen399@gmail.com\`
🔐 *Password:* \`Ghana@2025\`

🎬🍿✨𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀✨🍿🎬

📺 𝟰𝗞 𝗨𝗛𝗗 🌟
⬇️ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗦 💾
🌐 𝗔𝗰𝗰𝗲𝘀𝘀 𝗔𝗹𝗹 𝗖𝗼𝗻𝘁𝗲𝗻𝘁 🌍
📱𝟲 𝗗𝗲𝘃𝗶𝗰𝗲𝘀 𝗦𝗮𝗺𝗲 𝗧𝗶𝗺𝗲 ⌚

⚠️🛑 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁 𝗡𝗼𝘁𝗶𝗰𝗲 🛑⚠️

✅ 𝗬𝗼𝘂 𝗰𝗮𝗻 𝗟𝗼𝗴𝗶𝗻 𝘄𝗶𝘁𝗵 𝘆𝗼𝘂𝗿 𝗹𝗼𝗰𝗮𝗹 𝗻𝗲𝘁𝘄𝗼𝗿𝗸. 𝗧𝗼 𝘄𝗮𝘁𝗰𝗵 𝗺𝗼𝘃𝗶𝗲𝘀 𝗷𝘂𝘀𝘁 𝘀𝘄𝗶𝘁𝗰𝗵 𝘁𝗼 𝗮𝗻𝘆 𝗡𝗶𝗴𝗲𝗿𝗶𝗮𝗻 𝘃𝗽𝗻.
`;
            await sendMessageWithImage({ Matrix: MatrixInstance, m, imageUrl: randomImageUrl, caption: netflixDetails });
            console.log('Netflix photo and details sent with copyable logins and new emojis.');
        }
 },  {
            command: ['canvapro', 'canva'],
        operate: async ({
            Matrix: MatrixInstance,
            m,
            reply,
            text
        }) => {
            const userId = m.sender;

            await MatrixInstance.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });
            await showTyping(MatrixInstance, m.chat);
            console.log('Canva Pro command received...');

            const canvaImageUrls = [
                'https://files.catbox.moe/vud8va.jpg',
                'https://files.catbox.moe/ujh5sf.jpg',
                'https://files.catbox.moe/lv4ayl.jpg'
            ];
            const randomCanvaImageUrl = canvaImageUrls[Math.floor(Math.random() * canvaImageUrls.length)];
            const canvaDetails = `
🎨✨𝗖𝗮𝗻𝘃𝗮 𝗣𝗿𝗼 𝗔𝗰𝗰𝗼𝘂𝗻𝘁✨

🎉 We’re excited to inform you that your Canva Pro account has been successfully activated! You now have full access to premium features to elevate your design experience!

📧 *Email:* \`adizaqueen399@gmail.com\`

Verification Code: If a verification code is required during login, please DM @Matrixxxxxxxxx (Telegram).

---
⚠️ *Important Note:*
Do not invite anyone as a team member. Any breach of this policy may lead to immediate account deactivation and a permanent ban from the service.
---

🙏 Thank you for choosing Queen Adiza Bot. We're here to support you on your creative journey with Canva Pro!
`;
            await sendMessageWithImage({ Matrix: MatrixInstance, m, imageUrl: randomCanvaImageUrl, caption: canvaDetails });
            console.log('Canva Pro photo and details sent.');
        }
 },
    {
        command: ['primevideo', 'prime'],
        operate: async ({
            Matrix: MatrixInstance,
            m,
            reply,
            text
        }) => {
            const userId = m.sender;
            
            await MatrixInstance.sendMessage(m.chat, { react: { text: "🎬", key: m.key } });
            await showTyping(MatrixInstance, m.chat);
            console.log('Prime Video command received...');

            const primeVideoImageUrls = [
                'https://files.catbox.moe/35ng2o.png',
                'https://files.catbox.moe/7m2gid.jpeg'
            ];
            const randomPrimeVideoImageUrl = primeVideoImageUrls[Math.floor(Math.random() * primeVideoImageUrls.length)];
            const downloadLink = 'https://www.mediafire.com/file/41l5o85ifyjdohi/Prime_Video_VIP.apk/file';
            const combinedPrimeVideoMessage = `
╔═════ ≪ •❈• ≫ ═════╗
🎬🔮 𝗣𝗥𝗜𝗠𝗘 𝗩𝗜𝗗𝗘𝗢 🔮🎬
╚═════ ≪ •❈• ≫ ═════╝

💎✨ *P R E M I U M* ✨💎

📧 *Download App:* 📧
(${downloadLink})

✨ *Features* ✨
📺 High Quality Streaming 🌟
⬇️ Downloads 💾
🌐 Prime Video Library 🌍
📱Multiple Device Support ⌚

𝗣𝗿𝗶𝗺𝗲 𝗩𝗶𝗱𝗲𝗼 𝗼𝗳𝗳𝗲𝗿𝘀 𝗮 𝘃𝗮𝘀𝘁 𝗰𝗼𝗹𝗹𝗲𝗰𝘁𝗶𝗼𝗻 𝗼𝗳 𝗺𝗼𝘃𝗶𝗲𝘀, 𝗧𝗩 𝘀𝗵𝗼𝘄𝘀, 𝗮𝗻𝗱 𝗔𝗺𝗮𝘇𝗼𝗻 𝗢𝗿𝗶𝗴𝗶𝗻𝗮𝗹𝘀, 𝗽𝗿𝗼𝘃𝗶𝗱𝗶𝗻𝗴 𝗽𝗿𝗲𝗺𝗶𝘂𝗺 𝗲𝗻𝘁𝗲𝗿𝘁𝗮𝗶𝗻𝗺𝗲𝗻𝘁 𝗮𝘁 𝘆𝗼𝘂𝗿 𝗳𝗶𝗻𝗴𝗲𝗿𝘁𝗶𝗽𝘀. 𝗘𝗻𝗷𝗼𝘆 𝗵𝗶𝗴𝗵-𝗾𝘂𝗮𝗹𝗶𝘁𝘆 𝘀𝘁𝗿𝗲𝗮𝗺𝗶𝗻𝗴, 𝗼𝗳𝗳𝗹𝗶𝗻𝗲 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝘀, 𝗮𝗻𝗱 𝗮𝗰𝗰𝗲𝘀𝘀 𝘁𝗼 𝗲𝘅𝗰𝗹𝘂𝘀𝗶𝘃𝗲 𝗰𝗼𝗻𝘁𝗲𝗻𝘁. 𝗜𝗺𝗺𝗲𝗿𝘀𝗲 𝘆𝗼𝘂𝗿𝘀𝗲𝗹𝗳 𝗶𝗻 𝗮 𝗱𝗶𝘃𝗲𝗿𝘀𝗲 𝗹𝗶𝗯𝗿𝗮𝗿𝘆 𝗼𝗳 𝗴𝗲𝗻𝗿𝗲𝘀, 𝗳𝗿𝗼𝗺 𝗯𝗹𝗼𝗰𝗸𝗯𝘂𝘀𝘁𝗲𝗿 𝗳𝗶𝗹𝗺𝘀 𝘁𝗼 𝗰𝗿𝗶𝘁𝗶𝗰𝗮𝗹𝗹𝘆 𝗮𝗰𝗰𝗹𝗮𝗶𝗺𝗲𝗱 𝘀𝗲𝗿𝗶𝗲𝘀, 𝗮𝗹𝗹 𝗱𝗲𝘀𝗶𝗴𝗻𝗲𝗱 𝗳𝗼𝗿 𝘆𝗼𝘂𝗿 𝘃𝗶𝗲𝘄𝗶𝗻𝗴 𝗽𝗹𝗲𝗮𝘀𝘂𝗿𝗲.

🌹💎🌹💎🌹💎🌹💎🌹
`;
            await sendMessageWithImage({ Matrix: MatrixInstance, m, imageUrl: randomPrimeVideoImageUrl, caption: combinedPrimeVideoMessage });

  }
}, {
        command: ['startimes'],
        operate: async ({
            Matrix: MatrixInstance,
            m,
            reply,
            text
        }) => {
            const userId = m.sender;
            
            await MatrixInstance.sendMessage(m.chat, { react: { text: "📺", key: m.key } }); // Changed reaction emoji for StarTimes
            await showTyping(MatrixInstance, m.chat);
            console.log('StarTimes command received...');

            const startimesImageUrl = 'https://i.ibb.co/sdHmRxhV/1200x630wa.png'; // Direct link to the provided image
            const downloadLink = 'https://www.mediafire.com/file/wmsjckz04qtp4ed/StarTimes.apk/file'; // Provided MediaFire link
            const combinedStartimesMessage = `
╔═════ ≪ •❈• ≫ ═════╗
📊✨ 𝗦𝗧𝗔𝗥𝗧𝗜𝗠𝗘𝗦 ✨📊
╚═════ ≪ •❈• ≫ ═════╝

💎✨ *P R E M I U M* ✨💎

📧 *Download App:* 📧
(${downloadLink})

✨ *Features* ✨
📺 Live TV Channels 🌟
⚽ Sports & Movies 🎬
🌐 On-Demand Content 🌍
📱Multiple Device Support ⌚

💠𝗦𝘁𝗮𝗿𝗧𝗶𝗺𝗲𝘀 𝗼𝗳𝗳𝗲𝗿𝘀 𝗮 𝗰𝗼𝗺𝗽𝗿𝗲𝗵𝗲𝗻𝘀𝗶𝘃𝗲 𝗲𝗻𝘁𝗲𝗿𝘁𝗮𝗶𝗻𝗺𝗲𝗻𝘁 𝗲𝘅𝗽𝗲𝗿𝗶𝗲𝗻𝗰𝗲 𝘄𝗶𝘁𝗵 𝗮 𝘄𝗶𝗱𝗲 𝗮𝗿𝗿𝗮𝘆 𝗼𝗳 𝗹𝗶𝘃𝗲 𝗧𝗩 𝗰𝗵𝗮𝗻𝗻𝗲𝗹𝘀, 𝘁𝗵𝗼𝘂𝘀𝗮𝗻𝗱𝘀 𝗼𝗳 𝗵𝗼𝘂𝗿𝘀 𝗼𝗳 𝗩𝗢𝗗, 𝗰𝗹𝗮𝘀𝘀𝗶𝗰 𝗺𝗼𝘃𝗶𝗲𝘀, 𝘁𝗵𝗲 𝗹𝗮𝘁𝗲𝘀𝘁 𝗱𝗿𝗮𝗺𝗮 𝘀𝗲𝗿𝗶𝗲𝘀, 𝗯𝗹𝗼𝗰𝗸𝗯𝘂𝘀𝘁𝗲𝗿𝘀, 𝗲𝘅𝗰𝗹𝘂𝘀𝗶𝘃𝗲 𝗸𝗶𝗱𝘀' 𝘀𝗵𝗼𝘄𝘀, 𝗮𝗻𝗱 𝗽𝗼𝘄𝗲𝗿𝗳𝘂𝗹 𝘀𝗽𝗼𝗿𝘁𝘀 𝗰𝗼𝗻𝘁𝗲𝗻𝘁. 𝗘𝗻𝗷𝗼𝘆 𝗵𝗶𝗴𝗵-𝗾𝘂𝗮𝗹𝗶𝘁𝘆 𝘀𝘁𝗿𝗲𝗮𝗺𝗶𝗻𝗴 𝗮𝗻𝗱 𝗮𝗰𝗰𝗲𝘀𝘀 𝘁𝗼 𝗲𝘅𝗰𝗹𝘂𝘀𝗶𝘃𝗲 𝗰𝗼𝗻𝘁𝗲𝗻𝘁 𝗮𝘁 𝘆𝗼𝘂𝗿 𝗳𝗶𝗻𝗴𝗲𝗿𝘁𝗶𝗽𝘀.💠

🌹💎🌹💎🌹💎🌹💎🌹
`;
            await sendMessageWithImage({ Matrix: MatrixInstance, m, imageUrl: startimesImageUrl, caption: combinedStartimesMessage });

   }
},

 {
   
   command: ['webclone', 'clone'], 
    operate: async ({
        Matrix: MatrixInstance,
        m,
        reply,
        text // This will contain the URL directly after the command
    }) => {
        const userId = m.sender;
        
        // --- Webclone Logic ---
        const urlToClone = text?.trim(); // Get the URL from the command arguments

        // If no URL is provided, show the welcome/usage message
        if (!urlToClone) {
            await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
            await showTyping(MatrixInstance, m.chat);

            const randomPhotoLink = webclonePhotoLinks[Math.floor(Math.random() * webclonePhotoLinks.length)];
            const welcomeCaption = `
╔══════ ≪ •❈• ≫ ══════╗
 🌐🌹 𝗪 𝗘 𝗕 𝗖 𝗟 𝗢 𝗡 𝗘 🌹🌐
╚══════ ≪ •❈• ≫ ══════╗

👋🏻😊 Hey there, *${m.pushName || 'User'}*!

⏳𝗜'𝗺 𝘆𝗼𝘂𝗿 𝘂𝗹𝘁𝗶𝗺𝗮𝘁𝗲 💻 𝗪𝗲𝗯𝘀𝗶𝘁𝗲 𝗦𝗼𝘂𝗿𝗰𝗲 𝗖𝗼𝗱𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿!🧙‍♂️ 𝗨𝗻𝗹𝗼𝗰𝗸 𝘁𝗵𝗲 𝘀𝗲𝗰𝗿𝗲𝘁𝘀 𝗯𝗲𝗵𝗶𝗻𝗱 𝗮𝗻𝘆 𝘄𝗲𝗯𝗽𝗮𝗴𝗲! 𝗪𝗵𝗲𝘁𝗵𝗲𝗿 𝘆𝗼𝘂're 𝗮 𝗰𝘂𝗿𝗶𝗼𝘂𝘀 𝗹𝗲𝗮𝗿𝗻𝗲𝗿,𝗱𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 𝗼𝗿 𝗷𝘂𝘀𝘁 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗴𝗿𝗮𝗯 𝗰𝗼𝗻𝘁𝗲𝗻𝘁 𝗳𝗼𝗿 𝗼𝗳𝗳𝗹𝗶𝗻𝗲 𝘂𝘀𝗲, 𝗜'𝗺 𝗵𝗲𝗿𝗲 𝘁𝗼 𝗵𝗲𝗹𝗽🎨.

📡𝙐𝙨𝙖𝙜𝙚 𝙀𝙭𝙖𝙢𝙥𝙡𝙚:
\`\`\`.𝘀𝗶𝗺𝗽𝗹𝘆 𝘀𝗲𝗻𝗱 𝗺𝗲 𝗮𝗻𝘆 𝘄𝗲𝗯𝘀𝗶𝘁𝗲 𝗨𝗥𝗟 𝗼𝗿 𝗹𝗶𝗻𝗸, 𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝘄𝗶𝘁𝗵 .webclone https://example.com\`\`\`
𝗮𝗻𝗱 𝗶 𝘄𝗶𝗹𝗹 𝘀𝘄𝗶𝗳𝘁𝗹𝘆 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗶𝘁𝘀 𝗰𝗼𝗺𝗽𝗹𝗲𝘁𝗲 𝘀𝗼𝘂𝗿𝗰𝗲 𝗰𝗼𝗱𝗲 𝗽𝗮𝗰𝗸𝗮𝗴𝗲𝗱 𝗮𝘀 𝗮 𝗰𝗼𝗻𝘃𝗲𝗻𝗶𝗲𝗻𝘁 𝗭𝗜𝗣 𝗳𝗶𝗹𝗲 📁 𝗳𝗼𝗿 𝗲𝗮𝘀𝘆 𝗮𝗰𝗰𝗲𝘀𝘀 𝗮𝗻𝗱 𝗲𝘅𝗽𝗹𝗼𝗿𝗮𝘁𝗶𝗼𝗻

╔══════ ≪ •❈• ≫ ══════╗
🔮𝗪𝗘𝗕𝗖𝗟𝗢𝗡𝗘𝗥 𝗩𝟵 𝗧𝗨𝗥𝗕𝗢🔮
╚══════ ≪ •❈• ≫ ══════╝
`;
         
            await sendMessageWithImage({ Matrix: MatrixInstance, m, imageUrl: randomPhotoLink, caption: welcomeCaption }); // Directly use welcomeCaption
            console.log('Successfully sent webclone welcome photo with usage.');
            return; // Exit as we've shown the usage
        }

        // Basic URL validation
        if (!urlToClone.startsWith('http://') && !urlToClone.startsWith('https://')) {
            await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            return reply(
                `❌ *Invalid URL* ⚠️\n\n` +
                `Please provide a valid URL starting with *http://* or *https://*`
            );
        }

        let filePath = '';
        let currentApiUrl = ''; // To store which API URL is currently being used
        let apiResponseData = null; // To store the successful API response data

        try {
            await MatrixInstance.sendMessage(m.chat, { react: { text: "📡", key: m.key } }); // React with satellite dish
            await showTyping(MatrixInstance, m.chat);
            const cloningMsg = await reply(`📡 *Cloning website...* 🌐 This might take a moment. ⏳`);
            console.log(`Attempting to clone: ${urlToClone}`);

            // --- Try First API (Cloudflare Worker) ---
            try {
                currentApiUrl = `${CLOUDFLARE_API_URL}${encodeURIComponent(urlToClone)}`;
                console.log(`[Webclone] Trying primary API: ${currentApiUrl}`);
                const apiResponse = await fetch(currentApiUrl);
                apiResponseData = await apiResponse.json();

                if (!apiResponse.ok || !apiResponseData.success || !apiResponseData.download_url) {
                    throw new Error(`Primary API failed: Status ${apiResponse.status}, Error: ${apiResponseData.error || 'Unknown'}`);
                }
                // If it reaches here, the primary API was successful
                console.log(`[Webclone] Primary API (Cloudflare) successful.`);

            } catch (error) {
                // If primary API fails, log the error and try the fallback
                console.error(`[Webclone] Primary API (Cloudflare) failed:`, error.message);
                await reply(`⚠️ *Primary cloning service failed!* Trying fallback service. 🔄`);

                // --- Try Second API (Vercel) ---
                currentApiUrl = `${VERCEL_API_URL}${encodeURIComponent(urlToClone)}`;
                console.log(`[Webclone] Trying fallback API: ${currentApiUrl}`);
                const apiResponse = await fetch(currentApiUrl);
                apiResponseData = await apiResponse.json();

                if (!apiResponse.ok || !apiResponseData.success || !apiResponseData.download_url) {
                    throw new Error(`Fallback API failed: Status ${apiResponse.status}, Error: ${apiResponseData.error || 'Unknown'}`);
                }
                console.log(`[Webclone] Fallback API (Vercel) successful.`);
            }

            // --- Common Logic for successful API response (whether primary or fallback) ---
            if (apiResponseData && apiResponseData.success && apiResponseData.download_url) {
                await MatrixInstance.sendMessage(m.chat, { text: "⬇️ *Downloading file...* 📥 This might take a moment." }, { quoted: cloningMsg });

                const downloadUrl = apiResponseData.download_url;
                const fileName = `website_clone_${Date.now()}.zip`; // Simplified filename
                filePath = path.join(os.tmpdir(), fileName);

                const fileStreamResponse = await axios({
                    method: 'get',
                    url: downloadUrl,
                    responseType: 'stream'
                });

                if (fileStreamResponse.status !== 200) {
                    throw new Error(`Failed to download file from API link. Status: ${fileStreamResponse.status}`);
                }

                const writer = fs.createWriteStream(filePath);
                await new Promise((resolve, reject) => {
                    fileStreamResponse.data.pipe(writer);
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                const stats = fs.statSync(filePath);
                const fileSizeMB = stats.size / (1024 * 1024);
                const maxFileSizeMB = 100; // WhatsApp document limit is typically higher than Telegram's 50MB, but set a reasonable limit.
                if (fileSizeMB > maxFileSizeMB) {
                    fs.unlinkSync(filePath);
                    throw new Error(`File too large (${fileSizeMB.toFixed(2)} MB). Max limit is ${maxFileSizeMB} MB.`);
                }

                await MatrixInstance.sendMessage(m.chat, { text: `⬆️ *Uploading ${fileName} to WhatsApp...* 📤` }, { quoted: cloningMsg });

                await MatrixInstance.sendMessage(m.chat, {
                    document: fs.readFileSync(filePath),
                    fileName: fileName,
                    mimetype: 'application/zip', // Correct mimetype for ZIP
                    caption: `✅ *Website Cloned Successfully!* 🎉 Here is the source code for: *${urlToClone}* 📦`,
                }, { quoted: m }); // Quote the original user message

                await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } }); // Final success react
                console.log(`Cloned file sent: ${filePath}`);

            } else {
                // This else block handles cases where both APIs were tried, but neither returned success/download_url
                await MatrixInstance.sendMessage(m.chat, { react: { text: "❗", key: m.key } });
                await reply("❌ *API Error:* Both cloning services failed to provide a valid download link or specific error message. 🚨");
                console.error('Both Webclone APIs failed:', apiResponseData);
            }

        } catch (e) {
            await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            console.error('Webclone process error:', e);
            const errorMessage = `❌ *Error Occurred!* ⚠️ \n\`\`\`${e.message}\`\`\`\n\n𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗼𝗿 𝗰𝗼𝗻𝘁𝗮𝗰𝘁 𝘁𝗵𝗲 𝗼𝘄𝗻𝗲𝗿. 🧑‍💻`;
            await reply(errorMessage);

        } finally {
            // Clean up the temporary file
            if (filePath && fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Failed to delete temporary cloned file:', err);
                    else console.log('Temporary cloned file deleted:', filePath);
                });
            }
        }
    },
}

];
