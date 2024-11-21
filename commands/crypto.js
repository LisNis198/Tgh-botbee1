const axios = require('axios');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const priceHistory = new Map();

module.exports = {
  name: 'crypto',
  adminOnly: false,
  ownerOnly: false,
  category: 'Finance',
  description: 'Track cryptocurrency prices',
  guide: 'Use /crypto <coin> to get price info, or /crypto chart <coin> for a price chart',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide a cryptocurrency name. Usage: /crypto <coin> or /crypto chart <coin>');
    }

    const isChart = args[0].toLowerCase() === 'chart';
    const coin = isChart ? args[1].toLowerCase() : args[0].toLowerCase();

    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`);
      
      if (!response.data[coin]) {
        return bot.sendMessage(chatId, 'Cryptocurrency not found. Please check the name and try again.');
      }

      const price = response.data[coin].usd;
      const change24h = response.data[coin].usd_24h_change;

      // Update price history
      if (!priceHistory.has(coin)) {
        priceHistory.set(coin, []);
      }
      priceHistory.get(coin).push({ price, timestamp: Date.now() });
      if (priceHistory.get(coin).length > 24) {
        priceHistory.get(coin).shift();
      }

      if (isChart) {
        const chartImage = await createPriceChart(coin, priceHistory.get(coin));
        await bot.sendPhoto(chatId, chartImage, { caption: `24-hour price chart for ${coin.toUpperCase()}` });
      } else {
        const message = `
💰 ${coin.toUpperCase()} Price:
$${price.toFixed(2)} USD
24h Change: ${change24h.toFixed(2)}%
`;
        await bot.sendMessage(chatId, message);
      }
    } catch (error) {
      console.error('Error in crypto command:', error);
      await bot.sendMessage(chatId, 'An error occurred while fetching cryptocurrency data. Please try again later.');
    }
  }
};

async function createPriceChart(coin, priceData) {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(0, 0, 800, 400);

  // Draw price line
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.beginPath();

  const maxPrice = Math.max(...priceData.map(d => d.price));
  const minPrice = Math.min(...priceData.map(d => d.price));

  priceData.forEach((data, index) => {
    const x = (index / (priceData.length - 1)) * 780 + 10;
    const y = 390 - ((data.price - minPrice) / (maxPrice - minPrice)) * 380;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw labels
  ctx.font = '20px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${coin.toUpperCase()} 24-hour Price Chart`, 10, 30);
  ctx.fillText(`$${minPrice.toFixed(2)}`, 10, 390);
  ctx.fillText(`$${maxPrice.toFixed(2)}`, 10, 30);

  // Save canvas to file
  const fileName = `crypto_chart_${coin}_${Date.now()}.png`;
  const filePath = path.join(__dirname, '..', 'temp', fileName);
  const out = fs.createWriteStream(filePath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  return new Promise((resolve, reject) => {
    out.on('finish', () => resolve(filePath));
    out.on('error', reject);
  });
}