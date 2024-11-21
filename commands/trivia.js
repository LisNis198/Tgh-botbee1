const axios = require('axios');

module.exports = {
  name: 'trivia',
  aliases: ['quiz'],
  adminOnly: false,
  ownerOnly: false,
  category: 'Games',
  description: 'Start a trivia game and earn coins',
  guide: 'Use /trivia to start a trivia game',
  execute: async (bot, msg, args, db) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const { question, correct_answer, incorrect_answers } = response.data.results[0];

      const answers = [correct_answer, ...incorrect_answers].sort(() => Math.random() - 0.5);

      let message = `🧠 Trivia Time!\n\n${decodeEntities(question)}\n\n`;
      answers.forEach((answer, index) => {
        message += `${['A', 'B', 'C', 'D'][index]}. ${decodeEntities(answer)}\n`;
      });

      message += '\nReply with A, B, C, or D to answer!';

      await bot.sendMessage(chatId, message);

      // Set up a one-time listener for the user's answer
      bot.once('message', async (answerMsg) => {
        if (answerMsg.chat.id === chatId && answerMsg.from.id === userId) {
          const userAnswer = answerMsg.text.toUpperCase();
          const correctIndex = answers.indexOf(correct_answer);
          const correctLetter = ['A', 'B', 'C', 'D'][correctIndex];

          if (userAnswer === correctLetter) {
            const reward = Math.floor(Math.random() * 91) + 10; // Random reward between 10-100 coins
            await db.collection('users').updateOne(
              { userId },
              { $inc: { balance: reward } },
              { upsert: true }
            );
            await bot.sendMessage(chatId, `🎉 Correct! You've earned ${reward} coins. Well done!`);
          } else {
            await bot.sendMessage(chatId, `Sorry, that's incorrect. The correct answer was ${correctLetter}. ${decodeEntities(correct_answer)}`);
          }
        }
      });

    } catch (error) {
      console.error('Error in trivia command:', error);
      await bot.sendMessage(chatId, "Sorry, I couldn't start a trivia game right now. Try again later!");
    }
  }
};

function decodeEntities(encodedString) {
  const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  const translate = {
    "nbsp":" ",
    "amp" : "&",
    "quot": "\"",
    "lt"  : "<",
    "gt"  : ">"
  };
  return encodedString.replace(translate_re, function(match, entity) {
    return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
    const num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
}