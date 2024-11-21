module.exports = {
    name: 'emojistory',
    adminOnly: false,
    ownerOnly: false,
    category: 'Fun',
    description: 'Generate a random emoji story',
    guide: 'Use /emojistory to get a random emoji story',
    execute: async (bot, msg) => {
      const emojis = ['😀', '😎', '🤖', '👽', '🚀', '🌍', '🌙', '🌟', '🍕', '🍦', '🎉', '🎈', '🎁', '🐶', '🐱', '🐼', '🦄', '🌈', '☀️', '🌊'];
      const storyLength = Math.floor(Math.random() * 10) + 5; // 5 to 14 emojis
      let story = '';
  
      for (let i = 0; i < storyLength; i++) {
        story += emojis[Math.floor(Math.random() * emojis.length)];
      }
  
      await bot.sendMessage(msg.chat.id, `Here's your emoji story:\n\n${story}\n\nWhat do you think it means?`);
    }
  };