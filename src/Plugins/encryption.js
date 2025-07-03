const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const JsConfuser = require('js-confuser');
const crypto = require('crypto');
const { webcrack } = require('webcrack');
const OWNER_NUMBER = '233593734312@s.whatsapp.net';

const TEMP_DIR = path.join(__dirname, '..', '..', 'tmp');

const ALLOWED_FILE_TYPES = ['.js']; // Only JavaScript files for these operations
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max file size for input JS files

// --- Helper Functions ---

function escapeMarkdownV2(text) {
  if (!text) return '';
  return text
    .replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
    .replace(/([|])/g, '\\$1')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

function log(message, error = null) {
  console.log(message);
  if (error) console.error(error);
}

function createProgressBar(percentage) {
  const total = 10;
  const filled = Math.round((percentage / 100) * total);
  return '▰'.repeat(filled) + '▱'.repeat(total - filled);
}

async function updateProgress(MatrixInstance, m, percentage, status) {
  const bar = createProgressBar(percentage);
  const levelText = percentage === 100 ? '✅ Completed' : `⚙️ ${status}`;
  log(`[Obfuscation Progress] User: ${m.sender.split('@')[0]} - ${levelText} (${percentage}%) - ${status}`);

  if (percentage === 1) {
    await MatrixInstance.sendMessage(m.chat, { text: `\`\`\`Starting encryption for ${m.pushName || m.sender.split('@')[0]}...\`\`\`` }, { quoted: m });
  } else if (percentage === 50) {
    await MatrixInstance.sendMessage(m.chat, { text: `\`\`\`Encryption is halfway done (${status})...\`\`\`` });
  }
}





// --- Obfuscation Configs ---

function getArabObfuscationConfig() {
  const arabicChars = [
    "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
    "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
    "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"
  ];
  const generateArabicName = () => {
    const length = Math.floor(Math.random() * 4) + 3;
    let name = "";
    for (let i = 0; i < length; i++) {
      name += arabicChars[Math.floor(Math.random() * arabicChars.length)];
    }
    return name;
  };
  return {
    target: 'node',
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateArabicName,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.95,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}

// encjapxrab
function getJapanxArabObfuscationConfig() {
  const chars = [
    "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り",
    "る", "れ", "ろ", "わ", "を", "ん",
    "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
    "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
    "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"
  ];
  const generateName = () => {
    const length = Math.floor(Math.random() * 4) + 3;
    let name = "";
    for (let i = 0; i < length; i++) {
      name += chars[Math.floor(Math.random() * chars.length)];
    }
    return name;
  };
  return {
    target: 'node',
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateName,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.95,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}




//encJapan

function getJapanObfuscationConfig() {
  const japaneseChars = [
    "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も", "や", "ゆ", "よ",
    "ら", "り", "る", "れ", "ろ", "わ", "を", "ん"
  ];
  const generateJapaneseName = () => {
    const length = Math.floor(Math.random() * 4) + 3;
    let name = "";
    for (let i = 0; i < length; i++) {
      name += japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
    }
    return name;
  };
  return {
    target: 'node',
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateJapaneseName,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.9,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}

// enchector

function getNebulaObfuscationConfig() {
  const generateNebulaName = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const prefix = "NX";
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${prefix}${randomPart}`;
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateNebulaName,
    stringCompression: true,
    stringConcealing: false,
    stringEncoding: true,
    stringSplitting: false,
    controlFlowFlattening: 0.75,
    flatten: true,
    shuffle: true,
    rgf: true,
    deadCode: true,
    opaquePredicates: true,
    dispatcher: true,
    globalConcealing: true,
    objectExtraction: true,
    duplicateLiteralsRemoval: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}

// encmatrix

function getStrongObfuscationConfig() {
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "randomized",
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.75,
    duplicateLiteralsRemoval: true,
    calculator: true,
    dispatcher: true,
    deadCode: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}

// encultra
function getUltraObfuscationConfig() {
  const generateUltraName = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    return `z${randomNum}${randomChar}${Math.random().toString(36).substring(2, 6)}`;
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateUltraName,
    stringCompression: true,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.9,
    flatten: true,
    shuffle: true,
    rgf: true,
    deadCode: true,
    opaquePredicates: true,
    dispatcher: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}
// Quantum Vortex Encryption Config
const obfuscateQuantum = async (fileContent) => {
  // Generate identifier unik berdasarkan waktu lokal
  const generateTimeBasedIdentifier = () => {
    const timeStamp = new Date().getTime().toString().slice(-5);
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$#@&*";
    let identifier = "qV_";
    for (let i = 0; i < 7; i++) {
      identifier += chars[Math.floor((parseInt(timeStamp[i % 5]) + i * 2) % chars.length)];
    }
    return identifier;
  };

  // Tambahkan kode phantom berdasarkan milidetik
  const currentMilliseconds = new Date().getMilliseconds();
  const phantomCode = currentMilliseconds % 3 === 0 ? `if(Math.random()>0.999)console.log('PhantomTrigger');` : "";

  try {
    const obfuscated = await JsConfuser.obfuscate(fileContent + phantomCode, {
      target: "node",
      compact: true,
      renameVariables: true,
      renameGlobals: true,
      identifierGenerator: generateTimeBasedIdentifier,
      stringCompression: true,
      stringConcealing: false,
      stringEncoding: true,
      controlFlowFlattening: 0.85,
      flatten: true,
      shuffle: true,
      rgf: true,
      opaquePredicates: {
        count: 8,
        complexity: 5
      },
      dispatcher: true,
      globalConcealing: true,
      lock: {
        selfDefending: true,
        antiDebug: (code) => `if(typeof debugger!=='undefined'||(typeof process!=='undefined'&&process.env.NODE_ENV==='debug'))throw new Error('Debugging disabled');${code}`,
        integrity: true,
        tamperProtection: (code) => `if(!((function(){return eval('1+1')===2;})()))throw new Error('Tamper detected');${code}`
      },
      duplicateLiteralsRemoval: true
    });
    let obfuscatedCode = obfuscated.code || obfuscated;
    if (typeof obfuscatedCode !== "string") {
      throw new Error("Hasil obfuscation bukan string");
    }
    // Self-evolving code dengan XOR dinamis
    const key = currentMilliseconds % 256;
    obfuscatedCode = `(function(){let k=${key};return function(c){return c.split('').map((x,i)=>String.fromCharCode(x.charCodeAt(0)^(k+(i%16)))).join('');}('${obfuscatedCode}');})()`;
    return obfuscatedCode;
  } catch (error) {
    throw new Error(`Failed obfuscate: ${error.message}`);
  }
 };
 
 // encnova
 // Konfigurasi obfuscation untuk Nova style
const getNovaObfuscationConfig = () => {
    const generateNovaName = () => {
        // Identifier generator unik dan keren
        const prefixes = ["nZ", "nova", "nx"];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const hash = crypto.createHash('sha256')
            .update(crypto.randomBytes(8))
            .digest('hex')
            .slice(0, 6); // Ambil 6 karakter pertama dari hash SHA-256
        const suffix = Math.random().toString(36).slice(2, 5); // Sufiks acak 3 karakter
        return `${randomPrefix}_${hash}_${suffix}`;
    };

    return {
        target: "node",
        compact: true,
        renameVariables: true,
        renameGlobals: true,
        identifierGenerator: generateNovaName, 
        stringCompression: true,
        stringConcealing: true,
        stringEncoding: true,
        stringSplitting: false,
        controlFlowFlattening: 0.5, 
        flatten: true,
        shuffle: true,
        rgf: false,
        deadCode: false, 
        opaquePredicates: true,
        dispatcher: true,
        globalConcealing: true,
        objectExtraction: true,
        duplicateLiteralsRemoval: true,
        lock: {
            selfDefending: true,
            antiDebug: true,
            integrity: true,
            tamperProtection: true
        }
    };
};

 
// encinvisble
function getXObfuscationConfig() {
  const generateXName = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return "xZ" + crypto.randomUUID().slice(0, 4); // Nama pendek dan unik
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateXName,
    stringCompression: true,
    stringConcealing: true,
    stringEncoding: true,
    stringSplitting: false,
    controlFlowFlattening: 0.5,
    flatten: true,
    shuffle: true,
    rgf: true,
    deadCode: false,
    opaquePredicates: true,
    dispatcher: true,
    globalConcealing: true,
    objectExtraction: true,
    duplicateLiteralsRemoval: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}


function getSiuCalcrickObfuscationConfig() {
  const generateSiuCalcrickName = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";
    for (let i = 0; i < 6; i++) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }
    return `CalceKarik和SiuSiu无与伦比的帅气${randomPart}`;
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateSiuCalcrickName,
    stringCompression: true,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.95,
    shuffle: true,
    rgf: false,
    flatten: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}


function getStealthObfuscationConfig() {
  const stealthChars = [
    "S", "t", "e", "a", "l", "h", "𝑺","𝑡","𝑒","𝑎","𝑙","𝑡","𝓢","𝓽","𝓮","𝓪","𝓵","𝓽"
    // ... add more if you want
  ];
  // Always start with a letter or allowed Unicode letter
  const generateStealthName = () => {
    let name = "";
    // First character: must be a letter (not a digit)
    name += stealthChars[Math.floor(Math.random() * stealthChars.length)];
    // Next 5 characters: can be anything from stealthChars
    for (let i = 0; i < 5; i++) {
      name += stealthChars[Math.floor(Math.random() * stealthChars.length)];
    }
    return name;
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateStealthName,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.85,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}

function getDraculaObfuscationConfig(draculaName) {
  // Use the dracula name as part of the variable name pattern
  const generateDraculaName = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 6; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${draculaName}_${suffix}`;
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateDraculaName,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.85,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}

// encchina
function getMandarinObfuscationConfig() {
  const mandarinChars = [
    "龙", "虎", "风", "云", "山", "河", "天", "地", "雷", "电",
    "火", "水", "木", "金", "土", "星", "月", "日", "光", "影",
    "峰", "泉", "林", "海", "雪", "霜", "雾", "冰", "焰", "石"
  ];
  const generateMandarinName = () => {
    const length = Math.floor(Math.random() * 4) + 3;
    let name = "";
    for (let i = 0; i < length; i++) {
      name += mandarinChars[Math.floor(Math.random() * mandarinChars.length)];
    }
    return name;
  };
  return {
    target: 'node',
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateMandarinName,
    stringEncoding: true,
    stringSplitting: true,
    controlFlowFlattening: 0.95,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}
//encvampire
function getNewObfuscationConfig() {
  // Generates advanced, hard-to-predict variable names
  const advancedChars = "ZXCVBNMASDFGHJKLQWERTYUIOP1234567890_";
  const generateAdvancedName = () => {
    let name = "";
    for (let i = 0; i < 8; i++) {
      name += advancedChars[Math.floor(Math.random() * advancedChars.length)];
    }
    return "A_" + name;
  };
  return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateAdvancedName,
    stringEncoding: true,
    stringSplitting: true,
    stringCompression: true,
    controlFlowFlattening: 0.98,
    flatten: true,
    shuffle: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    dispatcher: true,
    lock: {
      selfDefending: true,
      antiDebug: true,
      integrity: true,
      tamperProtection: true
    }
  };
}

// Add other obfuscation configs here (getUltraObfuscationConfig, getArabObfuscationConfig, etc.)

// --- Commands ---

module.exports = [
  {
  command: ['encmatrix'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    // Use the original filename directly for the output file
    const originalFileName = file.fileName || `matrix_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encmatrix';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encmatrix.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    // Use originalFileName for the temp file path for clarity, though it doesn't affect output name
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_strong-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Strong config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Strong Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getStrongObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and desired caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName, // Use the original filename
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Strong) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Strong Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, {
  command: ['encultra'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `ultra_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encultra';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encultra.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_ultra-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Hardened Ultra config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Ultra Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getUltraObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Ultra) ready!*\nSUCCESSFULLY ENCRYPTED BY ULTRA 💎"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Ultra Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, {
  command: ['encarab'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `arab_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encarab';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encarab.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_arab-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Hardened Arab config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Arab Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getArabObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Arab) ready!*\nSUCCESSFULLY ENCRYPTED BY ENCARAB🧙‍♂️"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Arab Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, {
  command: ['encjapxab'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `japxarab_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encjapxab';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encjapxab.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_japanxarab-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Hardened Japan X Arab config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Japan X Arab Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getJapanxArabObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Japan X Arab) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Japan X Arab Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, 
{
  command: ['decrypt'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply("❌ Error: Reply to an encrypted .js file with this command!");
    }

    const file = m.quoted;
    let fileName = file.fileName || `decrypted_file_${Date.now()}`;
    if (!fileName.toLowerCase().endsWith('.js')) {
      fileName += '.js';
    }
    const fileExt = path.extname(fileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(`❌ Error: Only .js files are supported! Current: ${fileExt}`);
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    const userId = m.sender;
    const serviceName = 'decrypt';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      console.log('[DEBUG] Owner detected, bypassing premium check for decrypt.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 Premium Required!\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_encrypted${fileExt}`);
    const decryptedPath = path.join(TEMP_DIR, `${uuidv4()}_decrypted${fileExt}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      console.log(`Downloading file for decryption: ${fileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const encryptedContent = await fs.readFile(tempFilePath, 'utf8');

      console.log(`Decrypting file: ${fileName}`);
      await updateProgress(MatrixInstance, m, 30, "Decrypting Code");

      const result = await webcrack(encryptedContent);
      let decryptedCode = result.code;

      if (result.bundle) {
        decryptedCode = "// Detected as bundled code (e.g., Webpack/Browserify)\n" + decryptedCode;
        console.log(`Code detected as bundle: ${fileName}`);
      }

      if (!decryptedCode || typeof decryptedCode !== "string" || decryptedCode.trim() === encryptedContent.trim()) {
        console.log(`Webcrack cannot decode completely or result invalid: ${fileName}`);
        decryptedCode = `// Webcrack cannot decode completely or invalid results\n${encryptedContent}`;
      }

      // Validate decrypted code
      console.log(`Validating deobfuscated code: ${fileName}`);
      await updateProgress(MatrixInstance, m, 60, "Validating Code");
      try {
        new Function(decryptedCode);
        console.log(`Deobfuscated code is valid.`);
      } catch (syntaxError) {
        console.log(`Deobfuscated code validation failed: ${syntaxError.message}`);
        decryptedCode = `// Validation error: ${syntaxError.message}\n${decryptedCode}`;
      }

      await fs.writeFile(decryptedPath, decryptedCode);

      await updateProgress(MatrixInstance, m, 80, "Saving Result");

      // Read decrypted file buffer
      const decryptedBuffer = await fs.readFile(decryptedPath);

      // Compose decrypted filename with prefix
      const decryptedFileName = `decrypted-${fileName}`;

      console.log(`Sending decrypted file: ${decryptedFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: decryptedBuffer,
          fileName: decryptedFileName,
          mimetype: 'application/javascript',
          caption: "✅ Decrypted file successfully ready!\nSUCCESSFULLY DECRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Decryption Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      console.error("Error during decryption:", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(`❌ Error: ${errorMsg}\nTry again with a valid encrypted JavaScript file!`);
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => console.log(`Failed to delete temp encrypted file: ${e.message}`));
      }
      if (await fs.pathExists(decryptedPath)) {
        await fs.unlink(decryptedPath).catch(e => console.log(`Failed to delete temp decrypted file: ${e.message}`));
      }
    }
  }
}, 
 {
  command: ['enchector'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `hector_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'enchector';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for enchector.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_hector-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Hector config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Hector Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getStrongObfuscationConfig()); // Adjust config if needed
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Hector) ready!*\nSUCCESSFULLY ENCRYPTED BY HECTOR☠️"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Hector Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, 
{
  command: ['encinvisible'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `invisible_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encinvisible';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encinvisible.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_invisible-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Invisible config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Invisible Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getXObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Invisible) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Invisible Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, {
  command: ['encstealth'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `stealth_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encstealth';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encstealth.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_stealth-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Stealth config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Stealth Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getStealthObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Stealth) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🦧"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Stealth Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, 
 {
  command: ['dracula'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `dracula_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'dracula';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for dracula.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_dracula-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Dracula config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Dracula Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getDraculaObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Dracula) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 👑"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Dracula Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, 
 {
  command: ['encchina'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `mandarin_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encmandarin';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encmandarin.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_mandarin-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Mandarin config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Mandarin Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getMandarinObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Mandarin) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Mandarin Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, 
 {
  command: ['immortal'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `siucalcrick_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'immortal';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for immortal.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_siucalcrick-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using SiuCalcrick config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened SiuCalcrick Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getSiuCalcrickObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened SiuCalcrick) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened SiuCalcrick Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, {
  command: ['encquantum'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `quantum_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encquantum';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encquantum.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_quantum-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Quantum config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Quantum Obfuscation");

      // Use your obfuscateQuantum function here
      const obfuscatedCode = await obfuscateQuantum(originalContent);

      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Quantum) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Quantum Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, {
  command: ['encnova'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `nova_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encnova';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encnova.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_nova-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Nova config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Nova Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getNovaObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Nova) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Nova Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}, 
 {
  command: ['encvampire'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `vampire_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ *Error:* Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encvampire';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encvampire.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_vampire-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Vampire config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Vampire Obfuscation");
      // Use your existing config function here:
      const obfuscated = await JsConfuser.obfuscate(originalContent, getNewObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
      const encryptedBuffer = await fs.readFile(encryptedPath);

      // Send as document with original filename and caption
      log(`Sending encrypted file: ${originalFileName}`);
      await MatrixInstance.sendMessage(
        m.chat,
        {
          document: encryptedBuffer,
          fileName: originalFileName,
          mimetype: 'application/javascript',
          caption: "✅ *Encrypted file (Hardened Vampire) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
        },
        { quoted: m }
      );

      await updateProgress(MatrixInstance, m, 100, "Hardened Vampire Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
},  
{
  command: ['encjapan'],
  operate: async ({ Matrix: MatrixInstance, m, reply }) => {
    console.log('m.quoted:', m.quoted);

    if (!m.quoted) {
      return reply(escapeMarkdownV2("❌ Error: Reply to a .js file with this command!"));
    }

    const file = m.quoted;
    const originalFileName = file.fileName || `japan_file_${Date.now()}.js`;
    const fileExt = path.extname(originalFileName).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      return reply(escapeMarkdownV2(`❌ Error: Only .js files are supported! Current: ${fileExt}`));
    }

    const fileSize = file.fileLength?.low || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return reply(escapeMarkdownV2(`❌ Error: File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    const userId = m.sender;
    const serviceName = 'encjapan';

    premiumManager.registerService(serviceName);
    if (userId === OWNER_NUMBER) {
      log('[DEBUG] Owner detected, bypassing premium check for encjapan.');
    } else if (!await premiumManager.isPremium(userId, serviceName)) {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
      return reply(
        `🚫 *Premium Required!*\n\n` +
        `This feature is for premium users only.\n` +
        `To use *${serviceName.toUpperCase()}*, you need an active premium subscription or All-Access Premium.\n\n` +
        `Type *.buy_premium* to learn more.`
      );
    }

    await fs.ensureDir(TEMP_DIR);
    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original_${originalFileName}`);
    const encryptedPath = path.join(TEMP_DIR, `${uuidv4()}_japan-encrypted_${originalFileName}`);

    try {
      await MatrixInstance.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      log(`Downloading file for obfuscation: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 10, "Downloading");
      const buffer = await MatrixInstance.downloadMediaMessage(m.quoted);
      await fs.writeFile(tempFilePath, buffer);

      await updateProgress(MatrixInstance, m, 20, "Download Completed");

      const originalContent = await fs.readFile(tempFilePath, 'utf8');

      log(`Validating initial code: ${originalFileName}`);
      await updateProgress(MatrixInstance, m, 30, "Validating Code");
      try {
        new Function(originalContent);
      } catch (syntaxError) {
        throw new Error(`Invalid code: ${syntaxError.message}`);
      }

      log(`Encrypting file using Japan config`);
      await updateProgress(MatrixInstance, m, 40, "Initialization Hardened Japan Obfuscation");
      const obfuscated = await JsConfuser.obfuscate(originalContent, getJapanObfuscationConfig());
      const obfuscatedCode = obfuscated.code || obfuscated;
      if (typeof obfuscatedCode !== "string") {
        throw new Error("Obfuscation result is not a string");
      }

      await updateProgress(MatrixInstance, m, 60, "Code Transformation");
      await fs.writeFile(encryptedPath, obfuscatedCode);

      await updateProgress(MatrixInstance, m, 80, "Finalizing Encryption");
      log(`Validating obfuscation result: ${originalFileName}`);
      try {
        new Function(obfuscatedCode);
      } catch (postObfuscationError) {
        throw new Error(`Obfuscation result is not valid: ${postObfuscationError.message}`);
      }

      // Read encrypted file buffer
const encryptedBuffer = await fs.readFile(encryptedPath);

// Send as document with original filename and caption
log(`Sending encrypted file: ${originalFileName}`);
await MatrixInstance.sendMessage(
  m.chat,
  {
    document: encryptedBuffer,
    fileName: originalFileName,
    mimetype: 'application/javascript',
    caption: "✅ *Encrypted file (Hardened Japan) ready!*\nSUCCESSFULLY ENCRYPTED BY Matrix 🕊"
  },
  { quoted: m }
);


      await updateProgress(MatrixInstance, m, 100, "Hardened Japan Obfuscation Completed");
      await MatrixInstance.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      log("Error during obfuscation", error);
      await MatrixInstance.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      let errorMsg = error && error.message ? error.message : String(error);
      if (typeof errorMsg !== 'string') errorMsg = JSON.stringify(errorMsg, null, 2);
      await reply(escapeMarkdownV2(`❌ Error: ${errorMsg}\n_Try again with valid JavaScript code!_`));
    } finally {
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(e => log(`Failed to delete temp original file ${tempFilePath}: ${e.message}`));
      }
      if (await fs.pathExists(encryptedPath)) {
        await fs.unlink(encryptedPath).catch(e => log(`Failed to delete temp encrypted file ${encryptedPath}: ${e.message}`));
      }
    }
  }
}


 // Add other command objects here with similar structure

];
