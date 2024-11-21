const axios = require('axios');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('economyBot');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };

// /glogo command
module.exports = {
  name: 'glogo',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Generate a game logo with custom text (100 coins required)',
  guide: 'Use /glogo <id> <text> to generate a custom game logo (ID should be between 1 and 5)',
  execute: async (bot, msg, args, db) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    // Ensure ID and text are provided
    if (args.length < 2) {
      return bot.sendMessage(chatId, 'Please provide a logo ID and text. Usage: /glogo <id> <text>');
    }

    // Parse the ID and text
    const logoId = parseInt(args[0]);
    const text = args.slice(1).join(' ');

    // Validate logo ID range
    if (isNaN(logoId) || logoId < 1 || logoId > 5) {
      return bot.sendMessage(chatId, 'Invalid logo ID. Please use a value between 1 and 5.');
    }

    try {
      // Check user balance
      const user = await db.collection('users').findOne({ userId });
      if (!user || user.balance < 100) {
        return bot.sendMessage(chatId, 'Insufficient balance. You need at least 100 coins to generate a logo.');
      }

      // API URL with dynamic parameters
      const apiUrl = `https://api.elianabot.xyz/api/logo/game/logo.php?logoid=${logoId}&text=${encodeURIComponent(text)}`;

      // Fetch the logo image from API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');

      // Send the generated logo image to the user
      await bot.sendPhoto(chatId, imageBuffer, {
        caption: `Here's your custom game logo with ID ${logoId} and text "${text}"!`,
      });

      // Deduct 100 coins from user's balance
      await db.collection('users').updateOne(
        { userId },
        { $inc: { balance: -100 } }
      );

      bot.sendMessage(chatId, '100 coins have been deducted from your account for generating the logo.');
    } catch (error) {
      console.error('Error in glogo command:', error);
      bot.sendMessage(chatId, 'An error occurred while generating the logo. Please try again later.');
    }
  },
};
