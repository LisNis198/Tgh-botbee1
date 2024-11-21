const axios = require('axios');
const { Translate } = require('@google-cloud/translate').v2;

const translate = new Translate({ projectId: 'AIzaSyDxA9Fw75kRWL5iqRj00SZpmvfIX2llH8g' });

module.exports = {
  name: 'translate',
  adminOnly: false,
  ownerOnly: false,
  category: 'Utility',
  description: 'Translate text from one language to another',
  guide: 'Use /translate <target language> <text to translate>',
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    if (args.length < 2) {
      return bot.sendMessage(chatId, 'Please provide a target language and text to translate. Usage: /translate <target language> <text to translate>');
    }

    const targetLanguage = args[0].toLowerCase();
    const textToTranslate = args.slice(1).join(' ');

    try {
      // Detect source language
      const [detection] = await translate.detect(textToTranslate);
      const sourceLanguage = detection.language;

      // Translate text
      const [translation] = await translate.translate(textToTranslate, targetLanguage);

      // Get language names
      const [sourceLanguageName] = await translate.getLanguages(sourceLanguage);
      const [targetLanguageName] = await translate.getLanguages(targetLanguage);

      // Get pronunciation (if available)
      let pronunciation = '';
      try {
        const [pronunciationData] = await translate.translate(textToTranslate, {
          to: targetLanguage,
          format: 'text',
        });
        pronunciation = pronunciationData[1].transliteration || '';
      } catch (error) {
        console.error('Error getting pronunciation:', error);
      }

      const response = `
Translation from ${sourceLanguageName[0].name} to ${targetLanguageName[0].name}:

Original: ${textToTranslate}
Translated: ${translation}
${pronunciation ? `Pronunciation: ${pronunciation}` : ''}
`;

      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error in translate command:', error);
      await bot.sendMessage(chatId, 'An error occurred while translating. Please check the language code and try again.');
    }
  }
};