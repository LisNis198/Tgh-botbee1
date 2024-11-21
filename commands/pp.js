module.exports = {
  name: 'pp',
  adminOnly: false,
  ownerOnly: false,
  category: 'Utility',
  description: 'Get the profile picture of a user you reply to',
  guide: 'Reply to a message with "pp" or "/pp" to get that user\'s profile picture',
  execute: async (bot, msg) => {
    try {
      // Check if the message is a reply and the content is either 'pp' or '/pp' (case-insensitive)
      if (msg.reply_to_message && (msg.text.toLowerCase() === 'pp' || msg.text.toLowerCase() === '/pp')) {
        const targetUser = msg.reply_to_message.from;
        const userId = targetUser.id;
        const username = targetUser.username || targetUser.first_name || 'N/A';

        // Fetch the profile picture
        const userProfilePhotos = await bot.getUserProfilePhotos(userId, 0, 1);

        if (userProfilePhotos && userProfilePhotos.total_count > 0) {
          const fileId = userProfilePhotos.photos[0][0].file_id;
          await bot.sendPhoto(msg.chat.id, fileId, {
            caption: `${username}'s profile picture`,
            reply_to_message_id: msg.message_id
          });
        } else {
          await bot.sendMessage(msg.chat.id, `${username} doesn't have a profile picture.`, {
            reply_to_message_id: msg.message_id
          });
        }
      } else if (msg.text.toLowerCase() === 'pp' || msg.text.toLowerCase() === '/pp') {
        // If no reply, fetch the user's own profile picture
        const userId = msg.from.id;
        const username = msg.from.username || msg.from.first_name || 'N/A';

        // Fetch the user's profile picture
        const userProfilePhotos = await bot.getUserProfilePhotos(userId, 0, 1);

        if (userProfilePhotos && userProfilePhotos.total_count > 0) {
          const fileId = userProfilePhotos.photos[0][0].file_id;
          await bot.sendPhoto(msg.chat.id, fileId, {
            caption: `${username}'s profile picture`,
            reply_to_message_id: msg.message_id
          });
        } else {
          await bot.sendMessage(msg.chat.id, `You don't have a profile picture.`, {
            reply_to_message_id: msg.message_id
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      await bot.sendMessage(msg.chat.id, '❌ An error occurred while fetching the profile picture.', {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
