// English.js (Updated description)

function escapeMarkdownV2(text) {
    return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

exports.noToken = "The bot token cannot be empty, please create a bot via https://t.me/BotFather";

exports.first_chat = (botname, pushname) => {
    return escapeMarkdownV2(`Hi👋 ${pushname}, I am Queen Adiza Bot, your assistant for WhatsApp session management and automation. I can help authorized users , manage WhatsApp connections and more⚡.
Click /menu to learn more about how to use this bot and its features.`);
};
