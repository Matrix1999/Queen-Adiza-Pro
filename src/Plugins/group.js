const fs = require('fs');
const path = require('path'); 
const premiumSystem = require('../../lib/premiumSystem');
const { sleep } = require('../../lib/myfunc');
const { generateProfilePicture } = require('@whiskeysockets/baileys');



module.exports = [
 {
  command: ['add'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;
    const text = context.text;

    if (!m.isGroup) return reply(mess.group);

    // Check if sender is creator or premium user
    const senderIsPremium = premiumSystem.isPremium(m.sender);
    if (!context.isCreator && !senderIsPremium) {
      return reply("❌ You must be the bot owner or a premium user to use this command.");
    }

    let targetJid;

    if (m.quoted && m.quoted.sender) {
      targetJid = m.quoted.sender;
    } else if (text) {
      const number = text.replace(/[^0-9]/g, "");
      if (!number) {
        return reply("❌ Please provide a valid number to add.");
      }
      targetJid = number + "@s.whatsapp.net";
    } else {
      return reply("❌ Please mention or reply to the user you want to add.");
    }

    try {
      await Matrix.groupParticipantsUpdate(m.chat, [targetJid], "add");
      reply(mess.done);
    } catch (error) {
      reply(`❌ Failed to add user: ${error.message}`);
    }
  }
}, 

 {
    command: ['antibadword', 'antitoxic'],
    operate: async (context) => {
        const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

        if (!m.isGroup) return reply(mess.group); 
        const botJid = Matrix.user?.id || Matrix.user?.jid || Matrix.user || "default";
        // Ensure the database structure exists for this bot instance
        db.data.users[botJid] = db.data.users[botJid] || {};
        db.data.users[botJid].badwords = db.data.users[botJid].badwords || [];

        const badwordsList = db.data.users[botJid].badwords; // Reference to the bot's badwords list

        const action = args[0]?.toLowerCase(); 
        const value = args.slice(1).join(' ').toLowerCase();       
        if (action === "add") {
            if (!isCreator) return reply(mess.creator);
            if (!value) return reply("*Usage: .antibadword add <word>*"); 
            
            if (badwordsList.includes(value)) {
                return reply(`*'${value}' is already in the bad words list for this bot.*`);
            }
            badwordsList.push(value); 
            return reply(`*Successfully added '${value}' to the bad words list for this bot.*`);
        }

        if (action === "remove") {
            if (!isCreator) return reply(mess.creator); 
            if (!value) return reply("*Usage: .antibadword remove <word>*"); 

            const index = badwordsList.indexOf(value);
            if (index === -1) {
                return reply(`*'${value}' is not found in the bad words list for this bot.*`);
            }
            badwordsList.splice(index, 1); 
            return reply(`*Successfully removed '${value}' from the bad words list for this bot.*`);
        }

        if (action === "list") {
            if (!isCreator) return reply(mess.creator);
            if (badwordsList.length === 0) {
                return reply("*The bad words list is currently empty for this bot.*");
            }
            // Display all words in the list
            return reply(`*Bad Words for this bot:*\n\n${badwordsList.map(w => `- ${w}`).join('\n')}`);
        }


        if (!isBotAdmins) return reply(mess.admin); 
        if (!isAdmins && !isCreator) return reply(mess.notadmin); 

        if (action === "on" || action === "off") {
            // Default mode is 'delete' if not specified (e.g., '.antibadword on')
            const mode = value.toLowerCase() || "delete"; 
            if (!["delete", "kick"].includes(mode)) {
                return reply("*Invalid mode! Use 'delete' or 'kick' (default is 'delete').*");
            }

            if (action === "on") {
                if (mode === "delete") {
                    db.data.chats[from].badword = true; // Enable delete mode for the chat
                    db.data.chats[from].badwordkick = false; // Disable kick mode
                } else if (mode === "kick") {
                    db.data.chats[from].badwordkick = true; // Enable kick mode for the chat
                    db.data.chats[from].badword = false; // Disable delete mode
                }
                reply(`*Successfully enabled antibadword ${mode} mode in this group!*`);
            } else if (action === "off") {
                if (mode === "delete") { // If turning off 'delete' mode for the chat
                    db.data.chats[from].badword = false;
                } else if (mode === "kick") { // If turning off 'kick' mode for the chat
                    db.data.chats[from].badwordkick = false;
                }
                reply(`*Successfully disabled antibadword ${mode} mode in this group!*`);
            }
        } else {
            // Provide general usage instructions if no valid action is given
            reply("*Usage:*\n" +
                  "*.antibadword <on/off> [delete/kick]* - Toggle antibadword feature for this group (Group Admin/Creator).\n" +
                  "*.antibadword add <word>* - Add a word to the bot's bad words list (Bot Creator only).\n" +
                  "*.antibadword remove <word>* - Remove a word from the bot's bad words list (Bot Creator only).\n" +
                  "*.antibadword list* - List all bad words for this bot (Bot Creator only).");
        }
    },
},
 {
    command: ['antibot'],
    operate: async (context) => {
        const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isBotAdmins) return reply(mess.admin);
        if (!isAdmins && !isCreator) return reply(mess.notadmin);
        if (args.length < 1) return reply("*on or off?*");
        if (args[0] === "on") {
            db.data.chats[from].antibot = true;
            reply(`*Successfully enabled ${command}*`);
        } else if (args[0] === "off") {
            db.data.chats[from].antibot = false;
            reply(`*Successfully disabled ${command}*`);
        }
    }
}, {
  command: ["anticontact"],
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;
    
    if (!m.isGroup) return reply(mess.group);
    if (!isBotAdmins) return reply(mess.botAdmin);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);
    
    if (args.length < 1) return reply(`*Usage: .${command} <on/off>*`);
    
    const state = args[0].toLowerCase();
    if (!["on", "off"].includes(state)) return reply("*Invalid state! Use either 'on' or 'off'.*");
    
    db.data.chats[from].anticontact = state === 'on';
    return reply(`*Anticontact has been turned ${state}.*`);
  }
}, {
  command: ["antiaudio"],
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

    if (!m.isGroup) return reply(mess.group);
    if (!isBotAdmins) return reply(mess.botAdmin);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);

    if (args.length < 1) return reply(`*Usage: .${command} <on/off>*`);

    const state = args[0].toLowerCase();
    if (!["on", "off"].includes(state)) return reply("*Invalid state! Use either 'on' or 'off'.*");

    db.data.chats[from].antiaudio = state === 'on';
    return reply(`*Antiaudio has been turned ${state}.*`);
  }
}, {
  command: ["antiimage"],
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

    if (!m.isGroup) return reply(mess.group);
    if (!isBotAdmins) return reply(mess.botAdmin);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);

    if (args.length < 1) return reply(`*Usage: .${command} <on/off>*`);

    const state = args[0].toLowerCase();
    if (!["on", "off"].includes(state)) return reply("*Invalid state! Use either 'on' or 'off'.*");

    db.data.chats[from].antiimage = state === 'on';
    return reply(`*Antiimage has been turned ${state}.*`);
  }
}, {
  command: ["antimedia"],
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

    if (!m.isGroup) return reply(mess.group);
    if (!isBotAdmins) return reply(mess.botAdmin);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);

    if (args.length < 1) return reply(`*Usage: .${command} <on/off>*`);

    const state = args[0].toLowerCase();
    if (!["on", "off"].includes(state)) return reply("*Invalid state! Use either 'on' or 'off'.*");

    db.data.chats[from].antimedia = state === 'on';
    return reply(`*Antimedia has been turned ${state}.*`);
  }
}, {
  command: ["antivirtex", "antitag"], // Alias included
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

    if (!m.isGroup) return reply(mess.group);
    if (!isBotAdmins) return reply(mess.botAdmin);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);

    if (args.length < 1) return reply(`*Usage: .${command} <on/off>*`);

    const state = args[0].toLowerCase();
    if (!["on", "off"].includes(state)) return reply("*Invalid state! Use either 'on' or 'off'.*");

    db.data.chats[from].antivirtex = state === 'on';
    return reply(`*Antivirtex has been turned ${state}.*`);
  }
}, {
  command: ["antivirus", "antimalware"], // Alias included
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

    if (!m.isGroup) return reply(mess.group);
    if (!isBotAdmins) return reply(mess.botAdmin);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);

    if (args.length < 1) return reply(`*Usage: .${command} <on/off>*`);

    const state = args[0].toLowerCase();
    if (!["on", "off"].includes(state)) return reply("*Invalid state! Use either 'on' or 'off'.*");

    db.data.chats[from].antivirus = state === 'on';
    return reply(`*Antivirus has been turned ${state}.*`);
  }
}, {
  command: ["antivideo"],
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

    if (!m.isGroup) return reply(mess.group);
    if (!isBotAdmins) return reply(mess.botAdmin);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);

    if (args.length < 1) return reply(`*Usage: .${command} <on/off>*`);

    const state = args[0].toLowerCase();
    if (!["on", "off"].includes(state)) return reply("*Invalid state! Use either 'on' or 'off'.*");

    db.data.chats[from].antivideo = state === 'on';
    return reply(`*Antivideo has been turned ${state}.*`);
  }
}, {
  command: ["antisticker"],
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

    if (!m.isGroup) return reply("This command can only be used in groups.");
    if (!isBotAdmins) return reply("I need to be an admin to enforce antisticker.");
    if (!isAdmins && !isCreator) return reply("Only group admins or the bot owner can toggle this setting.");
    
    if (!args[0]) return reply(`Usage: .${command} <on/off>\nExample: .${command} on`);

    const choice = args[0].toLowerCase();
    if (!["on", "off"].includes(choice)) return reply("Please choose either *on* or *off*.");

    db.data.chats[from].antisticker = choice === "on";
    return reply(`Antisticker is now *${choice === "on" ? "enabled" : "disabled"}* in this group.`);
  }
}, {
  command: ["antispam"],
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, command, reply } = context;

    if (!m.isGroup) return reply("This command can only be used in groups.");
    if (!isBotAdmins) return reply("I need to be an admin to enforce antispam.");
    if (!isAdmins && !isCreator) return reply("Only group admins or the bot owner can toggle this setting.");
    
    if (!args[0]) return reply(`Usage: .${command} <on/off>\nExample: .${command} on`);

    const choice = args[0].toLowerCase();
    if (!["on", "off"].includes(choice)) return reply("Please choose either *on* or *off*.");

    db.data.chats[from].antispam = choice === "on";
    return reply(`Antispam is now *${choice === "on" ? "enabled" : "disabled"}* in this group.`);
  }
}, {
  command: ["antispam1"],
  operate: async (context) => {
    const { m, db, from, isBotAdmins, isAdmins, isCreator, args, command, reply } = context;

    if (!m.isGroup) return reply("This command can only be used in groups sir/madam.");
    if (!isBotAdmins) return reply("I need to be an admin to enforce antispam1.");
    if (!isAdmins && !isCreator) return reply("Only group admins or the bot owner can toggle this setting.");
    
    if (!args[0]) return reply(`Usage: .${command} <on/off>\nExample: .${command} on`);

    const choice = args[0].toLowerCase();
    if (!["on", "off"].includes(choice)) return reply("Please choose either *on* or *off*.");

    db.data.chats[from].antispam1 = choice === "on";
    return reply(`Antispam1 is now *${choice === "on" ? "enabled" : "disabled"}* in this group🚀.`);
  }
}, 

 {
    command: ['antilinkgc'],
    operate: async (context) => {
        const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

        if (!m.isGroup) return reply(mess.group); 
        if (!isBotAdmins) return reply(mess.admin); 
        if (!isAdmins && !isCreator) return reply(mess.notadmin); 
        if (args.length < 2) return reply("*Usage: .antilinkgc <delete/kick> <on/off>*");

        const mode = args[0].toLowerCase();
        const state = args[1].toLowerCase();

        if (!["delete", "kick"].includes(mode)) {
            return reply("*Invalid mode! Use either 'delete' or 'kick'.*");
        }

        if (!["on", "off"].includes(state)) {
            return reply("*Invalid state! Use either 'on' or 'off'.*");
        }

        if (state === "on") {
            if (mode === "delete") {
                db.data.chats[from].antilinkgc = true;
                db.data.chats[from].antilinkgckick = false;
            } else if (mode === "kick") {
                db.data.chats[from].antilinkgckick = true;
                db.data.chats[from].antilinkgc = false;
            }
            reply(`*Successfully enabled antilinkgc ${mode} mode!*`);
        } else if (state === "off") {
            if (mode === "delete") {
                db.data.chats[from].antilinkgc = false;
            } else if (mode === "kick") {
                db.data.chats[from].antilinkgckick = false;
            }
            reply(`*Successfully disabled antilinkgc ${mode} mode!*`);
        }
    },
}, {
    command: ['close'],
    operate: async (context) => {
        const { m, mess, isAdmins, isCreator, isBotAdmins, Matrix, reply } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);

        Matrix.groupSettingUpdate(m.chat, "announcement");
        reply("Group closed by admin. Only admins can send messages.");
    }
}, {
  command: ["closetime"],
  operate: async (context) => {
    if (!context.m.isGroup) {
      return context.reply(context.mess.group);
    }

    if (!context.isAdmins && !context.isCreator) {
      return context.reply(context.mess.notadmin);
    }

    if (!context.isBotAdmins) {
      return context.reply(context.mess.admin);
    }

    if (context.args.length < 2) {
      return context.reply(
        "*Usage: .closetime <number> <unit>*\n*Example: .closetime 10 minutes*"
      );
    }

    const amount = context.args[0];
    const unit = context.args[1].toLowerCase();
    let delay;

    switch (unit) {
      case "seconds":
        delay = amount * 1000;
        break;
      case "minutes":
        delay = amount * 60000;
        break;
      case "hours":
        delay = amount * 3600000;
        break;
      case "days":
        delay = amount * 86400000;
        break;
      default:
        return context.reply(
          "*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds"
        );
    }

    context.reply(`*Closing group after ${amount} ${unit}*`);
    setTimeout(() => {
      context.Matrix.groupSettingUpdate(context.m.chat, "announcement");
      context.reply("Group closed by admin. Only admins can send messages.");
    }, delay);
  }
}, 
{
    command: ['delppgroup'],
    operate: async (context) => {
        const { m, mess, isAdmins, isCreator, isBotAdmins, Matrix, reply, from } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);
        
        await Matrix.removeProfilePicture(from);
        reply("Group profile picture has been successfully removed.");
    }
}, {
  command: ['demote'],
  desc: "Demote a member (or multiple) from admin. Usage: .demote @user or .demote 123456789",
  operate: async (context) => {
    const { m, mess, text, isAdmins, isGroupOwner, isCreator, isBotAdmins, Matrix, reply } = context;

    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.admin);

    let targets = [];

    if (m.mentionedJid && m.mentionedJid.length) {
      targets = m.mentionedJid;
    } else if (m.quoted && m.quoted.sender) {
      targets = [m.quoted.sender];
    } else if (text) {
      let numbers = text.match(/\d{5,}/g);
      if (numbers) {
        targets = numbers.map(num => num + "@s.whatsapp.net");
      }
    }

    if (!targets.length) {
      return reply("❌ Please mention, reply to, or provide the number(s) of the user(s) you want to demote.\nExample: .demote @user or .demote 123456789");
    }

    // Remove group owner from targets if present (usually owner can't be demoted)
    const groupMetadata = await Matrix.groupMetadata(m.chat).catch(() => null);
    if (groupMetadata && groupMetadata.owner) {
      targets = targets.filter(jid => jid !== groupMetadata.owner);
    }

    let demoted = [];
    for (let jid of targets) {
      try {
        await Matrix.groupParticipantsUpdate(m.chat, [jid], "demote");
        demoted.push(jid);
      } catch (e) {
        // ignore failures for now
      }
    }

    if (!demoted.length) {
      return reply("❌ No users were demoted.");
    }

    // Send simple confirmation message with mentions but no bullets
    reply("✅ Demotion done:", { mentions: demoted });
  }
}, 
{
  command: ['editsettings', 'editinfo'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;
    const prefix = context.prefix;
    const command = context.command;
    const args = context.args;

    // Permission checks similar to promote command
    if (!m.isGroup) return reply(mess.group);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.admin);
    if (!context.isBotAdmins) return reply(mess.admin);

    if (!args || args.length === 0) {
      return reply(`❌ Usage: ${prefix + command} on/off`);
    }

    const option = args[0].toLowerCase();

    try {
      if (option === "on") {
        await Matrix.groupSettingUpdate(m.chat, "unlocked");
        reply(`✅ Successful, members can now edit group info.`);
      } else if (option === "off") {
        await Matrix.groupSettingUpdate(m.chat, "locked");
        reply(`✅ Successful, members cannot edit group info.`);
      } else {
        reply(`❌ Invalid option.\nExample usage: ${prefix + command} on/off`);
      }
    } catch (error) {
      console.error('Error updating group info setting:', error);
      reply('❌ Failed to update group info settings. Please try again later.');
    }
  }
}, 
 {
  command: ['grouplink'],
  operate: async ({ Matrix, m, reply, isAdmins, isGroupOwner, isCreator, mess, isBotAdmins, groupMetadata }) => {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.admin);

    let response = await Matrix.groupInviteCode(m.chat);
    Matrix.sendText(
      m.chat,
      `*GROUP LINK*\n\n*NAME:* ${groupMetadata.subject}\n\n*OWNER:* ${groupMetadata.owner !== undefined ? "+" + groupMetadata.owner.split`@`[0] : "Unknown"}\n\n*ID:* ${groupMetadata.id}\n\n*LINK:* https://chat.whatsapp.com/${response}\n\n*MEMBERS:* ${groupMetadata.participants.length}`,
      m,
      {
        detectLink: true,
      }
    );
  }
}, {
    command: ['hidetag', 'tag'], 
    operate: async (context) => {
        const { m, isAdmins, isGroupOwner, isCreator, mess, participants, Matrix, isBotAdmins } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);
        const quotedText = m.quoted ? m.quoted.text : null;
        const providedText = m.text?.split(" ").slice(1).join(" ") || null;
        const textToSend = quotedText || providedText || "No message provided";
        await Matrix.sendMessage(
            m.chat,
            {
                text: textToSend,
                mentions: participants.map((a) => a.id),
            },
            {
                quoted: m,
            }
        );
    }
}, {
  command: ['invite'],
  operate: async (context) => {
    const { m, mess, text, prefix, Matrix, isBotAdmins, reply } = context;
    if (!m.isGroup) return reply(mess.group);
    if (!isBotAdmins) return reply(mess.admin);
    if (!text)
      return reply(
        `*Enter the number you want to invite to this group*\n\nExample :\n${prefix + context.command} 254796180105`
      );
    if (text.includes("+"))
      return reply(`*Enter the number together without* *+*`);
    if (isNaN(text))
      return reply(
        `*Enter only the numbers with your country code without spaces*`
      );

    let group = m.chat;
    let link = "https://chat.whatsapp.com/" + (await Matrix.groupInviteCode(group));
    await Matrix.sendMessage(text + "@s.whatsapp.net", {
      text: `*GROUP INVITATION*\n\🚀Matrix invites you to join his group🪀: \n\n${link}`,
      mentions: [m.sender],
    });
    reply(`*Successfully sent invite link*`);

    // New line: Send confirmation message in the group chat
    await Matrix.sendMessage(group, { text: "Invitation sent ✅" });
  }
}, 
{
    command: ['kick', 'remove'],
    operate: async (context) => {
        const { m, mess, text, isAdmins, isGroupOwner, isCreator, isBotAdmins, Matrix } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);

        let bck = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await Matrix.groupParticipantsUpdate(m.chat, [bck], "remove");
        reply(mess.done);
    }
}, {
  command: ["kickall"],
  operate: async ({ Matrix, m, reply, participants, isAdmins, isBotAdmins, isCreator }) => {
    if (!m.isGroup) return reply("❌ *This command is for group chats only!*");
    if (!isBotAdmins) return reply("❌ *I need to be admin to remove members!*");
    if (!isAdmins && !isCreator) return reply("❌ *Only group admins can use this command!*");

    // Filter out admins, the bot, and the sender
    const usersToKick = participants
      .filter(p =>
        !p.admin &&
        p.id !== m.sender && // don't remove the sender
        p.id !== m.botNumber // don't remove the bot itself
      )
      .map(p => p.id);

    if (usersToKick.length === 0) return reply("⚠️ *No members to remove.*");

    await Matrix.groupParticipantsUpdate(m.chat, usersToKick, "remove");
    await reply(`✅ *Removed ${usersToKick.length} member(s).*`);
  }
}, {
  command: ["kickcode"],
  desc: "Kick members by country code(s). Example: .kickcode 233 234",
  operate: async ({ Matrix, m, text, reply, participants, isAdmins, isBotAdmins, isCreator }) => {
    if (!m.isGroup) return reply("❌ *This command is for group chats only!*");
    if (!isBotAdmins) return reply("❌ *I need to be admin to remove members!*");
    if (!isAdmins && !isCreator) return reply("❌ *Only group admins can use this command!*");

    const codes = text.split(" ").filter(code => /^\d+$/.test(code));
    if (!codes.length) return reply("⚠️ *Provide one or more country codes.*\n\nExample: .kickcode 233 234 62");

    const botNumber = (m.botNumber || Matrix.user?.id || "").split("@")[0];

    const usersToKick = participants.filter(p => {
      const number = p.id.split("@")[0];
      return (
        !p.admin &&
        number !== m.sender.split("@")[0] &&
        number !== botNumber &&
        codes.some(code => number.startsWith(code))
      );
    }).map(p => p.id);

    if (!usersToKick.length) return reply("⚠️ *No matching members found to remove.*");

    for (const id of usersToKick) {
      await Matrix.groupParticipantsUpdate(m.chat, [id], "remove").catch(() => {});
    }

    await reply(`✅ *Removed ${usersToKick.length} member(s) with code(s): ${codes.join(", ")}*`);
  }
}, {
  command: ['listonline', 'onlinemembers'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;

    console.log('listonline command invoked by:', m.sender);
    if (!m.isGroup) {
      console.log('Not a group chat.');
      return reply(mess.group);
    }
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) {
      console.log('User lacks admin/owner/creator permissions.');
      return reply(mess.admin);
    }

    const args = context.args || [];
    let groupId = (args[0] && /\d+\-\d+@g.us/.test(args[0])) ? args[0] : m.chat;
    console.log('Checking presence for group:', groupId);

    if (!context.store) {
      console.log('context.store is undefined.');
      return reply('❌ Presence data not available. The bot may not be tracking online status.');
    }
    if (!context.store.presences) {
      console.log('context.store.presences is undefined.');
      return reply('❌ Presence data not available. The bot may not be tracking online status.');
    }

    let presences = context.store.presences[groupId];
    console.log('Presence data for group:', presences);

    if (!presences || Object.keys(presences).length === 0) {
      console.log('No online members detected in this group.');
      return reply('*No online members detected in this group.*');
    }

    let onlineMembers = [...Object.keys(presences)];
    if (context.botNumber) onlineMembers.push(context.botNumber);
    console.log(`Online members count: ${onlineMembers.length}`);

    let counter = 1;
    let message = '*ONLINE MEMBERS IN THIS GROUP*\n\n' +
      onlineMembers.map(jid => `${counter++}. @${jid.split('@')[0]}`).join('\n');

    console.log('Sending online members list...');
    await Matrix.sendText(m.chat, message, m, { mentions: onlineMembers });
  }
}, 
{
  command: ['mediatag'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;

    // Permission checks similar to promote command
    if (!m.isGroup) return reply(mess.group);
    if (!context.isBotAdmins) return reply(mess.admin);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.admin);

    if (!m.quoted) {
      return reply(`Reply to any media with caption ${context.prefix + context.command}`);
    }

    try {
      await Matrix.sendMessage(m.chat, {
        forward: m.quoted.fakeObj,
        mentions: context.participants.map(p => p.id),
      });
    } catch (error) {
      console.error('mediatag error:', error);
      reply('Failed to forward media. Please try again.');
    }
  }
}, 

{
    command: ['open'],
    operate: async (context) => {
        const { m, mess, isAdmins, isCreator, isBotAdmins, Matrix } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);

        Matrix.groupSettingUpdate(m.chat, "not_announcement");
        reply("Group opened by admin. Members can now send messages.");
    }
}, {
  command: ['opentime'],
  operate: async (context) => {
    if (!context.m.isGroup) {
      return context.reply(context.mess.group);
    }
    if (!context.isAdmins && !context.isCreator) {
      return context.reply(context.mess.notadmin);
    }
    if (!context.isBotAdmins) {
      return context.reply(context.mess.admin);
    }

    const duration = context.args[0];
    const unit = context.args[1]?.toLowerCase();

    if (!duration || !unit) {
      return context.reply(
        "*Usage: .opentime <number> <unit>*\n*Example: .opentime 10 minutes*"
      );
    }

    let timer;
    switch (unit) {
      case "seconds":
        timer = duration * 1000;
        break;
      case "minutes":
        timer = duration * 60000;
        break;
      case "hours":
        timer = duration * 3600000;
        break;
      case "days":
        timer = duration * 86400000;
        break;
      default:
        return context.reply(
          "*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds"
        );
    }

    context.reply(`*Opening group after ${duration} ${unit}*`);
    setTimeout(() => {
      context.Matrix.groupSettingUpdate(context.m.chat, "not_announcement");
      context.reply("Group opened by admin. Members can now send messages.");
    }, timer);
  }
}, 
{
  command: ['poll'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;
    const text = context.text;
    const prefix = context.prefix;
    const command = context.command;

    // Permission checks consistent with promote command
    if (!m.isGroup) return reply(mess.group);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.admin);

    if (!text || !text.includes('|')) {
      return reply(
        `❌ Please provide a question and options separated by '|'.\n` +
        `Example:\n${prefix}poll Who is the best player?|Messi,Ronaldo,None`
      );
    }

    const parts = text.split('|');
    if (parts.length < 2) { // Ensure there's at least a question and options part
      return reply(
        `❌ Please provide a question and at least one set of options separated by '|'.\n` +
        `Example:\n${prefix}poll Who is the best player?|Messi,Ronaldo,None`
      );
    }

    const question = parts[0].trim();
    const rawOptions = parts[1].split(',');

    // Filter out empty or whitespace-only options and ensure at least two options
    const options = rawOptions.map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (options.length < 2) {
      return reply(
        `❌ Please provide at least two valid options separated by commas after the '|'.\n` +
        `Example:\n${prefix}poll Who is the best player?|Messi,Ronaldo,None`
      );
    }

    // WhatsApp poll API limit: 12 options
    if (options.length > 12) {
        return reply('❌ A poll can have a maximum of 12 options.');
    }

    try {
      await Matrix.sendMessage(m.chat, {
        poll: {
          name: question,
          values: options,
        },
      });
    } catch (error) {
      console.error('Poll command error:', error);
      reply('❌ Failed to create poll. Please try again later.');
    }
  }
}, 

 {
  command: ['promote'],
  desc: "Promote a member (or multiple) to admin. Usage: .promote @user or .promote 123456789",
  operate: async (context) => {
    const { m, mess, text, isAdmins, isGroupOwner, isCreator, isBotAdmins, Matrix, reply } = context;

    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.admin);

    let targets = [];

    if (m.mentionedJid && m.mentionedJid.length) {
      targets = m.mentionedJid;
    } else if (m.quoted && m.quoted.sender) {
      targets = [m.quoted.sender];
    } else if (text) {
      let numbers = text.match(/\d{5,}/g);
      if (numbers) {
        targets = numbers.map(num => num + "@s.whatsapp.net");
      }
    }

    if (!targets.length) {
      return reply("❌ Please mention, reply to, or provide the number(s) of the user(s) you want to promote.\nExample: .promote @user or .promote 123456789");
    }

    // Remove group owner from targets if present
    const groupMetadata = await Matrix.groupMetadata(m.chat).catch(() => null);
    if (groupMetadata && groupMetadata.owner) {
      targets = targets.filter(jid => jid !== groupMetadata.owner);
    }

    let promoted = [];
    for (let jid of targets) {
      try {
        await Matrix.groupParticipantsUpdate(m.chat, [jid], "promote");
        promoted.push(jid);
      } catch (e) {
        // ignore failures for now
      }
    }

    if (!promoted.length) {
      return reply("❌ No users were promoted.");
    }

    // Send simple confirmation message with mentions but no bullets
    reply("✅ Promotion done:", { mentions: promoted });
  }
}, 

 {
    command: ['resetlink'],
    operate: async (context) => {
        const { m, isAdmins, isGroupOwner, isCreator, mess, Matrix, isBotAdmins } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);

        await Matrix.groupRevokeInvite(m.chat).then((res) => {
          reply(mess.done);
        });
    }
}, {
  command: ['setdesc'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;
    const text = context.text;

    // Permission checks consistent with promote command
    if (!m.isGroup) return reply(mess.group);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.notadmin);
    if (!context.isBotAdmins) return reply(mess.admin);

    if (!text || text.trim().length === 0) {
      return reply("*Please enter a description text.*");
    }

    try {
      await Matrix.groupUpdateDescription(m.chat, text.trim());
      reply(mess.done);
    } catch (error) {
      console.error('Error updating group description:', error);
      reply('❌ Failed to update group description. Please try again later.');
    }
  }
}, 
{
  command: ["joinlist"],
  tags: ["group"],
  help: ["joinlist"],
  operate: async ({ Matrix, m, reply }) => {
    try {
      const groupId = m.chat;
      const metadata = await Matrix.groupMetadata(groupId);
      const groupName = metadata.subject;
      const pendingList = await Matrix.groupRequestParticipantsList(groupId);

      if (!pendingList || pendingList.length === 0) {
        return reply(`*No pending join requests found in group ${groupName}.*`);
      }

      const countryCodes = {
        "92": "Pakistan 🇵🇰",
        "234": "Nigeria 🇳🇬",
        "254": "Kenya 🇰🇪",
        "1": "USA 🇺🇸",
        "44": "UK 🇬🇧",
        "212": "Morocco 🇲🇦",
        "233": "Ghana 🇬🇭",
        "255": "Tanzania 🇹🇿",
        "242": "Congo 🇨🇬",
        "276": "South Africa 🇿🇦",
        "91": "India 🇮🇳",
        "62": "Indonesia 🇮🇩",
        "880": "Bangladesh 🇧🇩",
        "201": "Egypt 🇪🇬",
        "252": "Somalia 🇸🇴",
        "263": "Zimbabwe 🇿🇼",
        "277": "South Africa 🇿🇦",
        "947": "Sri Lanka 🇱🇰",
        "966": "Saudi Arabia 🇸🇦",
        "971": "UAE 🇦🇪",
        "393": "San Marino 🇸🇲",
        "358": "Finland 🇫🇮"
      };

      let grouped = {};

      pendingList.forEach((p, i) => {
        const jid = p.jid || p.user;
        const number = jid.replace("@s.whatsapp.net", "");
        let code = number.substring(0, 3);

        // handle specific longer prefixes
        if (number.startsWith("923")) code = "92";
        else if (number.startsWith("234")) code = "234";
        else if (number.startsWith("254")) code = "254";
        else if (number.startsWith("212")) code = "212";
        else if (number.startsWith("233")) code = "233";
        else if (number.startsWith("255")) code = "255";
        else if (number.startsWith("276")) code = "276";
        else if (number.startsWith("880")) code = "880";
        else if (number.startsWith("201")) code = "201";
        else if (number.startsWith("252")) code = "252";
        else if (number.startsWith("263")) code = "263";
        else if (number.startsWith("277")) code = "277";
        else if (number.startsWith("947")) code = "947";
        else if (number.startsWith("966")) code = "966";
        else if (number.startsWith("971")) code = "971";
        else if (number.startsWith("393")) code = "393";
        else if (number.startsWith("358")) code = "358";
        else if (number.startsWith("1")) code = "1";
        else if (number.startsWith("44")) code = "44";
        else if (number.startsWith("91")) code = "91";
        else if (number.startsWith("62")) code = "62";
        else if (number.startsWith("242")) code = "242";

        if (!grouped[code]) grouped[code] = [];
        grouped[code].push(`*${i + 1}.* ${number}`);
      });

      let text = `*Total Pending Join Requests for Group: ${groupName}: ${pendingList.length}*\n`;

      if (grouped["92"]) {
        text += `\n*Pakistan 🇵🇰:*\n${grouped["92"].join("\n")}`;
        delete grouped["92"];
      }

      for (let code in grouped) {
        text += `\n*${countryCodes[code] || "Others 🌍"}:*\n${grouped[code].join("\n")}`;
      }

      await reply(text);
    } catch (e) {
      console.error("Error in joinlist:", e);
      await reply("*Error:* Could not fetch the list of pending join requests. Please try again later.");
    }
  }
}, {
  command: ['setgroupname', 'setgcname'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;
    const text = context.text;

    // Permission checks similar to promote command
    if (!m.isGroup) return reply(mess.group);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.admin);
    if (!context.isBotAdmins) return reply(mess.admin);

    if (!text || text.trim().length === 0) {
      return reply("*Please provide the desired group name.*");
    }

    try {
      await Matrix.groupUpdateSubject(m.chat, text.trim());
      reply(mess.done);
    } catch (error) {
      console.error('Error setting group name:', error);
      reply('❌ Failed to update group name. Please try again later.');
    }
  }
}, 
{
  command: ['setppgroup'],
  operate: async ({ m, reply, mess, isAdmins, isCreator, isBotAdmins, Matrix, quoted, mime, prefix, command, args }) => {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);
    if (!isBotAdmins) return reply(mess.admin);
    if (!quoted) return reply(`*Send or reply to an image with the caption ${prefix + command}*`);
    if (!/image/.test(mime)) return reply(`*Send or reply to an image with the caption ${prefix + command}*`);
    if (/webp/.test(mime)) return reply(`*Send or reply to an image with the caption ${prefix + command}*`);

    const medis = await Matrix.downloadAndSaveMediaMessage(quoted, "ppbot.jpeg");
    if (args[0] === "full") {
      const { img } = await generateProfilePicture(medis);
      await Matrix.query({
        tag: "iq",
        attrs: {
          to: m.chat,
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
      reply("Group profile picture has been successfully set.");
    } else {
      await Matrix.updateProfilePicture(m.chat, { url: medis });
      fs.unlinkSync(medis);
      reply("Group profile picture has been successfully updated.");
    }
  }
}, {
  command: ['tagadmin', 'listadmin', 'admin'],
  operate: async ({ Matrix, m, reply, mess, participants, groupMetadata }) => {
    if (!m.isGroup) return reply(mess.group);

    const groupAdmins = participants.filter((p) => p.admin);
    const listAdmin = groupAdmins
      .map((v, i) => `${i + 1}. @${v.id.split("@")[0]}`)
      .join("\n");
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === "superadmin")?.id || m.chat.split`-`[0] + "@s.whatsapp.net";
    let text = `*Group Admins Here:*\n${listAdmin}`.trim();

    Matrix.sendMessage(
      m.chat,
      { text: text, mentions: [...groupAdmins.map((v) => v.id), owner] },
      { quoted: m }
    );
  }
},
{
  command: ['tagall'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;

    // Permission checks like promote command
    if (!m.isGroup) return reply(mess.group);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.admin);
    if (!context.isBotAdmins && !context.isCreator) return reply(mess.botAdmin);

    let messageText = `*👥 You have Tag All*\n\n🗞️ *Message : ${context.q ? context.q : 'blank'}*\n\n`;

    for (const member of context.participants) {
      messageText += `• @${member.id.split('@')[0]}\n`;
    }

    await Matrix.sendMessage(
      m.chat,
      {
        text: messageText,
        mentions: context.participants.map(p => p.id),
      },
      {
        quoted: m,
      }
    );
  }
}, 

