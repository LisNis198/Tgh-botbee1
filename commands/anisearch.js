const axios = require('axios');

module.exports = {
  name: 'anisearch',
  adminOnly: false,
  ownerOnly: false,
  category: 'Anime',
  description: 'Search for anime by title.',
  guide: 'Use /anisearch <anime title> to get information about an anime.',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const query = args.join(" ");

    // Check if a search query was provided
    if (!query) {
      await bot.sendMessage(chatId, "Please provide the title of the anime you want to search for.");
      return;
    }

    const apiUrl = `https://api.elianabot.xyz/anime/search.php?api=hridoy&search=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(apiUrl);

      // Check if the response has the necessary data
      if (response.data.title && response.data.image_url && response.data.url) {
        // Send the image with the title as caption
        await bot.sendPhoto(chatId, response.data.image_url, { caption: response.data.title });

        // Create an inline keyboard with the anime's URL
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "View on MyAnimeList 🌐",
                url: response.data.url
              }
            ]
          ]
        };

        // Send the synopsis and score with the inline keyboard
        const message = `📖 *Synopsis:* ${response.data.synopsis}\n⭐ *Score:* ${response.data.score}`;
        await bot.sendMessage(chatId, message, { parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard.inline_keyboard } });
      } else {
        await bot.sendMessage(chatId, "Oops! Could not find the anime. Please try again with a different title.");
      }

    } catch (error) {
      if (error.response && error.response.data.error) {
        await bot.sendMessage(chatId, `Error: ${error.response.data.error}`);
      } else {
        console.error("Error in anisearch command:", error);
        await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
      }
    }
  }
};
