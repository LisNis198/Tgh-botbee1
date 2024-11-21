const axios = require('axios');

module.exports = {
  name: 'elon',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Generate an Elon Musk meme with custom text.',
  guide: 'Use "/elon <your text>" to generate an Elon Musk meme with your specified text.',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    // Ensure that the command includes additional text after "elon"
    const userText = args.join(" ");
    if (!userText) {
      await bot.sendMessage(chatId, 'Please provide some text to generate the Elon Musk meme, e.g., "/elon Your custom text here".', {
        reply_to_message_id: msg.message_id
      });
      return;
    }

    try {
      // Construct the API URL with the user-provided text
      const apiUrl = `https://api.elianabot.xyz/memes/elon.php?text=${encodeURIComponent(userText)}`;

      // Fetch the image from the API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      
      // Send the meme image to the chat
      await bot.sendPhoto(chatId, imageBuffer, {
        caption: `Here's your Elon Musk meme!`,
        reply_to_message_id: msg.message_id
      });
    } catch (error) {
      console.error('Error generating Elon Musk meme:', error);
      await bot.sendMessage(chatId, '❌ An error occurred while generating the Elon Musk meme.', {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
