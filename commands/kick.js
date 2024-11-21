module.exports = {
  name: 'kick',
  adminOnly: true,
  ownerOnly: false,
  category: 'Moderation',
  description: 'Kick a user from the group',
  guide: 'Reply to a message with /kick or use /kick @username [reason]',
  execute: async (bot, msg, args) => {
    try {
      let userId, reason;
      
      if (msg.reply_to_message) {
        userId = msg.reply_to_message.from.id;
        reason = args.join(' ') || 'No reason provided';
      } else if (args.length > 0) {
        const username = args[0].replace('@', '');
        const chatMember = await bot.getChatMember(msg.chat.id, username);
        userId = chatMember.user.id;
        reason = args.slice(1).join(' ') || 'No reason provided';
      } else {
        return bot.sendMessage(msg.chat.id, 'Please reply to a message or provide a username to kick.');
      }

      await bot.kickChatMember(msg.chat.id, userId);
      await bot.unbanChatMember(msg.chat.id, userId); // Unban to allow rejoin
      await bot.sendMessage(msg.chat.id, `User has been kicked.\nReason: ${reason}`);
    } catch (error) {
      console.error('Error in kick command:', error);
      await bot.sendMessage(msg.chat.id, 'An error occurred while trying to kick the user.');
    }
  }
};