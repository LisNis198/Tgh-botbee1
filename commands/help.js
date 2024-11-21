const { MessageEntity } = require('node-telegram-bot-api');

module.exports = {
  name: 'help',
  adminOnly: false,
  ownerOnly: false,
  category: 'Utility',
  description: 'Show all commands or info about a specific command',
  guide: 'Use /help for all commands, /help <category> for category commands, or /help <command> for specific info',
  execute: async (bot, msg, args, db) => {
    const chatId = msg.chat.id;
    const commands = bot.commands;

    if (!commands) {
      return bot.sendMessage(chatId, 'Error: Commands not properly loaded. Please contact the bot administrator.');
    }

    if (args.length === 0) {
      // Show all categories
      let helpMessage = '*Command Categories:*\n\n';
      const categories = new Set();
      
      // Safely collect categories
      Object.values(commands).forEach(cmd => {
        if (cmd && cmd.category) {
          categories.add(cmd.category);
        }
      });
      
      if (categories.size === 0) {
        categories.add('Uncategorized');
      }

      categories.forEach(category => {
        helpMessage += `/${category.toLowerCase()} - ${category} commands\n`;
      });

      helpMessage += '\nUse /help <category> to see commands in a specific category.';
      helpMessage += '\nUse /help <command> for more information on a specific command.';
      helpMessage += `\n\nTotal commands: ${Object.keys(commands).length}`;

      await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    } else {
      const searchTerm = args[0].toLowerCase();
      const categoryCommands = Object.entries(commands).filter(([_, cmd]) => 
        cmd && cmd.category && cmd.category.toLowerCase() === searchTerm
      );

      if (categoryCommands.length > 0) {
        // Show commands for a specific category
        let helpMessage = `*${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} Commands:*\n\n`;
        
        categoryCommands.forEach(([name, command]) => {
          helpMessage += `/${name} - ${command.description || 'No description available'}\n`;
        });

        helpMessage += '\nUse /help <command> for more information on a specific command.';
        helpMessage += `\n\nTotal ${searchTerm} commands: ${categoryCommands.length}`;
        helpMessage += `\nTotal commands: ${Object.keys(commands).length}`;

        await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
      } else {
        // Show info for a specific command
        const command = commands[searchTerm];

        if (command) {
          const helpMessage = `*/${searchTerm}*\n\n` +
                            `Description: ${command.description || 'No description available'}\n` +
                            `Category: ${command.category || 'Uncategorized'}\n` +
                            `Usage: ${command.guide || 'No usage guide available'}\n` +
                            `Admin Only: ${command.adminOnly ? 'Yes' : 'No'}\n` +
                            `Owner Only: ${command.ownerOnly ? 'Yes' : 'No'}\n\n` +
                            `Total commands: ${Object.keys(commands).length}`;

          await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
        } else {
          const similarCommands = Object.keys(commands).filter(cmd => cmd.includes(searchTerm));
          let errorMessage = `Command /${searchTerm} not found. Use /help to see all available categories.`;
          
          if (similarCommands.length > 0) {
            errorMessage += '\n\nDid you mean:\n' + similarCommands.map(cmd => `/${cmd}`).join('\n');
          }

          errorMessage += `\n\nTotal commands: ${Object.keys(commands).length}`;

          await bot.sendMessage(chatId, errorMessage);
        }
      }
    }
  }
};