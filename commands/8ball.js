const axios = require('axios');

module.exports = {
  name: '8ball',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Ask the Magic 8-Ball a question',
  guide: 'Use /8ball followed by your question',
  execute: async (bot, msg, args) => {
    if (args.length === 0) {
      return bot.sendMessage(msg.chat.id, 'Please ask a question after /8ball');
    }

    const question = args.join(' ');
    const responses = [
      'It is certain', 'It is decidedly so', 'Without a doubt', 'Yes, definitely',
      'You may rely on it', 'As I see it, yes', 'Most likely', 'Outlook good',
      'Yes', 'Signs point to yes', 'Reply hazy, try again', 'Ask again later',
      'Better not tell you now', 'Cannot predict now', 'Concentrate and ask again',
      'Don\'t count on it', 'My reply is no', 'My sources say no',
      'Outlook not so good', 'Very doubtful'
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    await bot.sendMessage(msg.chat.id, `Q: ${question}\nA: ${response}`);
  }
};
