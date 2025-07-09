function hi() {
  console.log("Hello World!");
}
hi();
const fs = require("fs");
const fsp = fs.promises;

const { calculateExpiry, isPremium, checkCommandAccess } = require('../../lib/premiumSystem');

module.exports = [ 
{
  command: ["alwaysonline"],
  operate: async ({
    Matrix,
    m,
    reply,
    args,
    prefix,
    command,
    isCreator,
    mess,
    db,
    botNumber 
  }) => {
    
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium); // Use relevant message
    }
    if (args.length < 1) {
      return reply("Example: " + (prefix + command) + " on/off");
    }
    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();
    if (!validOptions.includes(option)) {
      return reply("Invalid option");
    }


    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {};
    db.data.users[Matrix.user.id].alwaysonline = option === "on";

    if (global.dbToken) {
      await global.writeDB(); // This syncs to GitHub
    } else {
      await global.db.write(); // Fallback for local persistence
    }
    reply("Always-online " + (option === "on" ? "enabled" : "disabled") + " successfully.");
  }
},
 {
  command: ["anticall"],
  operate: async ({
    Matrix, 
    m,    
    reply,
    args,
    prefix,
    command,
    isCreator,
    mess,
    db
  }) => {
    
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium); // Use relevant message
    }
    if (args.length < 1) {
      return reply(
        "Example: " +
          prefix +
          command +
          " block/decline/off\n\n" +
          "block - Declines and blocks callers\n" +
          "decline - Declines incoming calls\n" +
          "off - disables anticall"
      );
    }
    const validOptions = ["block", "decline", "off"];
    const mode = args[0].toLowerCase();
    if (!validOptions.includes(mode)) {
      return reply(
        "Invalid option; type *" + prefix + "anticall* to see available options!"
      );
    }


    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {};
    db.data.users[Matrix.user.id].anticall = mode === "off" ? "off" : mode; // Store "off" string, consistent with default

    // Persist the database after updating the setting
    if (global.dbToken) {
      await global.writeDB();
    } else {
      await global.db.write(); // Fallback for local persistence
    }

    reply("Anti-call set to *" + mode + "* successfully.");
  }
},
{
  command: ["mode"],
  operate: async ({
    Matrix, // Matrix client needed to get Matrix.user.id
    m,
    reply,
    args,
    prefix,
    command,
    isCreator,
    mess,
    db,
    botNumber // Not directly used here, but kept in destructured for consistency
  }) => {

    const isBotInstanceOwner = (m.sender === Matrix.user.id);
    const isSenderPremium = isPremium(m.sender);

    if (!isCreator && !isBotInstanceOwner && !isSenderPremium) {
      return reply(mess.owner || mess.premium || "You are not authorized to change this bot instance's settings.");
    }

    if (args.length < 1) {
      return reply(
        "Example: " + (prefix + command) + " public/private/group/pm\n\n" +
        "private - sets this bot instance to private mode\n" +
        "public - sets this bot instance to public mode\n" +
        "group - sets this bot instance to be public on groups alone\n" +
        "pm - sets this bot instance to be public on personal chats alone."
      );
    }
    const validModes = ["private", "public", "group", "pm"];
    const newMode = args[0].toLowerCase();
    if (!validModes.includes(newMode)) {
      return reply("Invalid option. Use: private, public, group or pm");
    }


    // Store the mode for *this specific bot instance*
    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {}; // Ensure it exists
    db.data.users[Matrix.user.id].mode = newMode;

    if (global.dbToken) {
      await global.writeDB();
    } else {
      await global.db.write();
    }
    reply("✅ This bot instance's mode has been set to: *" + newMode + "* successfully.");
  }
},
{
  command: ["antidelete"],
  operate: async ({
    Matrix, // <-- ADDED: Matrix is needed
    m, // Passed m for premium check
    reply,
    args,
    prefix,
    command,
    isCreator, // Passed isCreator for check
    mess,
    db,
    botNumber
  }) => {
    // Decision Point: Allow Creator OR Premium users for antidelete
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium); // Use relevant message
    }

    if (args.length < 1) {
      return reply("Example: " + (prefix + command) + " private/chat/off\n\nprivate - sends deleted messages to message yourself\nchat - sends to current chat\noff - disables antidelete");
    }
    const validOptions = ["private", "chat", "off"];
    const mode = args[0].toLowerCase();
    if (!validOptions.includes(mode)) {
      return reply("Invalid option. Use: private, chat, or off");
    }
    // FIX: Store individually
    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {}; // Ensure it exists
    db.data.users[Matrix.user.id].antidelete = mode;
    if (global.dbToken) {
      await global.writeDB();
    } else {
      await global.db.write();
    }
    reply("Anti-delete mode set to: *" + mode + "*");
  }
}, {
  command: ["antiedit"],
  operate: async ({
    Matrix, // <-- ADDED: Matrix is needed
    m, // Passed m for premium check
    reply,
    args,
    prefix,
    command,
    isCreator, // Passed isCreator for check
    mess,
    db,
    botNumber
  }) => {
    // Decision Point: Allow Creator OR Premium users for antiedit
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium); // Use relevant message
    }

    if (args.length < 1) {
      return reply("Example: " + (prefix + command) + " private/chat/off\n\n private - sends edited messages to message yourself\nchat - sends to current chat\noff - disables antiedit");
    }
    const validOptions = ["private", "chat", "off"];
    const mode = args[0].toLowerCase();
    if (!validOptions.includes(mode)) {
      return reply("Invalid option. Use: private, chat, or off");
    }
    // FIX: Store individually
    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {}; // Ensure it exists
    db.data.users[Matrix.user.id].antiedit = mode;
    if (global.dbToken) {
      await global.writeDB();
    } else {
      await global.db.write();
    }
    reply("Anti-edit mode set to: *" + mode + "*");
  }
}, {
  command: ["autoreactstatus", "autostatusreact"],
  operate: async ({
    Matrix, // <--- Ensure Matrix is destructured here to get Matrix.user.id
    m, // Passed m for premium check
    reply,
    args,
    prefix,
    command,
    isCreator, // Passed isCreator for check
    mess,
    db,
    botNumber // Not directly used here
  }) => {
    // Decision Point: Allow Creator OR Premium users for autoreactstatus
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium); // Use relevant message
    }
    if (args.length < 1) {
      return reply("Example: " + (prefix + command) + " on/off");
    }
    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();
    if (!validOptions.includes(option)) {
      return reply("Invalid option");
    }


    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {};
    db.data.users[Matrix.user.id].autoreactstatus = option === "on";

    if (global.dbToken) {
      await global.writeDB(); // This syncs to GitHub
    } else {
      await global.db.write(); // Fallback for local persistence
    }
    reply("Auto status reaction " + (option === "on" ? "enabled" : "disabled") + " successfully.");
  }
},
 {
  command: ["autoviewstatus", "autostatusview"],
  operate: async ({
    Matrix, // <--- Ensure Matrix is destructured here to get Matrix.user.id
    m,
    reply,
    args,
    prefix,
    command,
    isCreator,
    mess,
    db,
    botNumber // Not directly used here
  }) => {
    // Decision Point: Allow Creator OR Premium users for autoviewstatus
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium);
    }
    if (args.length < 1) {
      return reply("Example: " + (prefix + command) + " on/off");
    }
    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();
    if (!validOptions.includes(option)) {
      return reply("Invalid option");
    }

    // FIX: Store the autoviewstatus for *this specific bot instance*
    // Ensure db.data.users[Matrix.user.id] exists and has a autoviewstatus property
    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {};
    db.data.users[Matrix.user.id].autoviewstatus = option === "on";

    if (global.dbToken) {
      await global.writeDB(); // This syncs to GitHub
    } else {
      await global.db.write(); // Fallback for local persistence
    }
    reply("Auto status view " + (option === "on" ? "enabled" : "disabled") + " successfully");
  }
},
{
  command: ["autoreact", "autoreacting"],
  operate: async ({
    Matrix, // Make sure Matrix is destructured
    reply,
    args,
    prefix,
    command,
    isCreator,
    mess,
    db,
    m
  }) => {
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium);
    }
    if (args.length < 1) {
      return reply("Example: " + (prefix + command) + " all/group/pm/command/off\n\nall - reacts to all messages\ngroup - reacts to messages in groups\npm - reacts to private messages\ncommand - reacts when a command is used\noff - disables auto-reaction");
    }
    const validOptions = ["all", "group", "pm", "command", "off"];
    const mode = args[0].toLowerCase();
    if (!validOptions.includes(mode)) {
      return reply("Invalid option; type *" + prefix + "autoreact* to see available options!");
    }

    // --- START DEBUGGING DATABASE WRITE FOR AUTOREACT ---
    console.log(`[AUTOREACT SAVE DEBUG] Attempting to set autoreact for ${Matrix.user.id} to: "${mode}"`);
    // Ensure the user's entry exists before setting the property
    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {};
    db.data.users[Matrix.user.id].autoreact = mode === "off" ? false : mode;
    console.log(`[AUTOREACT SAVE DEBUG] In-memory value after setting: "${db.data.users[Matrix.user.id].autoreact}"`);

    // Check if global.dbToken is defined to determine write method
    if (global.dbToken) {
      console.log(`[AUTOREACT SAVE DEBUG] global.dbToken is defined. Calling global.writeDB() to sync with GitHub.`);
      try {
        await global.writeDB(); // This function should internally call global.db.write() to localDb first
        console.log(`[AUTOREACT SAVE DEBUG] global.writeDB() call initiated successfully. Check GitHub/localDb for persistence.`);
      } catch (writeErr) {
        console.error(`[AUTOREACT SAVE ERROR] Error during global.writeDB() for autoreact:`, writeErr);
      }
    } else {
      console.log(`[AUTOREACT SAVE DEBUG] global.dbToken is NOT defined. Calling global.db.write() for local persistence.`);
      try {
        await global.db.write(); // Directly write to the local database file
        console.log(`[AUTOREACT SAVE DEBUG] Local global.db.write() call initiated successfully. Check localDb for persistence.`);
      } catch (localWriteErr) {
        console.error(`[AUTOREACT SAVE ERROR] Error during local global.db.write() for autoreact:`, localWriteErr);
      }
    }
    // --- END DEBUGGING ---

    reply("Auto-reaction set to *" + mode + "* successfully.");
  }
},
{
  command: ["setmenu", "menustyle"],
  operate: async ({
    Matrix, // <--- Make sure Matrix is destructured here
    reply,
    args,
    prefix,
    command,
    db,
    isCreator,
    mess,
    m
  }) => {
    // Allow Creator OR Premium users
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium);
    }
    if (args.length < 1) {
      return reply("Example: " + (prefix + command) + " 2\n\nOptions:\n1 = Document menu (Android only)\n2 = Text only menu (Android & iOS)\n3 = Image menu with context (Android & iOS)\n4 = Image menu (Android & iOS)\n5 = Footer/faded menu\n6 = Payment menu");
    }
    const validOptions = ["1", "2", "3", "4", "5", "6"];
    const style = args[0];
    if (!validOptions.includes(style)) {
      return reply("⚠️ Invalid menu style. Use a number between *1-6*.");
    }

    
    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {};
    db.data.users[Matrix.user.id].menustyle = style;

    reply("✅ Menu style changed to *" + style + "* successfully.");

    // Ensure the database is written
    if (global.dbToken) {
      await global.writeDB(); // This syncs to GitHub
    } else {
      await global.db.write(); // Fallback for local persistence
    }
  }
}, 
{
  command: ["setprefix"],
  operate: async ({
    Matrix, // <--- Ensure Matrix is destructured so we can get Matrix.user.id
    m,
    reply,
    args,
    prefix,
    command,
    isCreator,
    mess,
    db,
    botNumber
  }) => {

    const isBotInstanceOwner = (m.sender === Matrix.user.id);
     
    const isSenderPremium = isPremium(m.sender); 

    if (!isCreator && !isBotInstanceOwner && !isSenderPremium) {
      return reply(mess.owner || mess.premium || "You are not authorized to change this bot instance's settings.");
    }

    if (args.length < 1) {
      const currentBotPrefix = db.data.users[Matrix.user.id]?.prefix || '.'; // Get current prefix for *this bot instance*
      return reply(`Example: ${currentBotPrefix}${command} !\n\n- This will change *this bot instance's* prefix to *!*`);
    }

    const newPrefix = args[0];
    if (!newPrefix || newPrefix.length > 3) {
      return reply("⚠️ Prefix should be 1-3 characters long.");
    }


    db.data.users[Matrix.user.id].prefix = newPrefix; 

    reply(`✅ *This bot instance's* prefix has been changed to *${newPrefix}* successfully.`);
    if (global.dbToken) {
      await global.writeDB();
    } else {
      await global.db.write();
    }
  }
},
 {
  command: ["setstatusemoji", "statusemoji"],
  operate: async ({
    Matrix, // <--- Ensure Matrix is destructured here to get Matrix.user.id
    reply,
    args,
    prefix,
    command,
    db,
    isCreator,
    mess,
    m // Passed m for premium check
  }) => {
    // Allow Creator OR Premium users
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium); // Use relevant message
    }
    if (args.length < 1) {
      return reply("Example: " + (prefix + command) + " 🧡\n\n- This will change the bot's status reaction emoji to *🧡*");
    }
    const emoji = args[0];
    // This regex checks if it's a single emoji, including extended grapheme clusters
    if (!/^\p{Emoji}$/u.test(emoji)) {
      return reply("⚠️ Please provide a single valid emoji.");
    }

    db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {};
    db.data.users[Matrix.user.id].statusemoji = emoji;

    reply("✅ Status reaction emoji changed to *" + emoji + "* successfully.");
    if (global.dbToken) {
      await global.writeDB(); // This syncs to GitHub
    } else {
      await global.db.write(); // Fallback for local persistence
    }
  }
},
{
    command: ["welcome", "welcometoggle"],
    operate: async ({ Matrix, m, isCreator, mess, prefix, args, q, reply }) => {
      // Allow Creator OR Premium users
      const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
      if (!isCreator && !isSenderPremium) {
        return reply(mess.owner || mess.premium); // Use relevant message
      }

      if (args.length === 0) {
        // Show usage instructions if no argument provided
        return reply(
          `*Welcome Feature Toggle*\n\n` +
          `Usage:\n` +
          `${prefix}welcome on - Enable welcome messages\n` +
          `${prefix}welcome off - Disable welcome messages`
        );
      }

      // Normalize argument to lowercase
      const option = args[0].toLowerCase();

      // FIX: Store individually
      db.data.users[Matrix.user.id] = db.data.users[Matrix.user.id] || {}; // Ensure it exists
      db.data.users[Matrix.user.id].welcome = option === "on";

      if (global.dbToken) {
        await global.writeDB(); // This syncs to GitHub
      } else {
        await global.db.write(); // Fallback for local persistence
      }
      reply("Welcome messages have been *" + (option === "on" ? "enabled" : "disabled") + "*.");
    }
  }, {
  command: ["getsettings"],
  operate: async ({
    Matrix, // <--- ADDED: Matrix is needed to get Matrix.user.id
    reply,
    db,
    m,
    isCreator,
    mess
  }) => {
    // Allow Creator OR Premium users
    const isSenderPremium = isPremium(m.sender); // Ensure isPremium is available
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium); // Use relevant message
    }


    const botInstanceSettings = db.data.users[Matrix.user.id] || {};

    let message = `⚙️ *Settings for YOUR Bot Instance (${Matrix.user.id.split('@')[0]}):*\n\n`;

    const allPossibleSettings = {
      prefix: botInstanceSettings.prefix ?? db.data.settings.prefix ?? ".",
      mode: botInstanceSettings.mode ?? db.data.settings.mode ?? "public",
      autobio: botInstanceSettings.autobio ?? db.data.settings.autobio ?? false,
      anticall: botInstanceSettings.anticall ?? db.data.settings.anticall ?? "off", // Corrected default type
      autotype: botInstanceSettings.autotype ?? db.data.settings.autotype ?? false,
      autoread: botInstanceSettings.autoread ?? db.data.settings.autoread ?? false,
      adizachat: botInstanceSettings.adizachat ?? db.data.settings.adizachat ?? false,
      statusemoji: botInstanceSettings.statusemoji || db.data.settings.statusemoji || "🧡",
      welcome: botInstanceSettings.welcome ?? db.data.settings.welcome ?? false,
      autoreact: botInstanceSettings.autoreact ?? db.data.settings.autoreact ?? false,
      antidelete: botInstanceSettings.antidelete ?? db.data.settings.antidelete ?? "private",
      antiedit: botInstanceSettings.antiedit ?? db.data.settings.antiedit ?? "private",
      alwaysonline: botInstanceSettings.alwaysonline ?? db.data.settings.alwaysonline ?? false, // Corrected default
      autorecord: botInstanceSettings.autorecord ?? db.data.settings.autorecord ?? false, // Added missing
      autoviewstatus: botInstanceSettings.autoviewstatus ?? db.data.settings.autoviewstatus ?? false, // Corrected default
      autoreactstatus: botInstanceSettings.autoreactstatus ?? db.data.settings.autoreactstatus ?? false,
      menustyle: botInstanceSettings.menustyle ?? db.data.settings.menustyle ?? "2",
      autorecordtype: botInstanceSettings.autorecordtype ?? db.data.settings.autorecordtype ?? false, // Added missing

    };

    for (const [key, value] of Object.entries(allPossibleSettings)) {
      message += "❄️ *" + key + "*: " + (typeof value === "boolean" ? (value ? "ON" : "OFF") : value) + "\n";
    }
    // --- END FIX ---

    reply(message);
  }
},
{
  command: ["resetbotsettings", "mybotdefaults"], // New command name
  operate: async ({
    Matrix,
    reply,
    args,
    prefix, // Used for example usage
    command, // Used for example usage
    isCreator,
    mess,
    db,
    m // Passed m for premium check
  }) => {
    // Same permissions: Creator or Premium users
    const isSenderPremium = isPremium(m.sender);
    if (!isCreator && !isSenderPremium) {
      return reply(mess.owner || mess.premium);
    }


    const defaultMyBotSettings = {
      prefix: ".",
      mode: "public",
      autobio: false,
      anticall: "off",
      autotype: false,
      autoread: false,
      adizachat: false, // Added missing
      statusemoji: "🧡",
      welcome: false, // Corrected default
      autoreact: false,
      antidelete: "private",
      antiedit: "private",
      alwaysonline: false, // Corrected default
      autorecord: false, // Added missing
      autoviewstatus: false, // Corrected default
      autoreactstatus: false,
      menustyle: "2",
      autorecordtype: false, // Added missing

    };

    const settingToReset = args[0]?.toLowerCase(); // Use optional chaining for safety

    if (args.length < 1) {
      return reply(
        `Example: ${prefix + command} <setting/all>\n\n` +
        `- Use *all* to reset ALL YOUR BOT'S custom settings.\n` +
        `- Use a specific setting name (e.g., *${prefix + command} menustyle*) to reset only that.`
      );
    }

    // Target the current bot instance's settings
    const currentBotInstanceJid = Matrix.user.id;
    db.data.users[currentBotInstanceJid] = db.data.users[currentBotInstanceJid] || {}; // Ensure it exists

    if (settingToReset === "all") {
      // Replace all settings for this specific bot instance with defaults
      db.data.users[currentBotInstanceJid] = { ...defaultMyBotSettings };
      reply("✅ All YOUR BOT'S custom settings have been reset to default.");
    } else if (settingToReset in defaultMyBotSettings) {
      // Reset only a specific setting for this bot instance
      db.data.users[currentBotInstanceJid][settingToReset] = defaultMyBotSettings[settingToReset];
      reply(`✅ YOUR BOT'S *${settingToReset}* has been reset to *${defaultMyBotSettings[settingToReset]}*.`);
    } else {
      reply(
        "⚠️ Invalid setting name for YOUR BOT. Use *" + prefix + command + " all* to reset everything or provide a valid setting name (like menustyle, autoreact, etc.)."
      );
    }

    // Persist the changes to the database
    if (global.dbToken) {
      await global.writeDB();
    } else {
      await global.db.write();
    }
  }
}
];
