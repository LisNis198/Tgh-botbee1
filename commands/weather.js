const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const OPENWEATHERMAP_API_KEY = '7022eb729652f41b705bc65d69251dd3';

module.exports = {
  name: 'weather',
  adminOnly: false,
  ownerOnly: false,
  category: 'Utility',
  description: 'Get a stylish weather report for a city',
  guide: 'Use /weather <city name> to get the current weather',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide a city name. Usage: /weather <city name>');
    }

    const city = args.join(' ');
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const weatherData = await response.json();

      // Set up canvas
      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 800, 400);
      gradient.addColorStop(0, '#1e3c72');
      gradient.addColorStop(1, '#2a5298');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 400);

      // City name and country
      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${weatherData.name}, ${weatherData.sys.country}`, 400, 60);

      // Temperature
      ctx.font = 'bold 120px sans-serif';
      ctx.fillText(`${Math.round(weatherData.main.temp)}°C`, 400, 180);

      // Weather description
      ctx.font = '32px sans-serif';
      ctx.fillText(weatherData.weather[0].description, 400, 230);

      // Additional weather info
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Humidity: ${weatherData.main.humidity}%`, 50, 300);
      ctx.fillText(`Wind: ${weatherData.wind.speed} m/s`, 50, 340);
      ctx.fillText(`Pressure: ${weatherData.main.pressure} hPa`, 50, 380);

      ctx.textAlign = 'right';
      ctx.fillText(`Feels like: ${Math.round(weatherData.main.feels_like)}°C`, 750, 300);
      ctx.fillText(`Min: ${Math.round(weatherData.main.temp_min)}°C`, 750, 340);
      ctx.fillText(`Max: ${Math.round(weatherData.main.temp_max)}°C`, 750, 380);

      // Load and draw weather icon
      const iconUrl = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`;
      const icon = await loadImage(iconUrl);
      ctx.drawImage(icon, 350, 240, 100, 100);

      // Draw decorative elements
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 100);
      ctx.lineTo(750, 100);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(50, 250);
      ctx.lineTo(750, 250);
      ctx.stroke();

      // Draw sun or moon based on time of day
      const isDay = weatherData.weather[0].icon.includes('d');
      ctx.fillStyle = isDay ? '#FFD700' : '#F0F0F0';
      ctx.beginPath();
      ctx.arc(700, 80, 40, 0, Math.PI * 2);
      ctx.fill();

      if (!isDay) {
        ctx.fillStyle = '#1e3c72';
        ctx.beginPath();
        ctx.arc(680, 80, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add cloud effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      drawCloud(ctx, 100, 50, 70);
      drawCloud(ctx, 600, 100, 50);

      // Save and send image
      const fileName = `weather_${Date.now()}.png`;
      const filePath = path.join(__dirname, '..', 'temp', fileName);
      const out = fs.createWriteStream(filePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', async () => {
        await bot.sendPhoto(chatId, filePath, { caption: `Current weather in ${city}` });
        fs.unlinkSync(filePath);  // Clean up
      });

    } catch (error) {
      console.error('Error in weather command:', error);
      if (error.message.includes('404')) {
        await bot.sendMessage(chatId, 'City not found. Please check the spelling and try again.');
      } else {
        await bot.sendMessage(chatId, 'An error occurred while fetching the weather. Please try again later.');
      }
    }
  }
};

function drawCloud(ctx, x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(x + size * 0.4, y - size * 0.4, size * 0.4, Math.PI * 1, Math.PI * 2);
  ctx.arc(x + size * 0.8, y, size * 0.4, Math.PI * 1.5, Math.PI * 0.5);
  ctx.closePath();
  ctx.fill();
}