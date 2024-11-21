const axios = require('axios');

module.exports = {
  name: 'fuck',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Generate a funny image using your profile picture and the profile picture of the user you replied to.',
  guide: 'Reply to a user’s message with "fuck" or "/fuck" to generate a funny image with both profile pictures.',
  execute: async (bot, msg) => {
    const chatId = msg.chat.id;

    // Check if the command is used as a reply to another user's message
    if (msg.reply_to_message && (msg.text.toLowerCase() === 'fuck' || msg.text.toLowerCase() === '/fuck')) {
      try {
        // Get profile picture of the replied user (image1)
        const repliedUser = msg.reply_to_message.from;
        const repliedUserId = repliedUser.id;
        const repliedUserPhotos = await bot.getUserProfilePhotos(repliedUserId, 0, 1);
        let repliedUserImageUrl = 'https://fakeimg.pl/512x512?text=no+pic'; // Placeholder if no profile picture

        if (repliedUserPhotos.total_count > 0) {
          const fileId = repliedUserPhotos.photos[0][0].file_id;
          const fileInfo = await bot.getFile(fileId);
          repliedUserImageUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;
        }

        // Get profile picture of the command user (image2)
        const commandUserId = msg.from.id;
        const commandUserPhotos = await bot.getUserProfilePhotos(commandUserId, 0, 1);
        let commandUserImageUrl = 'https://fakeimg.pl/512x512?text=no+pic'; // Placeholder if no profile picture

        if (commandUserPhotos.total_count > 0) {
          const fileId = commandUserPhotos.photos[0][0].file_id;
          const fileInfo = await bot.getFile(fileId);
          commandUserImageUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;
        }

        // Generate the funny image using the external API
        const apiUrl = `https://api.elianabot.xyz/fun/fuck.php?image1=${encodeURIComponent(repliedUserImageUrl)}&image2=${encodeURIComponent(commandUserImageUrl)}`;

        // Fetch and send the image
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        
        await bot.sendPhoto(chatId, imageBuffer, {
          caption: `Fuck you ${repliedUser.first_name || repliedUser.username || 'there'}`,
          reply_to_message_id: msg.message_id
        });
      } catch (error) {
        console.error('Error in fuck command:', error);
        await bot.sendMessage(chatId, 'An error occurred while processing your request.', {
          reply_to_message_id: msg.message_id
        });
      }
    } else {
      // If not used as a reply, provide instructions
      await bot.sendMessage(chatId, 'To use this command, reply to a user’s message with "fuck" or "/fuck".', {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
