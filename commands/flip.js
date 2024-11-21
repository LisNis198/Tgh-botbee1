module.exports = {
    name: 'flip',
    adminOnly: false,
    ownerOnly: false,
    category: 'Fun',
    description: 'Flip a coin',
    guide: 'Use /flip to flip a coin',
    execute: async (bot, msg) => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      await bot.sendMessage(msg.chat.id, `You flipped a coin and got: ${result}`);
    }
  };