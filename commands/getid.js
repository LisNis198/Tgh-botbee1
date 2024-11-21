module.exports = {
    name: 'getid',
    adminOnly: false,
    ownerOnly: false,
    category: 'Utility',
    description: 'Get the user ID of yourself or a replied user',
    guide: 'Use /getid or reply to a message with /getid',
    execute: async (bot, msg, args) => {
      if (msg.reply_to_message) {
        const replyUserId = msg.reply_to_message.from.id;
        const replyUsername = msg.reply_to_message.from.username || 'N/A';
        await bot.sendMessage(msg.chat.id, `Replied User ID: ${replyUserId}\nUsername: @${replyUsername}`);
      } else {
        const userId = msg.from.id;
        const username = msg.from.username || 'N/A';
        await bot.sendMessage(msg.chat.id, `Your User ID: ${userId}\nYour Username: @${username}`);
      }
    }
  };