const axios = require('axios');

module.exports = {
  name: 'football',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Get a random football image',
  guide: 'Use /football to get a random football-related image',
  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const apiUrl = 'https://api.elianabot.xyz/api/football.php?api=60692715c1ddc848f83b0989534e9a03';

    try {
      const response = await axios.get(apiUrl);
      const { image_url } = response.data;

      if (image_url) {
        await bot.sendPhoto(chatId, image_url, { caption: "Here's a football image for you!" });
      } else {
        await bot.sendMessage(chatId, "Sorry, I couldn't fetch the image. Please try again later.");
      }
    } catch (error) {
      console.error('Error in football command:', error);
      await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
    }
  }
};
