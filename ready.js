const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);
    logger.info(`Bot is in ${client.guilds.cache.size} servers`);

    // Set bot status
    client.user.setPresence({
      activities: [{ name: '/template - Manage server templates', type: 0 }],
      status: 'online',
    });
  },
};
