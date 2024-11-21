const axios = require('axios');

module.exports = {
  name: 'waifu',
  adminOnly: false,
  ownerOnly: false,
  category: 'Anime',
  description: 'Fetch a random anime picture from a specified category.',
  guide: 'Use /waifu <category> to get an anime picture. Categories include waifu, neko, hug, etc.',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const availableCategories = [
      "waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", 
      "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", 
      "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"
    ];

    // Check if a category was provided
    const category = args[0];
    
    // If no category is provided, prompt the user to select one
    if (!category) {
      await bot.sendMessage(chatId, `Please select a category for your anime picture.\nAvailable categories:\n${availableCategories.join(', ')}`);
      return;
    }

    // Verify that the selected category is valid
    if (!availableCategories.includes(category)) {
      await bot.sendMessage(chatId, `Invalid category. Please choose a valid category:\n${availableCategories.join(', ')}`);
      return;
    }

    const apiUrl = `https://api.nexalo.xyz/anime-pics?category=${category}&api=na_Z21SSP93HR0123QO`;

    try {
      const response = await axios.get(apiUrl);
      
      // Check if the response has a valid URL for the image
      if (response.data.url) {
        await bot.sendMessage(chatId, "Here's your anime picture!");
        await bot.sendPhoto(chatId, response.data.url);
      } else {
        await bot.sendMessage(chatId, "Oops! Could not fetch an image. Please try again.");
      }
      
    } catch (error) {
      if (error.response && error.response.data.error) {
        await bot.sendMessage(chatId, `Error: ${error.response.data.error}`);
      } else {
        console.error("Error in waifu command:", error);
        await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
      }
    }
  }
};
