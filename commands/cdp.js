const axios = require('axios');
const { ObjectId } = require('mongodb');

module.exports = {
  name: 'cdp',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Get images for a couple comparison!',
  guide: 'Use /cdp to see a couple comparison image',
  execute: async (bot, msg, args, db) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const apiUrl = 'https://api.elianabot.xyz/api/cdp.php';

    try {
      const response = await axios.get(apiUrl);
      const { imageboy, imagegirl, result } = response.data;

      if (imageboy && imagegirl) {
        await bot.sendMediaGroup(chatId, [
          { type: 'photo', media: imageboy, caption: "Here's the image for the boy!" },
          { type: 'photo', media: imagegirl, caption: "Here's the image for the girl!" }
        ]);

        await bot.sendMessage(chatId, `Result: ${result}`);
      } else {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch the images. Please try again later.");
      }
    } catch (error) {
      console.error('Error in cdp command:', error);
      bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
    }
  }
};
