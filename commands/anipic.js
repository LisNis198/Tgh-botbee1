const axios = require('axios');

module.exports = {
  name: 'anipic',
  adminOnly: false,
  ownerOnly: false,
  category: 'Anime',
  description: 'Get a random high-quality anime girl image.',
  guide: 'Use /anipic to get a random anime girl image.',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    try {
      const response = await axios.get('https://api.elianabot.xyz/media/premium/index.php');
      const imageUrl = response.data.image_url;

      await bot.sendPhoto(chatId, imageUrl, {
        caption: 'Here is a random anime girl image for you! 🌸'
      });
    } catch (error) {
      console.error('Error in anipic command:', error);
      await bot.sendMessage(chatId, 'Something went wrong 😔 Please try again.');
    }
  }
};
