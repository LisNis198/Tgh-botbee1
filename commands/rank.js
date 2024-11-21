const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

// Define experience levels
const levels = [
  { name: "Novice", minXP: 0 },
  { name: "Apprentice", minXP: 100 },
  { name: "Adept", minXP: 500 },
  { name: "Expert", minXP: 1000 },
  { name: "Master", minXP: 5000 }
];

// Main rank command function
async function rankCommand(bot, msg, args, db) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  try {
    const user = await db.collection('users').findOne({ userId });

    if (!user) {
      return bot.sendMessage(chatId, 'You haven\'t earned any XP yet. Start chatting to gain XP!');
    }

    const xp = user.xp || 0;
    const currentLevel = levels.filter(level => level.minXP <= xp).pop();
    const nextLevel = levels.find(level => level.minXP > xp) || levels[levels.length - 1];
    const progress = (xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP);

    const rankCard = await createRankCard(user, currentLevel, nextLevel, progress);

    bot.sendPhoto(chatId, rankCard, { caption: `Your current rank: ${currentLevel.name}\nXP: ${xp}/${nextLevel.minXP}` });
  } catch (error) {
    console.error('Error in rank command:', error);
    bot.sendMessage(chatId, 'An error occurred while checking your rank.');
  }
}

// Enhanced createRankCard function
async function createRankCard(user, currentLevel, nextLevel, progress) {
  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 800, 250);
  gradient.addColorStop(0, '#1a1c2c');
  gradient.addColorStop(0.5, '#222436');
  gradient.addColorStop(1, '#1a1c2c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 250);

  // Add decorative elements
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 5; i++) {
    ctx.moveTo(Math.random() * 800, Math.random() * 250);
    ctx.lineTo(Math.random() * 800, Math.random() * 250);
  }
  ctx.stroke();

  // User avatar with glowing effect
  let avatar;
  try {
    const response = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUserProfilePhotos?user_id=${user.userId}`);
    if (response.data.result.photos.length > 0) {
      const fileId = response.data.result.photos[0][0].file_id;
      const fileResponse = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${fileId}`);
      const filePath = fileResponse.data.result.file_path;
      avatar = await loadImage(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`);
    }
  } catch (error) {
    console.error('Error loading avatar:', error);
  }

  // Avatar glow effect
  ctx.shadowColor = '#7289DA';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(120, 125, 60, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Draw avatar
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 125, 55, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 65, 70, 110, 110);
    ctx.restore();
  }

  // Username with gradient
  const usernameGradient = ctx.createLinearGradient(200, 70, 600, 70);
  usernameGradient.addColorStop(0, '#ffffff');
  usernameGradient.addColorStop(1, '#7289DA');
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = usernameGradient;
  ctx.fillText(user.username || 'Unknown User', 200, 90);

  // Rank and Level with modern styling
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${currentLevel.name}`, 200, 130);
  ctx.font = '20px Arial';
  ctx.fillStyle = '#7289DA';
  ctx.fillText(`Level ${levels.indexOf(currentLevel) + 1}`, 200, 160);

  // Enhanced XP Bar
  // Bar background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(200, 180, 550, 30, 15);
  ctx.fill();

  // Progress bar with gradient
  const progressGradient = ctx.createLinearGradient(200, 180, 750, 180);
  progressGradient.addColorStop(0, '#7289DA');
  progressGradient.addColorStop(1, '#5865F2');
  ctx.fillStyle = progressGradient;
  ctx.beginPath();
  ctx.roundRect(200, 180, 550 * progress, 30, 15);
  ctx.fill();

  // Add shine effect to progress bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(200, 180, 550 * progress, 15, [15, 15, 0, 0]);
  ctx.fill();

  // XP Text with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  const xpText = `${user.xp}/${nextLevel.minXP} XP`;
  const xpTextWidth = ctx.measureText(xpText).width;
  ctx.fillText(xpText, 475 - (xpTextWidth / 2), 200);
  ctx.shadowBlur = 0;

  // Add subtle pattern overlay
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < 800; i += 4) {
    for (let j = 0; j < 250; j += 4) {
      if (Math.random() > 0.5) {
        ctx.fillRect(i, j, 2, 2);
      }
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  return canvas.toBuffer();
}

// Function to update user XP
async function updateUserXP(db, userId, username, xpGain = 1) {
  const result = await db.collection('users').findOneAndUpdate(
    { userId },
    { 
      $inc: { xp: xpGain },
      $set: { username: username }
    },
    { upsert: true, returnDocument: 'after' }
  );

  const user = result.value;
  const currentLevel = levels.filter(level => level.minXP <= user.xp).pop();
  const previousLevel = levels[levels.indexOf(currentLevel) - 1];

  if (previousLevel && user.xp - xpGain < currentLevel.minXP) {
    return { leveledUp: true, newLevel: currentLevel.name };
  }

  return { leveledUp: false };
}

// Export the module
module.exports = {
  name: 'rank',
  adminOnly: false,
  ownerOnly: false,
  category: 'Ranking',
  description: 'Check your rank and XP',
  guide: 'Use /rank to see your current rank and XP',
  execute: rankCommand,
  updateUserXP: updateUserXP
};