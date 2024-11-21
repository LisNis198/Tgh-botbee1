const axios = require('axios');

module.exports = {
  name: 'ffinfo',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Get character information from Free Fire',
  guide: 'Use /ffinfo <name> to see character details from Free Fire',
  execute: async (bot, msg, args, db) => {
    const chatId = msg.chat.id;

    // Check if a name was provided
    if (!args.length) {
      return bot.sendMessage(chatId, 'Please provide a character name. Example: /ffinfo Alok');
    }

    const characterName = args.join(' ');
    const apiUrl = `https://api.elianabot.xyz/tools/ffinfo.php?name=${encodeURIComponent(characterName)}`;

    try {
      const response = await axios.get(apiUrl);
      const { name, photo_url, information } = response.data;

      if (photo_url && name && information) {
        // Send the image with the character's name as the caption
        await bot.sendPhoto(chatId, photo_url, { caption: name });

        // Send the character's information in a separate message
        bot.sendMessage(chatId, information);
      } else {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch the character details. Please try a different name.");
      }
    } catch (error) {
      console.error('Error in ffinfo command:', error);
      bot.sendMessage(chatId, 'An error occurred while processing your request.');
    }
  }
};
