const fetch = require('node-fetch');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { isPremium } = require('../../lib/premiumSystem');
const { fromBuffer } = require('file-type');
const path = require('path');




const SESSION_FILE = path.join(__dirname, '../../src/gemini.json');

const loadSession = () => {
    if (!fs.existsSync(SESSION_FILE)) {
        fs.writeFileSync(SESSION_FILE, JSON.stringify({}), 'utf-8')
    }
    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
};
const saveSession = (data) => {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
};

module.exports =  [

{
  command: ["adizachat"],
  operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    const userState = getUserApiState(sender);

    await Matrix.sendMessage(m.chat, {
      react: {
        text: "✨", // Adizachat emoji
        key: m.key
      }
    });

    // Show usage/help to everyone
    if (!text) {
      const modelEmojis = {
        gemini: "🌈", gpt3: "🤖", llama3: "🦙", evilgpt: "😈", jarvis: "🧑‍💼",
        chatgpt: "💬", perplexity: "🧠", blackbox: "🕵️", dbrx: "⚡", islamicai: "🕌",
        openai: "🔓", deepseekllm: "🔬", doppleai: "👥", letterai: "✉️", metaai: "🌐",
        mistral: "🌪️", generate: "🎨", imagen: "📸", imagine: "✨", photoai: "🖼️", anime4k: "🎎"
      };

      let modelList = Object.entries(AVAILABLE_APIS)
        .map(([key, info]) => {
          const emoji = modelEmojis[key] || "🤖";
          return `${emoji} *${info.displayName}*`;
        })
        .join('\n');

      const usage = `*✨ Adiza Chat Helper ✨*

_🌹Send any message or media (image, video, document, audio) and I'll reply using the AI model you select!🌹_

*To enable Adiza Chat:*
\`${prefix}adizachat on\`

*To disable:*
\`${prefix}adizachat off\`

*🦩To switch AI models, type the model name with the dot prefix*:
\`${prefix}jarvis\`, \`${prefix}perplexity\`, \`${prefix}blackbox\`, \`${prefix}gpt3\`, etc.

*⚡Available AI Models:*
${modelList}

✨ *Chat freely without prefix once enabled!*`;

      await Matrix.sendMessage(m.chat, {
        image: { url: "https://i.ibb.co/Q32MN0KP/IMG-20250707-053139-314.jpg" },
        caption: usage
      }, { quoted: m });

      return;
    }

    // Restrict toggling to creator or premium users only
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can enable or disable Adiza Chat. Contact the owner to purchase premium.");
    }

    // If text is provided, treat it as on/off toggle
    const option = text.toLowerCase();
    if (option === "on") {
      userState.enabled = true;
      userState.currentApi = "gemini";
      userState.isSelecting = false;
      saveAdizaUserStates();
      return reply(`✅ Adiza Chat *enabled* for you. Chat freely without prefix.`);
    } else if (option === "off") {
      userState.enabled = false;
      saveAdizaUserStates();
      return reply(`❌ Adiza Chat *disabled* for you. Use \`${prefix}adizachat on\` to enable again.`);
    } else {
      return reply(`Invalid option. Use \`${prefix}adizachat on\` or \`${prefix}adizachat off\`.`);
    }
  }
},

 
{
  command: ["jarvis"],
  operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    const userState = getUserApiState(sender);

    await Matrix.sendMessage(m.chat, {
      react: {
        text: "🤖",
        key: m.key
      }
    });

    if (!text) {
      if (!userState.enabled) {
        userState.enabled = true;
        userState.currentApi = "jarvis";
        userState.isSelecting = false;
        saveAdizaUserStates();
        return reply(`✅ Jarvis AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
      } else if (userState.enabled && userState.currentApi !== "jarvis") {
        userState.currentApi = "jarvis";
        userState.isSelecting = false;
        saveAdizaUserStates();
        return reply(`✅ Switched to *Jarvis AI*. You can now chat directly without a prefix.`);
      } else {
        return reply(`*Jarvis AI* is already active for you. Just type your message directly.`);
      }
    }

    // If text is provided, and Jarvis is the active model, confirm that direct chat is enabled.
    if (userState.enabled && userState.currentApi === "jarvis") {
      return reply("Jarvis AI is active. Your query will be processed directly in the next message.");
    } else {
      if (!userState.enabled) {
        return reply(`Please enable Adizachat first and select Jarvis: \`${prefix}adizachat on\`, then type \`jarvis\`.`);
      } else {
        return reply(`Jarvis is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}jarvis\` to switch to it.`);
      }
    }
  }
},

  // --- BLACKBOX AI Command ---
  {
    command: ["blackbox"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "⚙️",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "blackbox";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Blackbox AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "blackbox") {
            userState.currentApi = "blackbox";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Blackbox AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*Blackbox AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "blackbox") {
          return reply("Blackbox AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Blackbox: \`${prefix}adizachat on\`, then type \`blackbox\`.`);
          } else {
              return reply(`Blackbox is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}blackbox\` to switch to it.`);
          }
      }
    }
  },

  // --- PERPLEXITY AI Command ---
  {
    command: ["perplexity"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🧠",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "perplexity";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Perplexity AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "perplexity") {
            userState.currentApi = "perplexity";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Perplexity AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*Perplexity AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "perplexity") {
          return reply("Perplexity AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Perplexity: \`${prefix}adizachat on\`, then type \`perplexity\`.`);
          } else {
              return reply(`Perplexity is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}perplexity\` to switch to it.`);
          }
      }
    }
  },

  // --- GEMINI AI Command ---
  {
    command: ["gemini"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "✨",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "gemini"; // This sets the current AI model to 'gemini'
            userState.isSelecting = false;
            saveAdizaUserStates();
            // Updated reply to reflect multi-modal support
            return reply(`✅ Gemini AI *enabled* for you. You can now chat directly without a prefix, even with photos, videos, or documents. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "gemini") {
            userState.currentApi = "gemini"; // This sets the current AI model to 'gemini'
            userState.isSelecting = false;
            saveAdizaUserStates();
            // Updated reply to reflect multi-modal support
            return reply(`✅ Switched to *Gemini AI*. You can now chat directly without a prefix, even with photos, videos, or documents.`);
        } else {
            // Updated reply to reflect multi-modal support
            return reply(`*Gemini AI* is already active for you. Just type your message directly, or send a photo/video/document with your question.`);
        }
      }

      // If text is provided with the command, it's a direct query for Gemini.
      // The main AI logic in system.js will handle this based on `userState.currentApi`.
      if (userState.enabled && userState.currentApi === "gemini") {
          // Updated reply to reflect multi-modal support
          return reply("Gemini AI is active. Your query (and any attached media) will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Gemini: \`${prefix}adizachat on\`, then type \`gemini\`.`);
          } else {
              return reply(`Gemini is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}gemini\` to switch to it.`);
          }
      }
    }
  },

  // --- GENERATE (Image) AI Command ---
  {
    command: ["generate"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🎨",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "generate";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Image Generation (GuruSensei) *enabled* for you. You can now prompt directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "generate") {
            userState.currentApi = "generate";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Image Generation (GuruSensei)*. You can now prompt directly without a prefix.`);
        } else {
            return reply(`*Image Generation (GuruSensei)* is already active for you. Just type your prompt directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "generate") {
          return reply("Image Generation (GuruSensei) is active. Your prompt will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Image Generation (GuruSensei): \`${prefix}adizachat on\`, then type \`generate\`.`);
          } else {
              return reply(`Image Generation (GuruSensei) is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}generate\` to switch to it.`);
          }
      }
    }
  },

  // --- DBRX AI Command ---
  {
    command: ["dbrx"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "⚛️",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "dbrx";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ DBRX AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "dbrx") {
            userState.currentApi = "dbrx";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *DBRX AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*DBRX AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "dbrx") {
          return reply("DBRX AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select DBRX: \`${prefix}adizachat on\`, then type \`dbrx\`.`);
          } else {
              return reply(`DBRX is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}dbrx\` to switch to it.`);
          }
      }
    }
  },

  // --- CHATGPT AI Command ---
  {
    command: ["chatgpt"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "💬",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "chatgpt";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ ChatGPT AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "chatgpt") {
            userState.currentApi = "chatgpt";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *ChatGPT AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*ChatGPT AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "chatgpt") {
          return reply("ChatGPT AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select ChatGPT: \`${prefix}adizachat on\`, then type \`chatgpt\`.`);
          } else {
              return reply(`ChatGPT is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}chatgpt\` to switch to it.`);
          }
      }
    }
  },

  // --- DEEPSEEKLLM AI Command ---
  {
    command: ["deepseekllm"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "💡",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "deepseekllm";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ DeepSeek-LLM AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "deepseekllm") {
            userState.currentApi = "deepseekllm";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *DeepSeek-LLM AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*DeepSeek-LLM AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "deepseekllm") {
          return reply("DeepSeek-LLM AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select DeepSeek-LLM: \`${prefix}adizachat on\`, then type \`deepseekllm\`.`);
          } else {
              return reply(`DeepSeek-LLM is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}deepseekllm\` to switch to it.`);
          }
      }
    }
  },

  // --- DOPPLEAI AI Command ---
  {
    command: ["doppleai"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }    
    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🎭",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "doppleai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ DoppleAI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "doppleai") {
            userState.currentApi = "doppleai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *DoppleAI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*DoppleAI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "doppleai") {
          return reply("DoppleAI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select DoppleAI: \`${prefix}adizachat on\`, then type \`doppleai\`.`);
          } else {
              return reply(`DoppleAI is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}doppleai\` to switch to it.`);
          }
      }
    }
  },

  // --- GPT (GPT3) AI Command ---
  {
    command: ["gpt"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

       
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "💡",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "gpt3"; // Use 'gpt3' as the key from AVAILABLE_APIS
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ GPT-3 AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "gpt3") {
            userState.currentApi = "gpt3";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *GPT-3 AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*GPT-3 AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "gpt3") {
          return reply("GPT-3 AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select GPT-3: \`${prefix}adizachat on\`, then type \`gpt\`.`);
          } else {
              return reply(`GPT-3 is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}gpt\` to switch to it.`);
          }
      }
    }
  },

  // --- GPT2 (Jarvis Chat) AI Command ---
  {
    command: ["gpt2"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "✨",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "jarvis"; // GPT2 command maps to 'jarvis' API
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Jarvis Chat AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "jarvis") {
            userState.currentApi = "jarvis";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Jarvis Chat AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*Jarvis Chat AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "jarvis") {
          return reply("Jarvis Chat AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Jarvis Chat: \`${prefix}adizachat on\`, then type \`gpt2\`.`);
          } else {
              return reply(`Jarvis Chat is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}gpt2\` to switch to it.`);
          }
      }
    }
  },

  // --- IMAGEN (Image) AI Command ---
  {
    command: ["imagen"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }
   
    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🖼️",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "imagen";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Photorealistic Image Generation (Mastery) *enabled* for you. You can now prompt directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "imagen") {
            userState.currentApi = "imagen";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Photorealistic Image Generation (Mastery)*. You can now prompt directly without a prefix.`);
        } else {
            return reply(`*Photorealistic Image Generation (Mastery)* is already active for you. Just type your prompt directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "imagen") {
          return reply("Photorealistic Image Generation (Mastery) is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Photorealistic Image Generation: \`${prefix}adizachat on\`, then type \`imagen\`.`);
          } else {
              return reply(`Photorealistic Image Generation is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}imagen\` to switch to it.`);
          }
      }
    }
  },

  // --- IMAGINE (Image) AI Command ---
  {
    command: ["imagine"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "✨",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "imagine";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Imagine X (Flux) *enabled* for you. You can now prompt directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "imagine") {
            userState.currentApi = "imagine";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Imagine X (Flux)*. You can now prompt directly without a prefix.`);
        } else {
            return reply(`*Imagine X (Flux)* is already active for you. Just type your prompt directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "imagine") {
          return reply("Imagine X (Flux) is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Imagine X (Flux): \`${prefix}adizachat on\`, then type \`imagine\`.`);
          } else {
              return reply(`Imagine X (Flux) is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}imagine\` to switch to it.`);
          }
      }
    }
  },

  // --- ISLAMICAI AI Command ---
  {
    command: ["islamicai"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🌙",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "islamicai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Islamic AI (Noor) *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "islamicai") {
            userState.currentApi = "islamicai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Islamic AI (Noor)*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*Islamic AI (Noor)* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "islamicai") {
          return reply("Islamic AI (Noor) is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Islamic AI (Noor): \`${prefix}adizachat on\`, then type \`islamicai\`.`);
          } else {
              return reply(`Islamic AI (Noor) is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}islamicai\` to switch to it.`);
          }
      }
    }
  },

  // --- LETTERAI AI Command ---
  {
    command: ["letterai"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "✍️",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "letterai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ LetterAI (SiputzX) *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "letterai") {
            userState.currentApi = "letterai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *LetterAI (SiputzX)*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*LetterAI (SiputzX)* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "letterai") {
          return reply("LetterAI (SiputzX) is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select LetterAI (SiputzX): \`${prefix}adizachat on\`, then type \`letterai\`.`);
          } else {
              return reply(`LetterAI (SiputzX) is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}letterai\` to switch to it.`);
          }
      }
    }
  },

  // --- LLAMA AI Command ---
  {
    command: ["llama"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }
    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🦙",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "llama3"; // Using 'llama3' as per AVAILABLE_APIS
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Llama AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "llama3") {
            userState.currentApi = "llama3";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Llama AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*Llama AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "llama3") {
          return reply("Llama AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Llama: \`${prefix}adizachat on\`, then type \`llama\`.`);
          } else {
              return reply(`Llama is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}llama\` to switch to it.`);
          }
      }
    }
  },

  // --- METAAI AI Command ---
  {
    command: ["metaai"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🌐",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "metaai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ MetaAI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "metaai") {
            userState.currentApi = "metaai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *MetaAI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*MetaAI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "metaai") {
          return reply("MetaAI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select MetaAI: \`${prefix}adizachat on\`, then type \`metaai\`.`);
          } else {
              return reply(`MetaAI is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}metaai\` to switch to it.`);
          }
      }
    }
  },

  // --- MISTRAL AI Command ---
  {
    command: ["mistral"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🌬️",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "mistral";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Mistral AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "mistral") {
            userState.currentApi = "mistral";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Mistral AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*Mistral AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "mistral") {
          return reply("Mistral AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Mistral: \`${prefix}adizachat on\`, then type \`mistral\`.`);
          } else {
              return reply(`Mistral is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}mistral\` to switch to it.`);
          }
      }
    }
  },

  // --- OPENAI AI Command ---
  {
    command: ["openai"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🤖",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "openai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ OpenAI AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "openai") {
            userState.currentApi = "openai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *OpenAI AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*OpenAI AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "openai") {
          return reply("OpenAI AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select OpenAI: \`${prefix}adizachat on\`, then type \`openai\`.`);
          } else {
              return reply(`OpenAI is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}openai\` to switch to it.`);
          }
      }
    }
  },

  // --- PHOTOAI (Image) AI Command ---
  {
    command: ["photoai"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "📸",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "photoai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Realism Image Generation (Dreamshaper) *enabled* for you. You can now prompt directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "photoai") {
            userState.currentApi = "photoai";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Realism Image Generation (Dreamshaper)*. You can now prompt directly without a prefix.`);
        } else {
            return reply(`*Realism Image Generation (Dreamshaper)* is already active for you. Just type your prompt directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "photoai") {
          return reply("Realism Image Generation (Dreamshaper) is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Realism Image Generation: \`${prefix}adizachat on\`, then type \`photoai\`.`);
          } else {
              return reply(`Realism Image Generation is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}photoai\` to switch to it.`);
          }
      }
    }
  },
    // --- EVILGPT AI Command ---
  {
    command: ["evilgpt"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "😈", // Evil emoji for EvilGPT
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "evilgpt";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ EvilGPT AI *enabled* for you. You can now chat directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "evilgpt") {
            userState.currentApi = "evilgpt";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *EvilGPT AI*. You can now chat directly without a prefix.`);
        } else {
            return reply(`*EvilGPT AI* is already active for you. Just type your message directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "evilgpt") {
          return reply("EvilGPT AI is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select EvilGPT: \`${prefix}adizachat on\`, then type \`evilgpt\`.`);
          } else {
              return reply(`EvilGPT is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}evilgpt\` to switch to it.`);
          }
      }
    }
  },


  // --- HAZEXIMG (Image) AI Command ---
  {
    command: ["anime4k"],
    operate: async ({ Matrix, m, reply, text, prefix, sender, getUserApiState, saveAdizaUserStates, AVAILABLE_APIS }) => {
    
    // Restrict to creator or premium users
    if (!m.isCreator && !isPremium(sender)) {
      return reply("❌ Only premium users or the owner can use Jarvis AI. Contact the owner to purchase premium.");
    }

    
      const userState = getUserApiState(sender);

      await Matrix.sendMessage(m.chat, {
        react: {
          text: "🌸",
          key: m.key
        }
      });

      if (!text) {
        if (!userState.enabled) {
            userState.enabled = true;
            userState.currentApi = "anime4k";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Anime Image Generation (Hazex) *enabled* for you. You can now prompt directly without a prefix. Type \`${prefix}adizachat off\` to disable or \`${prefix}adizachat on\` to switch models.`);
        } else if (userState.enabled && userState.currentApi !== "anime4k") {
            userState.currentApi = "anime4k";
            userState.isSelecting = false;
            saveAdizaUserStates();
            return reply(`✅ Switched to *Anime Image Generation (Hazex)*. You can now prompt directly without a prefix.`);
        } else {
            return reply(`*Anime Image Generation (Hazex)* is already active for you. Just type your prompt directly.`);
        }
      }

      if (userState.enabled && userState.currentApi === "anime4k") {
          return reply("Anime Image Generation (Hazex) is active. Your query will be processed directly in the next message.");
      } else {
          if (!userState.enabled) {
              return reply(`Please enable Adizachat first and select Anime Image Generation: \`${prefix}adizachat on\`, then type \`anime4k\`.`);
          } else {
              return reply(`Anime Image Generation is not your active AI. Your current AI is *${AVAILABLE_APIS[userState.currentApi]?.displayName}*. Type \`${prefix}anime4k\` to switch to it.`);
          }
      }
    }
  },
];
