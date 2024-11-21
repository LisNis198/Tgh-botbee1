// File: commands/restart.js
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  name: 'restart',
  adminOnly: false,
  ownerOnly: true,
  category: 'System',
  description: 'Restart the bot and log the restart time',
  guide: 'Use /restart to restart the bot',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const startTime = Date.now();

    try {
      await bot.sendMessage(chatId, '🔄 Initiating bot restart... Shutting down...');

      // Log the shutdown time
      const shutdownTime = new Date().toISOString();
      await fs.appendFile(path.join(__dirname, '../restart.log'), `Shutdown initiated: ${shutdownTime}\n`);

      // Simulate shutdown process (you can add actual shutdown logic here if needed)
      await new Promise(resolve => setTimeout(resolve, 2000));

      await bot.sendMessage(chatId, '💤 Bot is now offline. Starting up again...');

      // Spawn a new process
      const child = spawn(process.argv[0], process.argv.slice(1), {
        detached: true,
        stdio: 'inherit'
      });

      child.unref();

      // Log the restart time and calculate duration
      const restartTime = new Date().toISOString();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      await fs.appendFile(path.join(__dirname, '../restart.log'), `Restart completed: ${restartTime}\nRestart duration: ${duration} seconds\n\n`);

      // Send a final message before exiting
      await bot.sendMessage(chatId, `✅ Restart process completed! Time taken: ${duration} seconds. Bot is now online!`);

      // Exit the current process
      process.exit();
    } catch (error) {
      console.error('Error during restart:', error);
      await bot.sendMessage(chatId, '💔 Oops! Something went wrong during the restart. Please try again later!');
    }
  }
};