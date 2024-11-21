const axios = require('axios');

module.exports = {
  name: 'pfp',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Get a random anime profile picture',
  guide: 'Use /pfp to get a new anime profile picture',
  execute: async (bot, msg, args, db) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const apiUrl = 'https://api.elianabot.xyz/api/animepfp.php?api=d3ee2bd5411a44308577ed90abe0fa30';

    try {
      // Fetching the anime profile picture from the API
      const response = await axios.get(apiUrl);
      const { image_url } = response.data;

      if (image_url) {
        bot.sendPhoto(chatId, image_url, { caption: "Here's your anime profile picture!" });
      } else {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch the profile picture. Please try again later.");
      }
    } catch (error) {
      console.error('Error in pfp command:', error);
      bot.sendMessage(chatId, 'An error occurred while processing your request.');
    }
  }
};
