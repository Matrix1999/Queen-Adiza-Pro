//-------------------[ BOT SETTINGS ]------------------//

// @project_name : MATRIX-X-KING
// @author : MATRIX
// @telegram : http://t.me/MatriXXXXXXXXX
// @github : Matrix1999
// @whatsapp : +233593734312

//----------------------[ MATRIX-KING ]----------------------//

const fs = require('fs')
const { color } = require('./lib/color')
if (fs.existsSync('.env')) require('dotenv').config({ path: __dirname+'/.env' })


//--------------------[ SESSION ID ]----------------------//

global.SESSION_ID = process.env.SESSION_ID || ''
//Enter your Adiza session id here; must start with QUEEN~ADIZA~

//--------------------[ BOT NAME (WhatsApp) ]----------------------//

global.botname = process.env.BOT_NAME || 'Queen-Adiza'

//--------------------[ TELEGRAM BOT SETTINGS ]----------------------//
global.BOT_TOKEN = process.env.BOT_TOKEN || "7992929848:AAGrK35akkgJclY7f9cF4cAXoYlo-honGV0" // Telegram bot token

global.BOT_NAME = process.env.TELEGRAM_BOT_NAME || "RashidaPair_bot" // Telegram bot name

global.OWNER_NAME = process.env.TELEGRAM_OWNER_NAME || "@Matrixxxxxxxxx" // Telegram owner name with sign @

global.OWNER = JSON.parse(process.env.TELEGRAM_OWNER_IDS || '["https://t.me/Matrixxxxxxxxx"]') // Telegram owner username list

global.DEVELOPER = JSON.parse(process.env.TELEGRAM_DEVELOPER_IDS || '["853645999"]') // Telegram developer telegram id

global.pp = process.env.BOT_PP_URL || 'https://files.catbox.moe/pa6ok8.jpg' // Telegram bot profile picture

//-----------------[ OWNER NUMBER (WhatsApp) ]------------------//

//-----------------[ OWNER NUMBER (WhatsApp) ]------------------//
global.ownernumber = process.env.OWNER_NUMBER || '233544981163' 

global.owner = JSON.parse(process.env.WHATSAPP_OWNER_NUMBERS || '["233544981163@s.whatsapp.net"]')

//-----------------[ OWNER NAME (WhatsApp) ]------------------//

global.ownername = process.env.OWNER_NAME || 'Matrix-X-King' // This will be used for WhatsApp owner name, but Telegram OWNER_NAME is separate.

//------------[ STICKER PACKNAME ]-----------------//

global.packname = process.env.STICKER_PACK_NAME || "Queen-Adiza"

//--------------[ STICKER AUTHOR NAME ]------------//

global.author = process.env.STICKER_AUTHOR_NAME || "Adizatu"

//----------------[ GITHUB DATABASE ]-----------------//

global.dbToken = process.env.GITHUB_TOKEN || "";

global.GITHUB_PAIRING_TOKEN = process.env.GITHUB_PAIRING_TOKEN || ""; 


//-----------------[ CONTEXT LINK ]--------------------//

global.plink = process.env.PLINK || "https://www.instagram.com/heyits_matrix?igsh=YzljYTk1ODg3Zg---"

//-----------------[ GLOBAL TIME ]--------------------//

global.timezones = "Africa/Accra";

//------------------[ WATERMARK ]--------------------//

global.wm = process.env.GL_WM || "庐饾樇饾櫃饾櫈饾櫙饾櫀饾櫓饾櫔馃尮"

//---------------------[ REPLIES ]-----------------------//

global.mess = {
  done: '*Done*',
  success: '?Matrix',
  owner: `*You don't have permission to use this command!*`,
  group: '*This feature becomes available when you use it in a group!*',
  admin: '*You’ll unlock this feature with me as an admin!*',
  notadmin: '*This feature will work once you become an admin. A way of ensuring order!*',
  premium: '? This command is reserved for premium users. Please contact the owner to inquire about premium access.'
}


//--------------------[ LANGUAGE (Telegram) ]-----------------------//
const { english } = require("./lib"); // Assuming lib/index.js exports english
global.language = english
global.lang = language

//--------------------[ WATCHER ]-----------------------//

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(color(`Updated '${__filename}'`, 'red'))
  delete require.cache[file]
  require(file)
})

//----------------------[ MATRIX-X ]----------------------//
