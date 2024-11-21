const axios = require('axios');


module.exports = {
  name: 'couple',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Get a random couple GIF',
  guide: 'Use /couple to see a couple-themed GIF',
  execute: async (bot, msg, args, db) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const apiUrl = 'https://api.elianabot.xyz/api/couple.php';

    try {
      const response = await axios.get(apiUrl);
      const { gif_url } = response.data;

      if (gif_url) {
        bot.sendAnimation(chatId, gif_url, { caption: "Here's a cute couple GIF!" });
      } else {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch the GIF. Please try again later.");
      }
    } catch (error) {
      console.error('Error in couple command:', error);
      bot.sendMessage(chatId, 'An error occurred while processing your request.');
    }
  }
};
