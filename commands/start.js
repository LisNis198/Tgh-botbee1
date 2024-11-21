const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'start',
  description: 'Starts the bot and sends a welcome message with an image',
  async execute(bot, msg, args, db) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name || 'User';

    // Path to the image
    const imagePath = path.join(__dirname, '..', 'assets', 'nexa.jpg');

    // Check if the image exists
    if (!fs.existsSync(imagePath)) {
      console.error('Image not found:', imagePath);
      await bot.sendMessage(chatId, 'Welcome! An error occurred while loading the image. For a list of commands, type /help');
      return;
    }

    // Send the welcome message with the image
    try {
      await bot.sendPhoto(chatId, imagePath, {
        caption: `Welcome, ${username}! For a list of all commands, type /help`,
        parse_mode: 'HTML'
      });

      // Log the start command usage
      console.log(`${username} (ID: ${userId}) started the bot in chat ${chatId}`);

      // Update user data in the database
      await db.collection('users').updateOne(
        { userId: userId },
        {
          $set: {
            username: username,
            lastActive: new Date(),
            chatId: chatId
          },
          $inc: { commandsUsed: 1 }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error sending welcome message:', error);
      await bot.sendMessage(chatId, 'Welcome! An error occurred while sending the welcome message. For a list of commands, type /help');
    }
  },
};