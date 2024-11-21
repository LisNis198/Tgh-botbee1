module.exports = {
    name: 'transfer',
    adminOnly: false,
    ownerOnly: false,
    category: 'Economy',
    description: 'Transfer coins to another user',
    guide: 'Use /transfer @username amount to transfer coins',
    execute: async (bot, msg, args, db) => {
      const chatId = msg.chat.id;
      const fromUserId = msg.from.id;
  
      if (args.length !== 2) {
        return bot.sendMessage(chatId, 'Usage: /transfer @username amount');
      }
  
      const toUsername = args[0].replace('@', '');
      const amount = parseInt(args[1]);
  
      if (isNaN(amount) || amount <= 0) {
        return bot.sendMessage(chatId, 'Please enter a valid amount to transfer.');
      }
  
      try {
        const fromUser = await db.collection('users').findOne({ userId: fromUserId });
        if (!fromUser || fromUser.balance < amount) {
          return bot.sendMessage(chatId, 'You don\'t have enough coins for this transfer.');
        }
  
        const toUser = await db.collection('users').findOne({ username: toUsername });
        if (!toUser) {
          return bot.sendMessage(chatId, 'Recipient user not found.');
        }
  
        await db.collection('users').updateOne(
          { userId: fromUserId },
          { $inc: { balance: -amount } }
        );
  
        await db.collection('users').updateOne(
          { userId: toUser.userId },
          { $inc: { balance: amount } }
        );
  
        bot.sendMessage(chatId, `Successfully transferred ${amount} coins to @${toUsername}.`);
      } catch (error) {
        console.error('Error in transfer command:', error);
        bot.sendMessage(chatId, 'An error occurred while processing the transfer.');
      }
    }
  };