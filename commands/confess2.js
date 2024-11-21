const axios = require('axios');

module.exports = {
  name: 'confess2',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Generate a second confession meme with your profile picture and the user you replied to.',
  guide: 'Reply to a user’s message with "confess2" or "/confess2" to generate a new confession meme.',
  execute: async (bot, msg) => {
    const chatId = msg.chat.id;

    // Confession messages for a personalized caption
    const confessionMessages = [
      `I've been holding back, ${msg.reply_to_message.from.first_name}...`,
      `Hey ${msg.reply_to_message.from.first_name}, this might surprise you...`,
      `${msg.reply_to_message.from.first_name}, you occupy a special place in my heart...`,
      `I can't keep this to myself anymore, ${msg.reply_to_message.from.first_name}...`,
      `You have a secret admirer, ${msg.reply_to_message.from.first_name}!`,
      `There’s something I’ve been meaning to say, ${msg.reply_to_message.from.first_name}...`,
      `${msg.reply_to_message.from.first_name}, you mean more to me than you realize...`,
      `${msg.reply_to_message.from.first_name}, just wanted to confess...`,
      `${msg.reply_to_message.from.first_name}, my heart has a message for you...`,
      `It’s confession time, ${msg.reply_to_message.from.first_name}!`
    ];
    const randomMessage = confessionMessages[Math.floor(Math.random() * confessionMessages.length)];

    // Check if the command is used as a reply to another user's message
    if (msg.reply_to_message && (msg.text.toLowerCase() === 'confess2' || msg.text.toLowerCase() === '/confess2')) {
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

        // Generate the confession meme using the confess2 API
        const apiUrl = `https://api.elianabot.xyz/memes/confess2.php?image1=${encodeURIComponent(repliedUserImageUrl)}&image2=${encodeURIComponent(commandUserImageUrl)}`;

        // Fetch and send the image
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        await bot.sendPhoto(chatId, imageBuffer, {
          caption: randomMessage,
          reply_to_message_id: msg.message_id
        });
      } catch (error) {
        console.error('Error in confess2 command:', error);
        await bot.sendMessage(chatId, 'An error occurred while processing your request.', {
          reply_to_message_id: msg.message_id
        });
      }
    } else {
      // If not used as a reply, provide instructions
      await bot.sendMessage(chatId, 'To use this command, reply to a user’s message with "confess2" or "/confess2".', {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
