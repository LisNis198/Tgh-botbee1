const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const OPENWEATHERMAP_API_KEY = '7022eb729652f41b705bc65d69251dd3';

module.exports = {
  name: 'forecast',
  adminOnly: false,
  ownerOnly: false,
  category: 'Utility',
  description: 'Get a 5-day weather forecast for a city',
  guide: 'Use /forecast <city name> to get the weather forecast',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide a city name. Usage: /forecast <city name>');
    }

    const city = args.join(' ');
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;

    try {
      const response = await axios.get(apiUrl);
      const forecastData = response.data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#4682B4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 400);

      // Draw city name
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(city, 400, 50);

      // Draw forecast data
      ctx.font = '20px Arial';
      forecastData.forEach((day, index) => {
        const x = 100 + index * 150;
        const date = new Date(day.dt * 1000);
        const temp = Math.round(day.main.temp);
        const humidity = day.main.humidity;
        const weather = day.weather[0].main;

        ctx.fillText(date.toLocaleDateString(), x, 100);
        ctx.fillText(`${temp}°C`, x, 130);
        ctx.fillText(`${humidity}%`, x, 160);
        ctx.fillText(weather, x, 190);

        // Load and draw weather icon
        loadImage(`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`).then((image) => {
          ctx.drawImage(image, x - 25, 200, 50, 50);
        });
      });

      // Save canvas to file
      const fileName = `forecast_${Date.now()}.png`;
      const filePath = path.join(__dirname, '..', 'temp', fileName);
      const out = fs.createWriteStream(filePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', async () => {
        await bot.sendPhoto(chatId, filePath, { caption: `5-day forecast for ${city}` });
        fs.unlinkSync(filePath);
      });

    } catch (error) {
      console.error('Error in forecast command:', error);
      await bot.sendMessage(chatId, 'An error occurred while fetching the weather forecast. Please try again later.');
    }
  }
};