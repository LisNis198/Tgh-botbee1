module.exports = {
    name: 'mute',
    adminOnly: true,
    ownerOnly: false,
    category: 'Moderation',
    description: 'Mute a user in the group for a specified duration',
    guide: 'Reply to a message with /mute [duration] or use /mute @username [duration] [reason]',
    execute: async (bot, msg, args) => {
      try {
        const chatType = msg.chat.type;
        if (chatType !== 'supergroup') {
          return bot.sendMessage(msg.chat.id, 'This command can only be used in supergroups.');
        }
  
        let userId, username, duration, reason;
        
        if (msg.reply_to_message) {
          userId = msg.reply_to_message.from.id;
          username = msg.reply_to_message.from.username || msg.reply_to_message.from.first_name;
          duration = args[0] || '1h';
          reason = args.slice(1).join(' ') || 'No reason provided';
        } else if (args.length > 1) {
          username = args[0].replace('@', '');
          try {
            const chatMember = await bot.getChatMember(msg.chat.id, username);
            userId = chatMember.user.id;
          } catch (error) {
            return bot.sendMessage(msg.chat.id, 'Unable to find the specified user.');
          }
          duration = args[1];
          reason = args.slice(2).join(' ') || 'No reason provided';
        } else {
          return bot.sendMessage(msg.chat.id, 'Please reply to a message or provide a username and duration to mute.');
        }
  
        const durationInSeconds = parseDuration(duration);
        if (isNaN(durationInSeconds)) {
          return bot.sendMessage(msg.chat.id, 'Invalid duration format. Use format like 1h, 30m, 2d, etc.');
        }
  
        await bot.restrictChatMember(msg.chat.id, userId, {
          until_date: Math.floor(Date.now() / 1000) + durationInSeconds,
          permissions: {
            can_send_messages: false,
            can_send_media_messages: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false
          }
        });
  
        await bot.sendMessage(msg.chat.id, `User ${username} has been muted for ${duration}.\nReason: ${reason}`);
      } catch (error) {
        console.error('Error in mute command:', error);
        await bot.sendMessage(msg.chat.id, 'An error occurred while trying to mute the user. Make sure the bot has the necessary permissions.');
      }
    }
  };
  
  function parseDuration(duration) {
    const unit = duration.slice(-1).toLowerCase();
    const value = parseInt(duration.slice(0, -1));
    
    switch (unit) {
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return NaN;
    }
  }