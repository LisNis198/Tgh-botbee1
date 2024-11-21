const axios = require('axios');

module.exports = {
  name: 'nexa',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Chat with Nexa AI',
  guide: 'Use /nexa followed by your message to chat with Nexa AI',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      const randomMessages = [
        "Hey there! What's on your mind?",
        "I'm all ears! What would you like to chat about?",
        "Got any interesting topics you'd like to discuss?",
        // Add more random messages if needed
      ];

      const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      return bot.sendMessage(chatId, randomMessage);
    }

    const userMessage = args.join(' ');
    const apiUrl = `https://api.nexalo.xyz/chat/v1/index.php?api=na_Z21SSP93HR0123QO&question=${encodeURIComponent(userMessage)}`;

    try {
      const response = await axios.get(apiUrl, { timeout: 5000 }); // Set a timeout of 5 seconds

      if (response.data.status === 'success') {
        await bot.sendMessage(chatId, response.data.answer);
      } else {
        await bot.sendMessage(chatId, "I'm sorry, I couldn't process your request. Please try again later.");
      }
    } catch (error) {
      console.error('Error in nexa command:', error);
      
      if (error.code === 'ETIMEDOUT') {
        await bot.sendMessage(chatId, "The request timed out. The server may be busy; please try again later.");
      } else {
        await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
      }
    }
  }
};
