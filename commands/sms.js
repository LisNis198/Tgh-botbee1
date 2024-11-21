const axios = require('axios');

module.exports = {
  name: 'sms',
  adminOnly: false,
  ownerOnly: false,
  category: 'Utility',
  description: 'Send an SMS with the specified number and amount.',
  guide: 'Use /sms <amount> <number> to send an SMS (number must start with 01)',
  execute: async (bot, msg, args, db) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    // Ensure both amount and number are provided
    if (args.length < 2) {
      return bot.sendMessage(chatId, 'Please provide an amount and a number. Usage: /sms <amount> <number>');
    }

    // Parse the amount and number
    const amount = parseInt(args[0]);
    const number = args[1];

    // Validate number format (should start with 01)
    if (!/^01\d+$/.test(number)) {
      return bot.sendMessage(chatId, 'Invalid number format. The number must start with 01.');
    }

    const apiUrl = `https://api.nexalo.xyz/smsbomber?number=${number}&amount=${amount}&api=na_Z21SSP93HR0123QO`;

    // Check user balance and send SMS if sufficient
    const sendSMSRequest = async (retry = false) => {
      try {
        // Check user balance
        const user = await db.collection('users').findOne({ userId });
        if (!user || user.balance < 200) {
          return bot.sendMessage(chatId, 'Insufficient balance. You need at least 200 coins to send an SMS.');
        }

        // API call
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Check if any response has status as true
        const successResponse = data.responses.find(res => res.response.status === true);

        if (data.status === 'completed' && successResponse) {
          // Deduct 200 coins from user's balance
          await db.collection('users').updateOne(
            { userId },
            { $inc: { balance: -200 } }
          );

          // Send success message with response details
          bot.sendMessage(chatId, `SMS sent successfully to ${data.number}!\nMessage: ${successResponse.response.message}`);
        } else if (!successResponse && !retry) {
          // Retry once if no success response on the first attempt
          bot.sendMessage(chatId, 'Sending failed. Retrying...');
          await sendSMSRequest(true);
        } else {
          bot.sendMessage(chatId, 'Failed to send SMS after retrying. Please try again later.');
        }
      } catch (error) {
        console.error('Error in sms command:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request. Please try again later.');
      }
    };

    // Initial SMS request
    await sendSMSRequest();
  }
};
