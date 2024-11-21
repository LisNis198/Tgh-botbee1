module.exports = {
    name: 'admin',
    adminOnly: true,
    ownerOnly: false,
    category: 'Administration',
    description: 'Manage bot administrators',
    guide: 'Use /admin to list admins, /admin add <user_id> to add an admin, /admin remove <user_id> to remove an admin',
    execute: async (bot, msg, args, db) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
  
      // Check if the user is the owner
      const isOwner = process.env.OWNER_ID.split(',').includes(userId.toString());
  
      if (args.length === 0) {
        // List all admins
        const admins = await db.collection('admins').find({}).toArray();
        let adminList = 'Bot Administrators:\n\n';
        for (const admin of admins) {
          adminList += `${admin.username} (${admin.userId})${admin.isOwner ? ' (Owner)' : ''}\n`;
        }
        await bot.sendMessage(chatId, adminList);
      } else if (args[0] === 'add' && args[1]) {
        // Add a new admin
        const newAdminId = args[1];
        const existingAdmin = await db.collection('admins').findOne({ userId: newAdminId });
  
        if (existingAdmin) {
          await bot.sendMessage(chatId, 'This user is already an admin.');
        } else {
          try {
            const chatMember = await bot.getChatMember(chatId, newAdminId);
            await db.collection('admins').insertOne({
              userId: newAdminId,
              username: chatMember.user.username || 'Unknown',
              isOwner: false
            });
            await bot.sendMessage(chatId, `User ${newAdminId} has been added as an admin.`);
          } catch (error) {
            await bot.sendMessage(chatId, 'Error adding admin. Make sure the user ID is correct and the user is in this chat.');
          }
        }
      } else if (args[0] === 'remove' && args[1]) {
        // Remove an admin
        const adminToRemoveId = args[1];
  
        if (!isOwner) {
          return bot.sendMessage(chatId, 'Only the owner can remove admins.');
        }
  
        const adminToRemove = await db.collection('admins').findOne({ userId: adminToRemoveId });
  
        if (!adminToRemove) {
          await bot.sendMessage(chatId, 'This user is not an admin.');
        } else if (adminToRemove.isOwner) {
          await bot.sendMessage(chatId, 'The owner cannot be removed.');
        } else {
          await db.collection('admins').deleteOne({ userId: adminToRemoveId });
          await bot.sendMessage(chatId, `Admin ${adminToRemoveId} has been removed.`);
        }
      } else {
        await bot.sendMessage(chatId, 'Invalid command. Use /help admin for usage information.');
      }
    }
  };