require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { connectToDatabase } = require('./db');
const schedule = require('node-schedule');
const { updateUserXP } = require('./commands/rank');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = {};

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands[command.name] = command;
}

bot.commands = commands;

function rainbowText(text) {
  const colors = ['red', 'magenta', 'blue', 'cyan', 'green', 'yellow'];
  return text.split('').map((char, i) => {
    const color = colors[i % colors.length];
    return chalk[color](char);
  }).join('');
}

function fancyBox(text) {
  const width = text.length + 4;
  const top = '╔' + '═'.repeat(width) + '╗';
  const middle = '║  ' + text + '  ║';
  const bottom = '╚' + '═'.repeat(width) + '╝';
  return `${top}\n${middle}\n${bottom}`;
}

const botAsciiArt = `
   ╭━━━╮╱╱╱╱╱╭━━━╮
   ┃╭━╮┃╱╱╱╱╱┃╭━╮┃
   ┃┃╱┃┣━━┳━━┫┃╱╰╯
   ┃╰━╯┃╭╮┃╭╮┃┃╭━╮
   ┃╭━╮┃╰╯┃╰╯┃╰┻━┃
   ╰╯╱╰┻━━┻━━┻━━━╯
`;

function jsonGradient(obj, indent = 0) {
  const emojis = ['😵‍💫', '✨', '💫', '🌟', '⭐', '💖'];
  const colors = ['red', 'magenta', 'blue', 'cyan', 'green', 'yellow'];
  let colorIndex = 0;
  const spaces = ' '.repeat(indent * 2);

  return Object.entries(obj).map(([key, value]) => {
    const color = colors[colorIndex % colors.length];
    const emoji = emojis[colorIndex % emojis.length];
    colorIndex++;

    if (typeof value === 'object' && value !== null) {
      return `${spaces}${emoji} ${chalk[color](key)}: ${jsonGradient(value, indent + 1)}`;
    } else {
      return `${spaces}${emoji} ${chalk[color](key)}: ${chalk[color](JSON.stringify(value))}`;
    }
  }).join('\n');
}

async function sendWeeklyReport(bot, db) {
  const groups = await db.collection('groups').find({}).toArray();

  for (const group of groups) {
    const users = await db.collection('users').find({ groupId: group.groupId }).sort({ xp: -1 }).limit(10).toArray();

    let message = `📊 Weekly Activity Report for ${group.groupName}\n\nTop 10 Active Members:\n`;
    users.forEach((user, index) => {
      message += `${index + 1}. ${user.username || 'Unknown User'}: ${user.xp} XP\n`;
    });

    bot.sendMessage(group.groupId, message).catch(error => {
      console.log(chalk.yellow(`Failed to send weekly report to group ${group.groupName} (${group.groupId}): ${error.message}`));
    });
  }
}

async function checkVersion() {
  try {
    console.log(rainbowText(botAsciiArt));
    console.log(fancyBox('✨ Checking for updates... ✨'));
    
    const response = await fetch('https://raw.githubusercontent.com/1dev-hridoy/1dev-hridoy/refs/heads/main/nexalo.json');
    const jsonData = await response.json();
    const localVersion = fs.readFileSync(path.join(__dirname, 'version.txt'), 'utf8').trim();

    if (jsonData.version !== localVersion) {
      console.log('\n' + fancyBox('🚨 OMG NEW UPDATE DETECTED! 🚨'));
      console.log(chalk.red.bold(`
      ⚡️ Current version: ${localVersion}
      🌟 New version: ${jsonData.version}
      
      💫 Please update to continue being awesome! 💫
      `));
      process.exit(1);
    } else {
      console.log(fancyBox('🎉 Version check passed! You are totally up to date! 🎉'));
      console.log('\n✨ Bot Configuration ✨\n');
      console.log(jsonGradient(jsonData));
      console.log('\n' + rainbowText('====================================='));
    }
  } catch (error) {
    console.error(chalk.red.bold(fancyBox('💔 Oopsie! Something went wrong! 💔')));
    console.error(error);
    process.exit(1);
  }
}

