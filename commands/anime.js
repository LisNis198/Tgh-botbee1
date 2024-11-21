const axios = require('axios');

module.exports = {
  name: 'anivid',
  adminOnly: false,
  ownerOnly: false,
  category: 'Anime',
  description: 'Fetch a random anime video.',
  guide: 'Use /anivid to get a random anime video.',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const apiUrl = `https://api.elianabot.xyz/anime/video/random.php?api=hridoy`;

    try {
      const response = await axios.get(apiUrl);

      // Check if the response has a valid URL for the video
      if (response.data.url) {
        await bot.sendVideo(chatId, response.data.url, { caption: "Here's your anime video!" });
      } else {
        await bot.sendMessage(chatId, "Oops! Could not fetch a video. Please try again.");
      }

    } catch (error) {
      if (error.response && error.response.data.error) {
        await bot.sendMessage(chatId, `Error: ${error.response.data.error}`);
      } else {
        console.error("Error in anivid command:", error);
        await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
      }
    }
  }
};
