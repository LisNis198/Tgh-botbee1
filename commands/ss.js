module.exports = {
    name: 'ss',
    adminOnly: false,
    ownerOnly: false,
    category: 'Utility',
    description: 'Capture a screenshot of a provided webpage URL',
    guide: 'Use /ss <URL> to capture a screenshot of the webpage',
    execute: async (bot, msg, args) => {
      const chatId = msg.chat.id;
  
      // Check if URL argument is provided
      if (args.length === 0) {
        return bot.sendMessage(chatId, 'Please provide a URL to capture a screenshot.');
      }
  
      const userProvidedUrl = args[0];
      const screenshotUrl = `https://api.nexalo.xyz/screenshot.php?url=${encodeURIComponent(userProvidedUrl)}&api=na_Z21SSP93HR0123QO`;
  
      try {
        // Send the image directly from the URL
        await bot.sendPhoto(chatId, screenshotUrl, { caption: `Here is the screenshot for ${userProvidedUrl}` });
      } catch (error) {
        console.error('Error sending screenshot:', error);
        bot.sendMessage(chatId, 'An error occurred while trying to capture the screenshot. Please try again later.');
      }
    },
  };
  