async function startBot() {
  await checkVersion();

  const db = await connectToDatabase();
  console.log(fancyBox('🎯 Connected to MongoDB! Your data is safe with us! 🎯'));

  schedule.scheduleJob('0 0 * * 0', () => sendWeeklyReport(bot, db));

  bot.on('message', async (msg) => {
    const chatType = msg.chat.type;
    const username = msg.from.username || msg.from.first_name || 'Unknown';
    const time = new Date().toLocaleTimeString();
    const text = msg.text || 'Non-text message';

    console.log(rainbowText(
      `[${time}] ${chatType.toUpperCase()} - ${username}: ${text}`
    ));

    const { leveledUp, newLevel } = await updateUserXP(db, msg.from.id, username);

    if (leveledUp) {
      bot.sendMessage(msg.chat.id, `
🎊 OMG! OMG! OMG! 🎊
✨ ${username} just reached Level ${newLevel}! ✨
🌟 You're absolutely SLAYING IT! 🌟
      `).catch(error => console.error('Error sending level up message:', error));
    }

    if (chatType === 'group' || chatType === 'supergroup') {
      await db.collection('groups').updateOne(
        { groupId: msg.chat.id },
        { $set: { groupName: msg.chat.title } },
        { upsert: true }
      );

      await db.collection('users').updateOne(
        { userId: msg.from.id },
        { $set: { groupId: msg.chat.id } },
        { upsert: true }
      );
    }

    if (!msg.text || !msg.text.startsWith('/')) return;

    const args = msg.text.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!commands[commandName]) return;

    const command = commands[commandName];

    if (command.ownerOnly && !process.env.OWNER_ID.split(',').includes(msg.from.id.toString())) {
      return bot.sendMessage(msg.chat.id, '🚫 Oopsie! This command is for the cool kids (bot owners) only! 🚫')
        .catch(error => console.error('Error sending owner-only message:', error));
    }

    if (command.adminOnly && !(msg.chat.type === 'private' || await bot.getChatMember(msg.chat.id, msg.from.id).then(member => ['creator', 'administrator'].includes(member.status)))) {
      return bot.sendMessage(msg.chat.id, '🚫 Sorry bestie! This command is for admins only! 🚫')
        .catch(error => console.error('Error sending admin-only message:', error));
    }

    try {
      await command.execute(bot, msg, args, db);
    } catch (error) {
      console.error(chalk.red('Error executing command:'), error);
      await bot.sendMessage(msg.chat.id, '💔 Oopsie woopsie! Something went wrong! 💔')
        .catch(error => console.error('Error sending error message:', error));
    }
  });

  bot.on('callback_query', async (callbackQuery) => {
    try {
      const [commandName, ...args] = callbackQuery.data.split(':');
      const command = commands[commandName];

      if (command && command.handleCallback) {
        console.log(rainbowText(
          `[${new Date().toLocaleTimeString()}] CALLBACK - ${callbackQuery.from.username || callbackQuery.from.first_name}: ${callbackQuery.data}`
        ));
        
        await command.handleCallback(bot, callbackQuery, args, db);
      }
    } catch (error) {
      console.error(chalk.red('Error handling callback query:'), error);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '💔 Oopsie woopsie! Something went wrong! 💔',
        show_alert: true
      }).catch(err => console.error('Error sending callback error message:', err));
    }
  });

  bot.on('new_chat_members', async (msg) => {
    const chatId = msg.chat.id;
    const groupName = msg.chat.title;
    const memberCount = await bot.getChatMemberCount(chatId);

    for (const newMember of msg.new_chat_members) {
      await welcome.execute(bot, newMember, groupName, memberCount)
        .catch(error => console.error('Error executing welcome:', error));
    }
  });

  bot.on('left_chat_member', async (msg) => {
    const chatId = msg.chat.id;
    const groupName = msg.chat.title;
    const memberCount = await bot.getChatMemberCount(chatId);

    await goodbye.execute(bot, msg.left_chat_member, groupName, memberCount)
      .catch(error => console.error('Error executing goodbye:', error));
  });

  bot.on('left_chat_participant', async (msg) => {
    if (msg.left_chat_participant.id === bot.me.id) {
      const groupId = msg.chat.id;
      const groupName = msg.chat.title;
      const kickedBy = msg.from.username || msg.from.first_name || 'Unknown user';

      console.log(chalk.red.bold(fancyBox(`🚨 BOT KICKED FROM GROUP 🚨`)));
      console.log(chalk.yellow(`Group ID: ${groupId}`));
      console.log(chalk.yellow(`Group Name: ${groupName}`));
      console.log(chalk.yellow(`Kicked by: ${kickedBy}`));
      console.log(chalk.yellow(`Time: ${new Date().toLocaleString()}`));

      try {
        await db.collection('groups').updateOne(
          { groupId: groupId },
          { $set: { active: false, kickedAt: new Date(), kickedBy: kickedBy } }
        );
      } catch (error) {
        console.error(chalk.red('Error updating database after being kicked:'), error);
      }
    }
  });

  console.log(fancyBox('✨ Bot is slaying and ready to serve! ✨'));
  console.log(rainbowText('\n=== Made with 💖 by Hridoy! ===\n'));
}

// Start the bot and handle any errors
startBot().catch(error => {
  console.error(chalk.red.bold(fancyBox('💔 Fatal error occurred! 💔')));
  console.error(error);
  process.exit(1);
});

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red.bold(fancyBox('🚨 Unhandled Rejection at: 🚨')));
  console.error(promise);
  console.error(chalk.red.bold('Reason:'));
  console.error(reason);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red.bold(fancyBox('🚨 Uncaught Exception: 🚨')));
  console.error(error);
});