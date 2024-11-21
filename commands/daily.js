const { ObjectId } = require('mongodb');

module.exports = {
  name: 'daily',
  adminOnly: false,
  ownerOnly: false,
  category: 'Economy',
  description: 'Claim your daily reward',
  guide: 'Use /daily to claim your daily reward',
  execute: async (bot, msg, args, db) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const now = new Date();
    const reward = 100; // Daily reward amount

    try {
      const user = await db.collection('users').findOne({ userId });

      if (user) {
        const lastDaily = user.lastDaily ? new Date(user.lastDaily) : new Date(0);
        if (now - lastDaily < 24 * 60 * 60 * 1000) {
          const nextDaily = new Date(lastDaily.getTime() + 24 * 60 * 60 * 1000);
          return bot.sendMessage(chatId, `You can claim your next daily reward in ${formatTimeLeft(nextDaily - now)}.`);
        }

        await db.collection('users').updateOne(
          { userId },
          { 
            $inc: { balance: reward },
            $set: { lastDaily: now }
          }
        );
      } else {
        await db.collection('users').insertOne({
          userId,
          balance: reward,
          lastDaily: now
        });
      }

      bot.sendMessage(chatId, `You've claimed your daily reward of ${reward} coins!`);
    } catch (error) {
      console.error('Error in daily command:', error);
      bot.sendMessage(chatId, 'An error occurred while processing your request.');
    }
  }
};

function formatTimeLeft(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}