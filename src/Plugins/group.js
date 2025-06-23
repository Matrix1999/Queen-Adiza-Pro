const fs = require('fs'); 
const { sleep } = require('../../lib/myfunc');
const { generateProfilePicture } = require('@whiskeysockets/baileys');


module.exports = [
 {
    command: ['add'],
    operate: async (context) => {
        const { m, mess, text, isCreator, reply,Matrix } = context;
        if (!m.isGroup) return m.reply(mess.group);
        if (!isCreator) return m.reply(mess.owner);
        
        let bws = m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await Matrix.groupParticipantsUpdate(m.chat, [bws], "add");
        reply(mess.done);
    }
}, {
    command: ['antibadword', 'antitoxic'],
    operate: async (context) => {
        const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

        if (!m.isGroup) return reply(mess.group);
        if (!isBotAdmins) return reply(mess.admin); 
        if (!isAdmins && !isCreator) return reply(mess.notadmin); 
        if (args.length < 2) return reply("*Usage: .antibadword <delete/kick> <on/off>*");

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
                db.data.chats[from].badword = true;
                db.data.chats[from].badwordkick = false;
            } else if (mode === "kick") {
                db.data.chats[from].badwordkick = true;
                db.data.chats[from].badword = false;
            }
            reply(`*Successfully enabled antibadword ${mode} mode!*`);
        } else if (state === "off") {
            if (mode === "delete") {
                db.data.chats[from].badword = false;
            } else if (mode === "kick") {
                db.data.chats[from].badwordkick = false;
            }
            reply(`*Successfully disabled antibadword ${mode} mode!*`);
        }
    },
}, {
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
}, {
    command: ['antilink'],
    operate: async (context) => {
        const { m, db, from, isBotAdmins, isAdmins, isCreator, args, mess, command, reply } = context;

        if (!m.isGroup) return reply(mess.group); 
        if (!isBotAdmins) return reply(mess.admin); 
        if (!isAdmins && !isCreator) return reply(mess.notadmin); 
        if (args.length < 2) return reply("*Usage: .antilink <delete/kick> <on/off>*");

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
          db.data.chats[from].antilinkkick = false;
          db.data.chats[from].antilink = true;
            } else if (mode === "kick") {
         db.data.chats[from].antilink = false;
         db.data.chats[from].antilinkkick = true;
            }
            reply(`*Successfully enabled antilink ${mode} mode!*`);
        } else if (state === "off") {
            if (mode === "delete") {
          db.data.chats[from].antilinkkick = false;
          db.data.chats[from].antilink = false;
            } else if (mode === "kick") {
         db.data.chats[from].antilink = false;
         db.data.chats[from].antilinkkick = false;
            }
            reply(`*Successfully disabled antilink ${mode} mode!*`);
        }
    }
}, {
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
  operate: async _0x66a44a => {
    const {
      m: _0x1732c3,
      mess: _0x45c8b1,
      args: _0x3780ac,
      isAdmins: _0x4c6fda,
      isCreator: _0x47f46f,
      isBotAdmins: _0x3b9267,
      Matrix: _0xe0220e,
      reply: _0xb497b4
    } = _0x66a44a;

    if (!_0x1732c3.isGroup) {
      return _0xb497b4(_0x45c8b1.group);
    }

    if (!_0x4c6fda && !_0x47f46f) {
      return _0xb497b4(_0x45c8b1.notadmin);
    }

    if (!_0x3b9267) {
      return _0xb497b4(_0x45c8b1.admin);
    }

    if (_0x3780ac.length < 2) {
      return _0xb497b4(
        "*Usage: .closetime <number> <unit>*\n*Example: .closetime 10 minutes*"
      );
    }

    const _0x29fdab = _0x3780ac[0];
    const _0x670dfe = _0x3780ac[1].toLowerCase();
    let _0x5c67b7;

    switch (_0x670dfe) {
      case "seconds":
        _0x5c67b7 = _0x29fdab * 1000;
        break;
      case "minutes":
        _0x5c67b7 = _0x29fdab * 60000;
        break;
      case "hours":
        _0x5c67b7 = _0x29fdab * 3600000;
        break;
      case "days":
        _0x5c67b7 = _0x29fdab * 86400000;
        break;
      default:
        return _0xb497b4(
          "*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds"
        );
    }

    _0xb497b4("*Closing group after " + _0x29fdab + " " + _0x670dfe + "*");
    setTimeout(() => {
      _0xe0220e.groupSettingUpdate(_0x1732c3.chat, "announcement");
      _0xb497b4("Group closed by admin. Only admins can send messages.");
    }, _0x5c67b7);
  }
}, {
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
    operate: async (context) => {
        const { m, mess, text, isAdmins, isGroupOwner, isCreator, isBotAdmins, Matrix } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);

        let bwstq = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await Matrix.groupParticipantsUpdate(m.chat, [bwstq], "demote");
        reply(mess.done);
    }
}, {
    command: ['editsettings', 'editinfo'],
    operate: async (context) => {
        const { m, mess, args, isAdmins, isGroupOwner, isCreator, isBotAdmins, Matrix, prefix, command } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);

        if (args[0] === "on") {
            await Matrix.groupSettingUpdate(m.chat, "unlocked").then(
                (res) => reply(`*Successful, members can edit group info*`)
            );
        } else if (args[0] === "off") {
            await Matrix.groupSettingUpdate(m.chat, "locked").then((res) =>
                reply(`*Successful, members cannot edit group info*`)
            );
        } else {
            reply(`Example ${prefix + command} on/off`);
        }
    }
}, {
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
        const { m, mess, text, prefix, Matrix, isBotAdmins } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isBotAdmins) return reply(mess.admin);
        if (!text)
            return reply(
                `*Enter the number you want to invite to this group*\n\nExample :\n${prefix + command} 254796180105`
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
    }
}, {
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
    const { m, mess, args, store, botNumber, Matrix, reply } = context;
    if (!m.isGroup) return reply(mess.group);
    
    let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat;
    let presences = store.presences[id];
    
    if (!presences) {
      return reply('*No online members detected in this group.*');
    }

    let online = [...Object.keys(presences), botNumber];
    let liston = 1;
    Matrix.sendText(m.chat, '*ONLINE MEMBERS IN THIS GROUP*\n\n' + online.map(v => `${liston++} . @` + v.replace(/@.+/, '')).join`\n`, m, { mentions: online });
  }
}, {
    command: ['mediatag'],
    operate: async (context) => {
        const { m, isAdmins, mess, participants, Matrix, isBotAdmins } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isBotAdmins) return reply(mess.admin);
        if (!isAdmins) return reply(mess.admin);
        if (!m.quoted) return reply(`Reply to any media with caption ${prefix + command}`);

        Matrix.sendMessage(m.chat, {
          forward: m.quoted.fakeObj,
          mentions: participants.map((a) => a.id),
        });
    }
}, {
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
        const { m, mess, args, isAdmins, isCreator, isBotAdmins, Matrix } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);

        const duration = args[0];
        const unit = args[1].toLowerCase();

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
                return reply("*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
        }

        reply(`*Opening group after ${duration} ${unit}*`);
        setTimeout(() => {
            Matrix.groupSettingUpdate(m.chat, "not_announcement");
            reply("Group opened by admin. Members can now send messages.");
        }, timer);
    }
}, {
    command: ['poll'],
    operate: async (context) => {
        const { m, mess, text, isCreator, prefix, Matrix, isGroup } = context;
        if (!isCreator) return reply(mess.owner);
        if (!m.isGroup) return reply(mess.group);
        let [poll, opt] = text.split("|");
        if (text.split("|") < 2)
            return await reply(
                `Enter a question and at least 2 options\nExample: ${prefix}poll Who is best player?|Messi,Ronaldo,None...`
            );
        let options = [];
        for (let i of opt.split(",")) {
            options.push(i);
        }
        
        await Matrix.sendMessage(m.chat, {
            poll: {
                name: poll,
                values: options,
            },
        });
    }
}, {
    command: ['promote'],
    operate: async (context) => {
        const { m, mess, text, isAdmins, isGroupOwner, isCreator, isBotAdmins, quoted, Matrix } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);
        
        let bwst = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await Matrix.groupParticipantsUpdate(
            m.chat,
            [bwst],
            "promote"
        );
        reply(mess.done);
    }
}, {
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
        const { m, mess, text, isAdmins, isGroupOwner, isCreator, isBotAdmins, Matrix } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);
        if (!text) return reply("*Please enter a text*");
        
        await Matrix.groupUpdateDescription(m.chat, text);
        reply(mess.done);
    }
}, {
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
        const { m, mess, text, isAdmins, isGroupOwner, isCreator, isBotAdmins, Matrix } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);
        if (!text) return reply("*Desired groupname?*");

        await Matrix.groupUpdateSubject(m.chat, text);
        reply(mess.done);
    }
}, {
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
}, {
    command: ['tagall'],
    operate: async (context) => {
        const { m, isAdmins, isGroupOwner, isCreator, mess, q, participants, Matrix, isBotAdmins } = context;
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);

        let me = m.sender;
        let teks = `*TAGGED BY:*  @${
          me.split("@")[0]
        }\n\n*MESSAGE:* ${q ? q : "No message"}\n\n`;
        for (let mem of participants) {
          teks += `@${mem.id.split("@")[0]}\n`;
        }
        Matrix.sendMessage(
          m.chat,
          {
            text: teks,
            mentions: participants.map((a) => a.id),
          },
          {
            quoted: m,
          }
        );
    }
}, {
  command: ['totalmembers'],
  operate: async ({ Matrix, m, reply, mess, participants, isGroupAdmins, isCreator, sleep, groupMetadata }) => {
    if (!m.isGroup) return reply(mess.group);
    if (!(isGroupAdmins || isCreator)) return reply(mess.admin);

    await Matrix.sendMessage(
      m.chat,
      {
        text: `*GROUP*: ${groupMetadata.subject}\n*MEMBERS*: ${participants.length}`,
      },
      { quoted: m, ephemeralExpiration: 86400 }
    );
  }
}, {
    command: ['userid', 'userjid'],
    operate: async (context) => {
        const { m, mess, isCreator, Matrix } = context;
        if (!isCreator) return reply(mess.owner);
        if (!m.isGroup) return reply(mess.group);

        const groupMetadata = m.isGroup
            ? await Matrix.groupMetadata(m.chat).catch((e) => {})
            : "";
        const participants = m.isGroup
            ? await groupMetadata.participants
            : "";
        let textt = `Here is jid address of all users of\n *${groupMetadata.subject}*\n\n`;
        for (let mem of participants) {
            textt += `□ ${mem.id}\n`;
        }
        reply(textt);
    }
},
 {
  command: ['vcf'],
  operate: async ({ Matrix, m, reply, mess, participants, isGroupAdmins, isCreator, groupMetadata }) => {
    if (!m.isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);

    let cmiggc = await Matrix.groupMetadata(m.chat);
    let vcard = "";
    let noPort = 0;
    for (let a of cmiggc.participants) {
      vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${noPort++}] +${a.id.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\nEND:VCARD\n`;
    }
    let nmfilect = "./contacts.vcf";
    reply(`\nPlease wait, saving ${cmiggc.participants.length} contacts`);

    fs.writeFileSync(nmfilect, vcard.trim());
    await sleep(2000);
    Matrix.sendMessage(
      m.chat,
      {
        document: fs.readFileSync(nmfilect),
        mimetype: "text/vcard",
        fileName: "Contact.vcf",
        caption: `Successful\n\nGroup: *${cmiggc.subject}*\nContacts: *${cmiggc.participants.length}*`,
      },
      { ephemeralExpiration: 86400, quoted: m }
    );
    fs.unlinkSync(nmfilect);
  }
},  
];