{
  command: ['totalmembers'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;

    // Permission checks similar to promote command
    if (!m.isGroup) return reply(mess.group);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.admin);

    try {
      const groupMetadata = await Matrix.groupMetadata(m.chat);
      const totalMembers = groupMetadata.participants.length;
      const groupName = groupMetadata.subject || 'Unknown Group';

      const adminCount = groupMetadata.participants.filter(p => p.admin).length;

      const message = 
        `📊 *Group Info*\n\n` +
        `*Name:* ${groupName}\n` +
        `*Total Members:* ${totalMembers}\n` +
        `*Admins:* ${adminCount}\n` +
        `*Group ID:* ${groupMetadata.id}`;

      await Matrix.sendMessage(m.chat, { text: message }, { quoted: m });
    } catch (error) {
      console.error('Error fetching group info:', error);
      reply('❌ Failed to retrieve group information. Please try again later.');
    }
  }
}, 
{
  command: ['userid', 'userjid'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;

    // Permission check similar to promote command
    if (!m.isGroup) return reply(mess.group);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.admin);

    try {
      const groupMetadata = await Matrix.groupMetadata(m.chat);
      if (!groupMetadata || !groupMetadata.participants) {
        return reply('❌ Failed to fetch group participants.');
      }

      let message = `Here is the JID address of all users in\n*${groupMetadata.subject}*\n\n`;
      for (const participant of groupMetadata.participants) {
        message += `□ ${participant.id}\n`;
      }

      reply(message);
    } catch (error) {
      console.error('Error fetching user JIDs:', error);
      reply('❌ An error occurred while fetching the user list. Please try again later.');
    }
  }
},    {
  command: ['groupsettings', 'gsettings'],
  operate: async ({
    m,             // Message object (first instance)
    reply,
    db,
    isCreator,
    isAdmins,
    isGroupOwner
    // The duplicate 'm' has been removed from here
  }) => {
    if (!m.isGroup) {
      return reply("ℹ️ This command displays settings specific to group chats. Please use it inside a group.");
    }

    // Access control for group usage: Creator OR Group Admin OR Group Owner
    if (!isCreator && !isAdmins && !isGroupOwner) {
      // Assuming 'mess' is available globally or passed in context if needed here
      // Re-added mess to destructuring for consistency if it's used
      // Let's assume 'mess' is also passed in the context for this command.
      return reply("❌ You must be the bot creator, a group admin, or the group owner to use this command here.");
    }

    const groupChatSettings = db.data.chats[m.chat] || {};

    let displayMessage = `⚙️ *Settings for This Group Chat (${(m.chat || '').split('@')[0]}):*\n\n`;
    let hasSettings = false;

    for (const key in groupChatSettings) {
      if (groupChatSettings.hasOwnProperty(key)) {
        hasSettings = true;
        const value = groupChatSettings[key];
        const formattedValue = typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : value;
        displayMessage += `❄️ *${key}*: ${formattedValue}\n`;
      }
    }

    if (!hasSettings) {
        displayMessage += "No specific settings found for this group.";
    }

    await reply(displayMessage);
  }
 },

