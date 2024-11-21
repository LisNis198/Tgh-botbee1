const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'namaj',
  adminOnly: false,
  ownerOnly: false,
  category: 'Religion',
  description: 'Get prayer times for a city',
  guide: 'Use /namaj [city name] to get prayer times',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide a city name after /namaj');
    }

    const city = args.join(' ');
    const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Bangladesh&method=1`;

    try {
      const response = await axios.get(apiUrl);
      const prayerTimes = response.data.data.timings;
      const date = response.data.data.date.readable;
      const hijriDate = response.data.data.date.hijri.date;

      // Create canvas
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext('2d');

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#87CEEB');    // Light blue
      gradient.addColorStop(0.5, '#B19CD9');  // Light purple
      gradient.addColorStop(1, '#FFB6C1');    // Light pink
      
      // Fill background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add decorative elements
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(400, 300, 100 + i * 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Add semi-transparent overlay for better text readability
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

      // Draw border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Set up text styles
      ctx.textAlign = 'center';
      
      // Draw title
      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = '#1A237E';  // Dark blue
      ctx.fillText(`Prayer Times - ${city}`, 400, 100);

      // Draw dates
      ctx.font = '20px Arial';
      ctx.fillStyle = '#303F9F';  // Slightly lighter blue
      ctx.fillText(`${date} | ${hijriDate}`, 400, 140);

      // Draw prayer times
      const prayers = {
        Fajr: 'Fajr',
        Sunrise: 'Sunrise',
        Dhuhr: 'Dhuhr',
        Asr: 'Asr',
        Maghrib: 'Maghrib',
        Isha: 'Isha'
      };

      let startY = 200;
      ctx.font = 'bold 28px Arial';
      
      Object.entries(prayers).forEach(([key, label], index) => {
        const time = prayerTimes[key];
        const y = startY + index * 60;
        
        // Draw time box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(250, y - 25, 300, 40);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeRect(250, y - 25, 300, 40);

        // Draw text
        ctx.fillStyle = '#1A237E';  // Dark blue
        ctx.fillText(`${label}: ${time}`, 400, y);
      });

      // Save the canvas to a file
      const fileName = `prayer_times_${Date.now()}.png`;
      const filePath = path.join(__dirname, '..', 'temp', fileName);
      
      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const out = fs.createWriteStream(filePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      await new Promise((resolve, reject) => {
        out.on('finish', resolve);
        out.on('error', reject);
      });

      await bot.sendPhoto(chatId, filePath, {
        caption: `🕌 Prayer Times for ${city}\n📅 ${date}\n📅 ${hijriDate}`
      });

      // Clean up: delete the temporary file
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error('Error in namaj command:', error);
      await bot.sendMessage(chatId, 'An error occurred while fetching prayer times. Please try again later.');
    }
  }
};