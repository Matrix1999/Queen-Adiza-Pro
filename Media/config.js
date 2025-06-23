// Module
//By яαgємσ∂ѕ
const fs = require('fs')

//Bot Settings
global.connect = true // True For Pairing // False For Qr
global.publicX = true // True For Public // False For Self
global.owner = ['2348144723858'] //Own Number
global.developer = "Dev.Rage" //Dev Name
global.botname = "Finisher" //Bot Name
global.version = "0.0.0" //Version Bot

//Sticker Setiings
global.packname = "Sticker By" //Pack Name 
global.author = "Dev.Rage" // Author

//Social Media Settings
global.ytube = "https://youtube.com/@rage4721"
global.ttok = "https://tiktok.com/@"
global.igram = "https://instagram.com/@pk123_yy6"
global.chtele = "https://t.me/rageontele"
global.tgram = "https://t.me/realdevrage"

//Bug Name Settings
global.bak = {
Ios: " ⿻ᬃƒιηιѕнєя 이яαgємσ∂ѕ⃟⃟⿻ ",
Andro: "⩟⬦𪲁 ƒιηιѕнєя 이яαgємσ∂ѕ -", 
Crash: " ̶C̶r̶a̶s̶h̶U̶l̶t̶i̶m̶a̶̶t̶e ̶",
Freeze: "ƒιηιѕнєя 이яαgємσ∂ѕ",
Ui: "ℭ𝔯𝔴𝔰𝔥 𝔘𝔦 𝔖𝔶𝔰𝔱𝔢𝔪"
}

//System Bot Settings
global.prefa = ['','!','.',',','🐤','🗿'] // Prefix // Not Change

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})

//By яαgємσ∂ѕ