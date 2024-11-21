const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'sing',
  adminOnly: false,
  ownerOnly: false,
  category: 'Entertainment',
  description: 'Search and play music from YouTube',
  guide: 'Use /sing <song name> to search and play music',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    
    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide a song name. Usage: /sing <song name>');
    }

    const query = args.join(' ');
    const searchMessage = await bot.sendMessage(chatId, `🔎 Searching for "${query}"...`);

    try {
      const searchResponse = await axios.get(`https://api.nexalo.xyz/youtube-search.php?api=na_Z21SSP93HR0123QO&query=${encodeURIComponent(query)}`);
      
      if (searchResponse.data.status !== 200 || !searchResponse.data.result || searchResponse.data.result.length === 0) {
        await bot.deleteMessage(chatId, searchMessage.message_id);
        return bot.sendMessage(chatId, 'No results found. Please try a different search term.');
      }

      const results = searchResponse.data.result.slice(0, 3);
      const keyboard = results.map((result, index) => [
        { text: `Send No ${index + 1}: ${result.title}`, callback_data: `sing:${result.videoId}:${index + 1}` }
      ]);

      await bot.deleteMessage(chatId, searchMessage.message_id);
      await bot.sendMessage(chatId, 'Choose a song to play:', {
        reply_markup: {
          inline_keyboard: keyboard
        }
      });

    } catch (error) {
      console.error('Error in sing command:', error);
      await bot.deleteMessage(chatId, searchMessage.message_id);
      await bot.sendMessage(chatId, 'An error occurred while searching for the song. Please try again later.');
    }
  },
  
  handleCallback: async (bot, callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const [, videoId, index] = callbackQuery.data.split(':');
    const sendingMessage = await bot.sendMessage(chatId, `Fetching song ${index}...`);
    
    try {
      await bot.deleteMessage(chatId, messageId);
      const youtubeUrl = `https://youtube.com/watch?v=${videoId}`;
      const audioResponse = await axios.get(`https://api.nexalo.xyz/youtube-audio?api=na_Z21SSP93HR0123QO&url=${encodeURIComponent(youtubeUrl)}`);
      
      if (audioResponse.data.status !== 200 || !audioResponse.data.result) {
        throw new Error('Invalid audio response');
      }

      const audioResult = audioResponse.data.result;
      
      // Download the audio file
      const audioBuffer = await axios.get(audioResult.audio, { responseType: 'arraybuffer' });
      
      // Create a temporary file
      const tempFilePath = path.join(__dirname, `temp_${Date.now()}.mp3`);
      fs.writeFileSync(tempFilePath, audioBuffer.data);

      // Send the audio as a file
      await bot.sendAudio(chatId, tempFilePath, {
        caption: `🎵 ${audioResult.title}\n👤 ${audioResult.channel_name}\n⏱ ${audioResult.duration}`,
        title: audioResult.title,
        performer: audioResult.channel_name,
        duration: audioResult.duration
      });

      // Delete the temporary file
      fs.unlinkSync(tempFilePath);

    } catch (error) {
      console.error('Error in sing callback:', error);
      let errorMessage = 'An error occurred while fetching the audio. Please try again later.';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.status === 400) {
          errorMessage = 'Unable to process the audio. The file might be too large or in an unsupported format.';
        }
      }
      
      await bot.sendMessage(chatId, errorMessage);
    } finally {
      await bot.deleteMessage(chatId, sendingMessage.message_id);
    }
  }
};