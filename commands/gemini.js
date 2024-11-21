const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyCKB1g_N7GgP5xJKqo-W2nN9RLPBGsdcGI';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Store conversation history
const conversationHistory = new Map();

module.exports = {
  name: 'gemini',
  adminOnly: false,
  ownerOnly: false,
  category: 'AI',
  description: 'Interact with Gemini AI for text and image analysis',
  guide: 'Use /gemini <your question> or reply to an image with /gemini <your question>',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (args.length === 0 && !msg.reply_to_message) {
      return bot.sendMessage(chatId, 'Please provide a question or reply to an image with a question.');
    }

    let question = args.join(' ');
    let imageContent = null;

    // Check if the command is replying to a message with an image
    if (msg.reply_to_message && msg.reply_to_message.photo) {
      const fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
      const fileInfo = await bot.getFile(fileId);
      const imageBuffer = await downloadImage(fileInfo.file_path);
      imageContent = imageBuffer.toString('base64');
    }

    try {
      const history = conversationHistory.get(userId) || [];
      const response = await queryGemini(question, imageContent, history);

      // Update conversation history
      history.push({ role: 'user', parts: [{ text: question }] });
      history.push({ role: 'model', parts: [{ text: response }] });
      conversationHistory.set(userId, history.slice(-10)); // Keep last 10 messages

      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error in gemini command:', error);
      await bot.sendMessage(chatId, 'An error occurred while processing your request. Please try again later.');
    }
  }
};

async function queryGemini(question, imageContent, history) {
  const payload = {
    contents: [
      ...history,
      {
        role: 'user',
        parts: [
          { text: question },
          ...(imageContent ? [{ inline_data: { mime_type: 'image/jpeg', data: imageContent } }] : [])
        ]
      }
    ]
  };

  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error querying Gemini API:', error.response?.data || error.message);
    throw new Error('Failed to get a response from Gemini API');
  }
}

async function downloadImage(filePath) {
  const response = await axios.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`, {
    responseType: 'arraybuffer'
  });
  return Buffer.from(response.data, 'binary');
}