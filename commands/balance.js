module.exports = {
    name: 'balance',
    adminOnly: false,
    ownerOnly: false,
    category: 'Economy',
    description: 'Check your balance',
    guide: 'Use /balance to check your current balance',
    execute: async (bot, msg, args, db) => {
      const userId = msg.from.id;
      const chatId = msg.chat.id;
  
      try {
        const user = await db.collection('users').findOne({ userId });
  
        if (user) {
          bot.sendMessage(chatId, `Your current balance is ${user.balance} coins.`);
        } else {
          bot.sendMessage(chatId, 'You don\'t have an account yet. Use /daily to start earning!');
        }
      } catch (error) {
        console.error('Error in balance command:', error);
        bot.sendMessage(chatId, 'An error occurred while checking your balance.');
      }
    }
  };