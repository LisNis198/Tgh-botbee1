const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'noti',
  adminOnly: false,
  ownerOnly: true,
  category: 'Owner',
  description: 'Send a notification to all users and groups',
  guide: 'Reply to a message with /noti [Your message] to send a notification. Include an image in the replied message to send it with the notification.',
  execute: async (bot, msg, args, db) => {
    const chatId = msg.chat.id;
    const ownerId = process.env.OWNER_ID.split(',')[0]; // Get the first owner ID

    if (msg.from.id.toString() !== ownerId) {
      return bot.sendMessage(chatId, '🚫 This command is only available to the bot owner. 🚫');
    }

    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide a message to send as a notification.');
    }

    const notificationMessage = args.join(' ');
    let imageFileId = null;

    // Check if the command is a reply and contains an image
    if (msg.reply_to_message && msg.reply_to_message.photo) {
      imageFileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
    }

    try {
      // Get all chat IDs from the database
      const allChatIds = await getAllChatIds(db);

      let successCount = 0;
      let failCount = 0;

      // Send notification to all chats
      for (const chatId of allChatIds) {
        try {
          if (imageFileId) {
            await bot.sendPhoto(chatId, imageFileId, { caption: notificationMessage });
          } else {
            await bot.sendMessage(chatId, notificationMessage);
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to send notification to chat ${chatId}:`, error);
          failCount++;
        }
        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Send summary to owner
      const summaryMessage = `✅ Notification sent successfully to ${successCount} chats.\n❌ Failed to send to ${failCount} chats.`;
      await bot.sendMessage(chatId, summaryMessage);

    } catch (error) {
      console.error('Error in noti command:', error);
      await bot.sendMessage(chatId, '❌ An error occurred while sending the notification. Please try again.');
    }
  }
};

async function getAllChatIds(db) {
  try {
    // Get all private chats
    const privateChats = await db.collection('users').distinct('userId');
    
    // Get all group chats
    const groupChats = await db.collection('groups').distinct('groupId');

    // Combine and return all chat IDs
    return [...privateChats, ...groupChats];
  } catch (error) {
    console.error('Error fetching chat IDs:', error);
    return [];
  }
}