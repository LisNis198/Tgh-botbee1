const axios = require('axios');

module.exports = {
  name: 'fact',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Get a random fact',
  guide: 'Use /fact to get a random fact',
  execute: async (bot, msg) => {
    try {
      const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const fact = response.data.text;
      await bot.sendMessage(msg.chat.id, `Did you know?\n\n${fact}`);
    } catch (error) {
      console.error('Error fetching fact:', error);
      await bot.sendMessage(msg.chat.id, 'Sorry, I couldn\'t fetch a fact at the moment. Try again later!');
    }
  }
};