{
  command: ['vcf'],
  operate: async (context) => {
    const m = context.m;
    const mess = context.mess;
    const reply = context.reply;
    const Matrix = context.Matrix;

    // Permission checks matching promote command style
    if (!m.isGroup) return reply(mess.group);
    if (!context.isAdmins && !context.isGroupOwner && !context.isCreator) return reply(mess.admin);

    try {
      // Get group metadata
      const groupMeta = await Matrix.groupMetadata(m.chat);

      // Build vCard string for all participants
      let vcardData = '';
      let index = 0;
      for (const participant of groupMeta.participants) {
        const number = participant.id.split('@')[0];
        vcardData += 
          `BEGIN:VCARD\n` +
          `VERSION:3.0\n` +
          `FN:[${index++}] +${number}\n` +
          `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n` +
          `END:VCARD\n`;
      }

      const filePath = './contacts.vcf';

      // Inform user about saving process
      await reply(`\nPlease wait, saving ${groupMeta.participants.length} contacts...`);

      // Write vCard data to file
      fs.writeFileSync(filePath, vcardData.trim());

      // Wait a bit to ensure file is ready (optional)
      await sleep(2000);

      // Send vCard file to group
      await Matrix.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(filePath),
          mimetype: 'text/vcard',
          fileName: 'Contacts.vcf',
          caption: `✅ Successful\n\nGroup: *${groupMeta.subject}*\nContacts: *${groupMeta.participants.length}*`,
        },
        { ephemeralExpiration: 86400, quoted: m }
      );

      // Clean up temporary file
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error('Error in vcf command:', error);
      reply('❌ Failed to generate contacts. Please try again later.');
    }
  }
}, 

];