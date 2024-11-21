const axios = require('axios');

module.exports = {
  name: 'confess',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Generate a confession meme with your profile picture and the user you replied to.',
  guide: 'Reply to a user’s message with "confess" or "/confess" to generate a confession meme.',
  execute: async (bot, msg) => {
    const chatId = msg.chat.id;

    // Confession messages for a personalized caption
    const confessionMessages = [
      `I secretly admire you, ${msg.reply_to_message.from.first_name}...`,
      `Dear ${msg.reply_to_message.from.first_name}, I've always wanted to tell you something...`,
      `${msg.reply_to_message.from.first_name}, you're always on my mind...`,
      `Confession time, ${msg.reply_to_message.from.first_name}... I have feelings for you.`,
      `I can't hide it anymore, ${msg.reply_to_message.from.first_name}...`,
      `${msg.reply_to_message.from.first_name}, I just had to let you know...`,
      `${msg.reply_to_message.from.first_name}, I've kept this a secret for too long...`,
      `It's confession time, ${msg.reply_to_message.from.first_name}!`,
      `I have to admit, ${msg.reply_to_message.from.first_name}, you mean a lot to me.`,
      `${msg.reply_to_message.from.first_name}, this is my confession...`
    ];
    const randomMessage = confessionMessages[Math.floor(Math.random() * confessionMessages.length)];

    // Check if the command is used as a reply to another user's message
    if (msg.reply_to_message && (msg.text.toLowerCase() === 'confess' || msg.text.toLowerCase() === '/confess')) {
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

        // Generate the confession meme using the external API
        const apiUrl = `https://api.elianabot.xyz/memes/confess.php?image1=${encodeURIComponent(repliedUserImageUrl)}&image2=${encodeURIComponent(commandUserImageUrl)}`;

        // Fetch and send the image
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        await bot.sendPhoto(chatId, imageBuffer, {
          caption: randomMessage,
          reply_to_message_id: msg.message_id
        });
      } catch (error) {
        console.error('Error in confess command:', error);
        await bot.sendMessage(chatId, 'An error occurred while processing your request.', {
          reply_to_message_id: msg.message_id
        });
      }
    } else {
      // If not used as a reply, provide instructions
      await bot.sendMessage(chatId, 'To use this command, reply to a user’s message with "confess" or "/confess".', {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
