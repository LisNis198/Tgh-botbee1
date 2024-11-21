const axios = require('axios');

module.exports = {
  name: 'ai',
  adminOnly: false,
  ownerOnly: false,
  category: 'AI',
  description: 'Get AI-generated responses',
  guide: 'Use /ai followed by your query',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length === 0) {
      return bot.sendMessage(chatId, 'Please provide a query after /ai');
    }

    const query = args.join(' ');
    const apiUrl = `https://api.nexalo.xyz/gemini?text=${encodeURIComponent(query)}&api=na_Z21SSP93HR0123QO`;

    try {
      const searchingMessage = await bot.sendMessage(chatId, 'Searching...');

      await bot.editMessageText('Sending...', {
        chat_id: chatId,
        message_id: searchingMessage.message_id
      });

      const response = await axios.get(apiUrl);
      let aiResponse = response.data.response;

      // Check if the response is a JSON string and parse it if necessary
      try {
        const parsedResponse = JSON.parse(aiResponse);
        aiResponse = parsedResponse.response || parsedResponse;
      } catch (parseError) {
        // If parsing fails, assume it's already a string
      }

      // Remove backticks if present
      aiResponse = aiResponse.replace(/^```[\s\S]*?```$/gm, '').trim();

      await bot.editMessageText(aiResponse, {
        chat_id: chatId,
        message_id: searchingMessage.message_id,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error('Error in ai command:', error);
      await bot.sendMessage(chatId, 'An error occurred while processing your request. Please try again later.');
    }
  }
};