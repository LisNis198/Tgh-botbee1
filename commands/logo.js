const axios = require('axios');
const { ObjectId } = require('mongodb');

module.exports = {
  name: 'logo',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Generate an anime logo with custom text!',
  guide: 'Use /logo <id> <text> to generate a custom logo (ID should be between 1 and 15)',
  execute: async (bot, msg, args, db) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    // Ensure ID and text are provided
    if (args.length < 2) {
      return bot.sendMessage(chatId, 'Please provide a logo ID and text. Usage: /logo <id> <text>');
    }

    // Parse the ID and text
    const logoId = parseInt(args[0]);
    const text = args.slice(1).join(' ');

    // Validate logo ID range
    if (isNaN(logoId) || logoId < 1 || logoId > 15) {
      return bot.sendMessage(chatId, 'Invalid logo ID. Please use a value between 1 and 15.');
    }

    try {
      // Check user balance
      const user = await db.collection('users').findOne({ userId });
      if (!user || user.balance < 75) {
        return bot.sendMessage(chatId, 'Insufficient balance. You need at least 75 coins to generate a logo.');
      }

      // API URL with dynamic parameters
      const apiUrl = `https://api.elianabot.xyz/api/logo/anime/logo.php?logoid=${logoId}&text=${encodeURIComponent(text)}`;

      // Fetch the logo image from API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');

      // Send the generated logo image to the user
      await bot.sendPhoto(chatId, imageBuffer, {
        caption: `Here's your custom logo with ID ${logoId} and text "${text}"!`
      });

      // Deduct 75 coins from user's balance
      await db.collection('users').updateOne(
        { userId },
        { $inc: { balance: -75 } }
      );

      bot.sendMessage(chatId, '75 coins have been deducted from your account for generating the logo.');
    } catch (error) {
      console.error('Error in logo command:', error);
      bot.sendMessage(chatId, 'An error occurred while generating the logo. Please try again later.');
    }
  }
};
