const { ObjectId } = require('mongodb');

module.exports = {
  name: 'rich',
  aliases: ['top', 'leaderboard'],
  adminOnly: false,
  ownerOnly: false,
  category: 'Economy',
  description: 'Show the top 10 richest users in the group',
  guide: 'Use /rich to see the top 10 richest users in this group',
  execute: async (bot, msg, args, db) => {
    const chatId = msg.chat.id;
    const groupId = msg.chat.id.toString(); // Convert to string for consistency

    try {
      // Fetch top 10 users for this group, sorted by balance
      const topUsers = await db.collection('users')
        .find({ groupId: groupId })
        .sort({ balance: -1 })
        .limit(10)
        .toArray();

      if (topUsers.length === 0) {
        return bot.sendMessage(chatId, "There are no users with a balance in this group yet.");
      }

      let message = "🏆 Top 10 Richest Users in this Group 🏆\n\n";
      
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        let userInfo;
        
        try {
          userInfo = await bot.getChatMember(chatId, user.userId);
        } catch (error) {
          console.error(`Error fetching user info for ${user.userId}:`, error);
          userInfo = { user: { first_name: "Unknown User" } };
        }

        const username = userInfo.user.username ? `@${userInfo.user.username}` : userInfo.user.first_name;
        message += `${i + 1}. ${username}: ${user.balance} coins\n`;
      }

      await bot.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error in rich command:', error);
      await bot.sendMessage(chatId, 'An error occurred while fetching the richest users.');
    }
  }
};