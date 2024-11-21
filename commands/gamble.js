module.exports = {
    name: 'gamble',
    adminOnly: false,
    ownerOnly: false,
    category: 'Economy',
    description: 'Gamble your coins',
    guide: 'Use /gamble <amount> to gamble your coins',
    execute: async (bot, msg, args, db) => {
      const userId = msg.from.id;
      const chatId = msg.chat.id;
  
      if (args.length !== 1 || isNaN(args[0]) || parseInt(args[0]) <= 0) {
        return bot.sendMessage(chatId, 'Please specify a valid amount to gamble. Usage: /gamble <amount>');
      }
  
      const amount = parseInt(args[0]);
  
      try {
        const user = await db.collection('users').findOne({ userId });
  
        if (!user || user.balance < amount) {
          return bot.sendMessage(chatId, "You don't have enough coins to gamble that amount.");
        }
  
        const roll = Math.random();
        let winnings = 0;
        let message = '';
  
        if (roll < 0.45) {
          winnings = -amount;
          message = `Sorry, you lost ${amount} coins. Better luck next time!`;
        } else if (roll < 0.90) {
          winnings = amount;
          message = `Congratulations! You won ${amount} coins!`;
        } else {
          winnings = amount * 2;
          message = `🎉 Jackpot! You won ${winnings} coins!`;
        }
  
        await db.collection('users').updateOne(
          { userId },
          { $inc: { balance: winnings } }
        );
  
        bot.sendMessage(chatId, message);
      } catch (error) {
        console.error('Error in gamble command:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.');
      }
    }
  };