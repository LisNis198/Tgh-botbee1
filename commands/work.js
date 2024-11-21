module.exports = {
    name: 'work',
    adminOnly: false,
    ownerOnly: false,
    category: 'Economy',
    description: 'Work to earn coins',
    guide: 'Use /work to earn coins',
    execute: async (bot, msg, args, db) => {
      const userId = msg.from.id;
      const chatId = msg.chat.id;
      const now = new Date();
      const cooldown = 30 * 60 * 1000; // 30 minutes cooldown
  
      try {
        const user = await db.collection('users').findOne({ userId });
  
        if (user && user.lastWork) {
          const timeSinceLastWork = now - new Date(user.lastWork);
          if (timeSinceLastWork < cooldown) {
            const timeLeft = formatTimeLeft(cooldown - timeSinceLastWork);
            return bot.sendMessage(chatId, `You need to rest. You can work again in ${timeLeft}.`);
          }
        }
  
        const jobs = [
          { name: "Programmer", pay: Math.floor(Math.random() * 51) + 50 },
          { name: "Teacher", pay: Math.floor(Math.random() * 41) + 40 },
          { name: "Chef", pay: Math.floor(Math.random() * 46) + 35 },
          { name: "Driver", pay: Math.floor(Math.random() * 31) + 30 },
          { name: "Freelancer", pay: Math.floor(Math.random() * 71) + 30 }
        ];
  
        const job = jobs[Math.floor(Math.random() * jobs.length)];
  
        await db.collection('users').updateOne(
          { userId },
          { 
            $inc: { balance: job.pay },
            $set: { lastWork: now }
          },
          { upsert: true }
        );
  
        bot.sendMessage(chatId, `You worked as a ${job.name} and earned ${job.pay} coins!`);
      } catch (error) {
        console.error('Error in work command:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.');
      }
    }
  };
  
  function formatTimeLeft(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }