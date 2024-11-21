const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

module.exports = {
  name: 'say',
  aliases: ['tts'],
  adminOnly: false,
  ownerOnly: false,
  category: 'Utility',
  description: 'Convert text to speech in various languages',
  guide: 'Use /say <text> for Bangla TTS or /tts <language_code> <text> for other languages',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    let lang = 'bn'; // Default language is Bangla
    let text;

    if (msg.text.startsWith('/tts')) {
      if (args.length < 2) {
        return bot.sendMessage(chatId, 'Please provide a language code and text. Usage: /tts <language_code> <text>');
      }
      lang = args[0].toLowerCase();
      text = args.slice(1).join(' ');
    } else {
      if (args.length === 0) {
        return bot.sendMessage(chatId, 'Please provide some text. Usage: /say <text>');
      }
      text = args.join(' ');
    }

    try {
      const processingMessage = await bot.sendMessage(chatId, "🎙️ Generating audio...");

      const audioBuffer = await generateTTS(text, lang);
      const tempFilePath = path.join(__dirname, 'temp_audio.mp3');
      await writeFileAsync(tempFilePath, audioBuffer);

      await bot.deleteMessage(chatId, processingMessage.message_id);
      await bot.sendVoice(chatId, tempFilePath, {
        caption: `🗣️ TTS in ${lang.toUpperCase()}:\n${text}`,
        reply_to_message_id: msg.message_id
      });

      // Clean up the temporary file
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });

    } catch (error) {
      console.error('Error in TTS command:', error);
      await bot.sendMessage(chatId, "Sorry, I couldn't generate the audio. Please try again later or check the language code.");
    }
  }
};

async function generateTTS(text, lang) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw new Error('Failed to generate TTS audio');
  }
}