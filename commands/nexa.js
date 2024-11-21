const axios = require('axios');

module.exports = {
  name: 'lisa',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Chat with Lisa AI',
  guide: 'Use /lisa followed by your message to chat with Lisa AI',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      const randomMessages = [
        "Hey bby bolo",
        "Yes,iam Lisa !You bot😅",
        "bolo bby",
        // Add more random messages if needed
      ];

      const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      return bot.sendMessage(chatId, randomMessage);
    }

    const userMessage = args.join(' ');
    const apiUrl = `https://www.noobs-api.000.pe/dipto/baby?text=${encodeURIComponent(userMessage)}`;

    try {
      const response = await axios.get(apiUrl, { timeout: 5000 }); // Set a timeout of 5 seconds

      if (response.data.status === 'success') {
        await bot.sendMessage(chatId, response.data.answer);
      } else {
        await bot.sendMessage(chatId, "I'm sorry, I couldn't process your request. Please try again later.");
      }
    } catch (error) {
      console.error('Error in lisa command:', error);
      
      if (error.code === 'ETIMEDOUT') {
        await bot.sendMessage(chatId, "The request timed out. The server may be busy; please try again later.");
      } else {
        await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
      }
    }
  }
};
