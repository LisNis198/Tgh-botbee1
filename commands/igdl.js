const axios = require('axios');

module.exports = {
  name: 'igdl',
  adminOnly: false,
  ownerOnly: false,
  category: 'Media',
  description: 'Download Instagram video',
  guide: 'Use /igdl followed by the Instagram video URL',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide an Instagram video URL after /igdl');
    }

    const instagramUrl = args[0];
    const apiUrl = `https://videoig.onrender.com/igvideo=${encodeURIComponent(instagramUrl)}`;

    try {
      // Send a "processing" message
      const processingMessage = await bot.sendMessage(chatId, 'Processing your request...');

      // Fetch the video URL from the API
      const response = await axios.get(apiUrl);
      const videoUrl = response.data.video_url;

      if (!videoUrl) {
        throw new Error('Video URL not found in the API response');
      }

      // Update the processing message
      await bot.editMessageText('Downloading and sending the video...', {
        chat_id: chatId,
        message_id: processingMessage.message_id
      });

      // Send the video
      await bot.sendVideo(chatId, videoUrl, {
        caption: 'Here\'s your Instagram video!'
      });

      // Delete the processing message
      await bot.deleteMessage(chatId, processingMessage.message_id);

    } catch (error) {
      console.error('Error in igdl command:', error);
      let errorMessage = 'An error occurred while processing your request.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += ` Status: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += ' No response received from the server.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += ` ${error.message}`;
      }

      await bot.sendMessage(chatId, errorMessage + ' Please try again later or check the URL.');
    }
  }
};