module.exports = {
    name: 'rps',
    adminOnly: false,
    ownerOnly: false,
    category: 'Fun',
    description: 'Play Rock Paper Scissors with the bot',
    guide: 'Use /rps [rock/paper/scissors] to play',
    execute: async (bot, msg, args) => {
      if (args.length === 0) {
        return bot.sendMessage(msg.chat.id, 'Please choose rock, paper, or scissors after /rps');
      }
  
      const userChoice = args[0].toLowerCase();
      const choices = ['rock', 'paper', 'scissors'];
  
      if (!choices.includes(userChoice)) {
        return bot.sendMessage(msg.chat.id, 'Please choose rock, paper, or scissors');
      }
  
      const botChoice = choices[Math.floor(Math.random() * choices.length)];
  
      let result;
      if (userChoice === botChoice) {
        result = "It's a tie!";
      } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) {
        result = 'You win!';
      } else {
        result = 'You lose!';
      }
  
      await bot.sendMessage(msg.chat.id, `You chose ${userChoice}\nI chose ${botChoice}\n\n${result}`);
    }
  };