const axios = require('axios');

module.exports = {
  name: 'joke',
  adminOnly: false,
  ownerOnly: false,
  category: 'Fun',
  description: 'Get a random joke',
  guide: 'Use /joke to get a random joke',
  execute: async (bot, msg) => {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      const joke = response.data;
      await bot.sendMessage(msg.chat.id, `${joke.setup}\n\n${joke.punchline}`);
    } catch (error) {
      console.error('Error fetching joke:', error);
      await bot.sendMessage(msg.chat.id, 'Sorry, I couldn\'t fetch a joke at the moment. Try again later!');
    }
  }
};