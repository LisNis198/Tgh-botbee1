const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

async function createWelcomeCard(member, groupName, memberCount) {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 800, 400);
  gradient.addColorStop(0, '#2E3440');
  gradient.addColorStop(1, '#4C566A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 400);

  // Add decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 400;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Load and draw user avatar
  let avatar;
  try {
    if (member.photo) {
      const response = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUserProfilePhotos?user_id=${member.id}`);
      if (response.data.result.photos.length > 0) {
        const fileId = response.data.result.photos[0][0].file_id;
        const fileResponse = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${fileId}`);
        const filePath = fileResponse.data.result.file_path;
        avatar = await loadImage(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`);
      }
    }
  } catch (error) {
    console.error('Error loading avatar:', error);
  }

  // If no avatar is available, load default avatar
  if (!avatar) {
    try {
      const defaultAvatarPath = path.join(__dirname, '..', 'assets', 'default-avatar.jpg');
      avatar = await loadImage(defaultAvatarPath);
    } catch (error) {
      console.error('Error loading default avatar:', error);
    }
  }

  // Draw avatar with glow effect
  ctx.save();
  ctx.shadowColor = '#81A1C1';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(400, 150, 80, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (avatar) {
    ctx.drawImage(avatar, 320, 70, 160, 160);
  }
  ctx.restore();

  // Draw avatar border
  ctx.strokeStyle = '#81A1C1';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(400, 150, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Welcome text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ECEFF4';
  ctx.font = 'bold 40px Arial';
  ctx.fillText('Welcome to', 400, 280);
  
  // Group name
  ctx.font = 'bold 45px Arial';
  ctx.fillStyle = '#88C0D0';
  ctx.fillText(groupName, 400, 330);

  // Member count
  ctx.font = '20px Arial';
  ctx.fillStyle = '#D8DEE9';
  ctx.fillText(`Member #${memberCount}`, 400, 370);

  // Username
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = '#A3BE8C';
  ctx.fillText(member.first_name || 'New Member', 400, 50);

  return canvas.toBuffer();
}

module.exports = {
  name: 'welcome',
  execute: async (bot, member, groupName, memberCount) => {
    try {
      const welcomeCard = await createWelcomeCard(member, groupName, memberCount);
      await bot.sendPhoto(member.chat.id, welcomeCard, {
        caption: `Welcome ${member.first_name} to ${groupName}! 🎉`
      });
    } catch (error) {
      console.error('Error in welcome event:', error);
    }
  }
};