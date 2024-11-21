const axios = require('axios');

module.exports = {
  name: 'pickupline',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Get a fun pickup line',
  guide: 'Use /pickupline to get a pickup line',
  execute: async (bot, msg, args, db) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const apiUrl = 'https://api.elianabot.xyz/api/pickup_lines.php?query=pickupline';

    try {
      const response = await axios.get(apiUrl);
      const { pickupLine } = response.data;

      if (pickupLine) {
        bot.sendMessage(chatId, pickupLine);
      } else {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch a pickup line. Please try again later.");
      }
    } catch (error) {
      console.error('Error in pickupline command:', error);
      bot.sendMessage(chatId, 'An error occurred while processing your request.');
    }
  }
};
