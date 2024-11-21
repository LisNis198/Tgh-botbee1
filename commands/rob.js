module.exports = {
    name: 'rob',
    adminOnly: false,
    ownerOnly: false,
    category: 'Economy',
    description: 'Attempt to rob another user',
    guide: 'Use /rob @username to attempt to rob another user',
    execute: async (bot, msg, args, db) => {
      const userId = msg.from.id;
      const chatId = msg.chat.id;
      const now = new Date();
      const cooldown = 60 * 60 * 1000; // 1 hour cooldown
  
      if (!msg.reply_to_message || !msg.reply_to_message.from) {
        return bot.sendMessage(chatId, 'You need to reply to the message of the user you want to rob.');
      }
  
      const targetUserId = msg.reply_to_message.from.id;
  
      if (targetUserId === userId) {
        return bot.sendMessage(chatId, "You can't rob yourself!");
      }
  
      try {
        const user = await db.collection('users').findOne({ userId });
        const targetUser = await db.collection('users').findOne({ userId: targetUserId });
  
        if (!user || !targetUser) {
          return bot.sendMessage(chatId, "One of the users doesn't have an account yet.");
        }
  
        if (user.lastRob && now - new Date(user.lastRob) < cooldown) {
          const timeLeft = formatTimeLeft(cooldown - (now - new Date(user.lastRob)));
          return bot.sendMessage(chatId, `You need to lay low for a while. You can rob again in ${timeLeft}.`);
        }
  
        const success = Math.random() < 0.3; // 30% chance of successful robbery
        let stolenAmount = 0;
        let message = '';
  
        if (success) {
          stolenAmount = Math.floor(Math.random() * (targetUser.balance * 0.3)); // Steal up to 30% of target's balance
          await db.collection('users').updateOne(
            { userId },
            { 
              $inc: { balance: stolenAmount },
              $set: { lastRob: now }
            }
          );
          await db.collection('users').updateOne(
            { userId: targetUserId },
            { $inc: { balance: -stolenAmount } }
          );
          message = `You successfully robbed ${stolenAmount} coins from the user!`;
        } else {
          const fine = Math.floor(Math.random() * (user.balance * 0.2)); // Lose up to 20% of your balance
          await db.collection('users').updateOne(
            { userId },
            { 
              $inc: { balance: -fine },
              $set: { lastRob: now }
            }
          );
          message = `Your robbery attempt failed! You were caught and fined ${fine} coins.`;
        }
  
        bot.sendMessage(chatId, message);
      } catch (error) {
        console.error('Error in rob command:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.');
      }
    }
  };
  
  function formatTimeLeft(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }