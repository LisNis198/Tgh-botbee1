const { createCanvas, loadImage } = require('canvas');

// Bot start time
const botStartTime = Date.now();

// Function to format uptime
function formatUptime(uptime) {
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Function to generate random IP
function generateRandomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
}

// Function to generate random server name
function generateRandomServerName() {
  const adjectives = ['Swift', 'Powerful', 'Efficient', 'Robust', 'Secure'];
  const nouns = ['Nexus', 'Forge', 'Citadel', 'Oasis', 'Bastion'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

// Function to create uptime card
async function createUptimeCard() {
  const canvas = createCanvas(600, 300);
  const ctx = canvas.getContext('2d');

  // Enhanced gradient background
  const gradient = ctx.createLinearGradient(0, 0, 600, 300);
  gradient.addColorStop(0, '#1a237e');  // Deep blue
  gradient.addColorStop(0.5, '#4a148c');  // Deep purple
  gradient.addColorStop(1, '#311b92');  // Indigo
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 300);

  // Add some "sparkle" to the background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 600;
    const y = Math.random() * 300;
    const radius = Math.random() * 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Set up text styles
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 5;

  // Uptime
  const uptime = formatUptime(Date.now() - botStartTime);
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Uptime:', 50, 70);
  ctx.font = '24px Arial';
  ctx.fillText(uptime, 50, 110);

  // Random Ping
  const ping = Math.floor(Math.random() * 990) + 10;  // 10 to 999
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Ping:', 50, 160);
  ctx.font = '24px Arial';
  ctx.fillText(`${ping} ms`, 50, 200);

  // Random IP
  const ip = generateRandomIP();
  ctx.font = 'bold 28px Arial';
  ctx.fillText('IP:', 350, 70);
  ctx.font = '24px Arial';
  ctx.fillText(ip, 350, 110);

  // Server Name
  const serverName = generateRandomServerName();
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Server:', 350, 160);
  ctx.font = '24px Arial';
  ctx.fillText(serverName, 350, 200);

  // Decorative line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 240);
  ctx.lineTo(550, 240);
  ctx.stroke();

  // Footer text
  ctx.font = 'italic 18px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('Bot Status Information', 300, 280);

  return canvas.toBuffer();
}

// Main uptime command function
async function uptimeCommand(bot, msg) {
  const chatId = msg.chat.id;

  try {
    const uptimeCard = await createUptimeCard();
    bot.sendPhoto(chatId, uptimeCard, { caption: 'Bot Status Information' });
  } catch (error) {
    console.error('Error in uptime command:', error);
    bot.sendMessage(chatId, 'An error occurred while checking the bot status.');
  }
}

module.exports = {
  name: 'uptime',
  adminOnly: false,
  ownerOnly: false,
  category: 'Bot Info',
  description: 'Check the bot\'s status',
  guide: 'Use /uptime to see the bot\'s current status information',
  execute: uptimeCommand
};