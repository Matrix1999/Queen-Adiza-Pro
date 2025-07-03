
const mongoose = require('mongoose');

// --- Settings Schema ---
const settingsSchema = new mongoose.Schema({
  autobio: { type: Boolean, default: false },
  anticall: { type: Boolean, default: false },
  autotype: { type: Boolean, default: false },
  autoread: { type: Boolean, default: false },
  welcome: { type: Boolean, default: false },
  antiedit: { type: String, default: "private" },
  menustyle: { type: String, default: "2" },
  statusemoji: { type: String, default: "🧡" },
  autoreact: { type: Boolean, default: false },
  autorecord: { type: Boolean, default: false },
  antidelete: { type: String, default: "private" },
  alwaysonline: { type: Boolean, default: false },
  autoviewstatus: { type: Boolean, default: false },
  autoreactstatus: { type: Boolean, default: false },
  autorecordtype: { type: Boolean, default: false },
  sudo: { type: [String], default: [] }, // Array of JIDs
  mode: { type: String, default: "public" }, // Add default mode
}, { _id: false }); // Do not create a default _id for this subdocument

// --- Chat Schema ---
const chatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true }, // WhatsApp Group JID or User JID
  antibot: { type: Boolean, default: false },
  welcome: { type: Boolean, default: false },
  anticontact: { type: Boolean, default: false },
  antiaudio: { type: Boolean, default: false },
  antisticker: { type: Boolean, default: false },
  antimedia: { type: Boolean, default: false },
  antivirtex: { type: Boolean, default: false },
  antivirus: { type: Boolean, default: false },
  antivideo: { type: Boolean, default: false },
  antispam: { type: Boolean, default: false },
  antispam1: { type: Boolean, default: false }, // Assuming antispam1 is distinct
  antiimage: { type: Boolean, default: false },
  badword: { type: Boolean, default: false },
  antilinkgc: { type: Boolean, default: false },
  antilinkkick: { type: Boolean, default: false },
  badwordkick: { type: Boolean, default: false },
  antilinkgckick: { type: Boolean, default: false },
});

// --- User Schema ---
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // WhatsApp User JID
  premium: { type: Boolean, default: false },
  // You might add more user-specific settings here later
});

// --- Blacklist Schema ---
const blacklistSchema = new mongoose.Schema({
  blacklisted_numbers: { type: [String], default: [] },
}, { _id: false }); // Only one blacklist document, no need for _id

// --- Main Database Schema ---
const databaseSchema = new mongoose.Schema({
  _id: { type: String, default: 'global_settings' }, // Ensure only one document for global settings
  settings: { type: settingsSchema, default: () => ({}) }, // Use a function for default empty object
  chats: { type: Map, of: chatSchema, default: {} }, // Use Map for dynamic keys
  users: { type: Map, of: userSchema, default: {} }, // Use Map for dynamic keys
  blacklist: { type: blacklistSchema, default: () => ({}) },
  premium: { type: [String], default: [] }, // Assuming this is an array of user JIDs for premium
});

// Models
const Settings = mongoose.model('Settings', settingsSchema);
const Chat = mongoose.model('Chat', chatSchema);
const User = mongoose.model('User', userSchema);
const Blacklist = mongoose.model('Blacklist', blacklistSchema);
const Database = mongoose.model('Database', databaseSchema); // The main document for global settings

module.exports = {
  Settings,
  Chat,
  User,
  Blacklist,
  Database,
  mongoose // Export mongoose itself for connection handling
};
