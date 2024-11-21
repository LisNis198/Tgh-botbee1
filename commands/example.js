module.exports = {
    name: 'example',
    adminOnly: false,
    ownerOnly: false,
    category: 'General',
    description: 'This is an example command',
    guide: 'Use /example to see how commands work',
    execute: async (bot, msg, args) => {
      await bot.sendMessage(msg.chat.id, 'This is an example command. It works!');
    }
  };