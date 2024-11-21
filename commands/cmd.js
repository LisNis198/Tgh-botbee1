const axios = require('axios');

module.exports = {
    name: 'cmd',
    adminOnly: false,
    ownerOnly: false,
    category: 'General',
    description: 'Search, view details, or download commands.',
    guide: '/cmd search <query> - Searches commands\n' +
           '/cmd details <id> - Shows command details\n' +
           '/cmd download <id> - Downloads command code',
    execute: async (bot, msg, args) => {
        if (args.length < 2) {
            return bot.sendMessage(msg.chat.id, "Please use the correct format: /cmd <action> <query or id>.");
        }

        const action = args[0];
        const query = args.slice(1).join(" ");
        let apiUrl = `https://api.nexalo.xyz/command-store?action=${action}&query=${query}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === 'success') {
                if (action === 'search') {
                    // Format search results with ID
                    let message = data.data.map(item => 
                        `Title: ${item.title} (ID: ${item.id})\nDescription: ${item.description.split('\n').slice(0, 2).join('\n')}...`
                    ).join('\n\n');
                    bot.sendMessage(msg.chat.id, message || 'No results found.');
                
                } else if (action === 'details') {
                    const item = data.data;

                    // Send the image with the title as the caption
                    if (item.image) {
                        await bot.sendPhoto(msg.chat.id, item.image, { caption: item.title });
                    }

                    // Send the description separately
                    bot.sendMessage(msg.chat.id, item.description);

                } else if (action === 'download') {
                    bot.sendMessage(msg.chat.id, `Command Code:\n${data.code}`);
                }
            } else {
                bot.sendMessage(msg.chat.id, data.message);
            }
        } catch (error) {
            console.error(error);
            bot.sendMessage(msg.chat.id, "An error occurred while fetching data from the API.");
        }
    }
};
