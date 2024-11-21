const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'fbdl',
  adminOnly: false,
  ownerOnly: false,
  category: 'Utilities',
  description: 'Download Facebook video',
  guide: 'Use /fbdl followed by the Facebook video URL to download',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    // Check if the user provided a URL
    if (args.length === 0) {
      return bot.sendMessage(chatId, "Please provide a Facebook video URL.");
    }

    // Show a "Please wait" message
    await bot.sendMessage(chatId, "Please wait, fetching your video...");

    const videoUrl = args.join(' ');
    const apiUrl = `https://api.nexalo.xyz/fbdl?url=${encodeURIComponent(videoUrl)}&api=na_Z21SSP93HR0123QO`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        const videoTitle = response.data.title;
        const videoLink = response.data.links["Download High Quality"];

        // Define the path for saving the video file
        const tempDir = path.resolve(__dirname, 'temp');
        const videoPath = path.join(tempDir, `${chatId}_video.mp4`);

        // Ensure the temp directory exists
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Download the video file
        const videoFile = fs.createWriteStream(videoPath);

        https.get(videoLink, (downloadStream) => {
          downloadStream.pipe(videoFile);
          videoFile.on('finish', async () => {
            videoFile.close();

            // Send the video file with the title as caption
            await bot.sendVideo(chatId, videoPath, { caption: videoTitle });

            // Delete the local file after sending
            fs.unlink(videoPath, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          });
        });
      } else {
        await bot.sendMessage(chatId, "Could not fetch the video. Please check the URL and try again.");
      }
    } catch (error) {
      console.error('Error in fbdl command:', error);
      await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
    }
  }
};
