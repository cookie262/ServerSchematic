const { PermissionsBitField, ChannelType } = require('discord.js');
const { applyPermissions } = require('../utils/permissionMapper');
const logger = require('../utils/logger');

class ImportManager {
  static async importServer(guild, exportData, options) {
    const summary = { roles: 0, channels: 0, permissions: 0 };

    try {
      // Import roles if selected
      if (options === 'everything' || options === 'roles') {
        await this.importRoles(guild, exportData.roles);
        summary.roles = exportData.roles.length;
      }

      // Import channels if selected
      if (options === 'everything' || options === 'channels') {
        await this.importChannels(guild, exportData.channels);
        summary.channels = exportData.channels.length;
      }

      // Apply permissions if selected
      if (options === 'everything' || options === 'permissions') {
        await this.applyPermissions(guild, exportData);
        summary.permissions = 1; // Simplified count
      }

      logger.info(`Server import completed for ${guild.name} (${guild.id})`);
      return summary;
    } catch (error) {
      logger.error('Error importing server:', error);
      throw error;
    }
  }

  static async importRoles(guild, rolesData) {
    for (const roleData of rolesData.reverse()) { // Create from lowest to highest
      try {
        const existingRole = guild.roles.cache.find(role => role.name === roleData.name);
        if (existingRole) {
          logger.warn(`Role ${roleData.name} already exists, skipping.`);
          continue;
        }

        const permissions = new PermissionsBitField(roleData.permissions);

        await guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          hoist: roleData.hoist,
          mentionable: roleData.mentionable,
          permissions: permissions,
          position: roleData.position,
        });

        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Error creating role ${roleData.name}:`, error);
      }
    }
  }

  static async importChannels(guild, channelsData) {
    for (const channelData of channelsData) {
      try {
        if (channelData.type === 4) { // Category
          const category = await guild.channels.create({
            name: channelData.name,
            type: ChannelType.GuildCategory,
            position: channelData.position,
          });

          // Create child channels
          for (const childData of channelData.children || []) {
            await this.createChannel(guild, childData, category.id);
          }
        } else {
          await this.createChannel(guild, channelData);
        }

        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error(`Error creating channel ${channelData.name}:`, error);
      }
    }
  }

  static async createChannel(guild, channelData, parentId = null) {
    const existingChannel = guild.channels.cache.find(channel => channel.name === channelData.name);
    if (existingChannel) {
      logger.warn(`Channel ${channelData.name} already exists, skipping.`);
      return;
    }

    let channelOptions = {
      name: channelData.name,
      type: channelData.type,
      position: channelData.position,
      parent: parentId,
    };

    if (channelData.type === 2) { // Voice channel
      channelOptions.bitrate = channelData.bitrate;
      channelOptions.userLimit = channelData.userLimit;
    } else if (channelData.type === 15) { // Forum channel
      channelOptions.availableTags = channelData.availableTags;
    }

    const channel = await guild.channels.create(channelOptions);

    // Apply permission overwrites
    if (channelData.permissionOverwrites && channelData.permissionOverwrites.length > 0) {
      await applyPermissions(channel, channelData.permissionOverwrites);
    }
  }

  static async applyPermissions(guild, exportData) {
    // This is a simplified implementation
    // In a real scenario, you'd need to map the imported roles/channels to existing ones
    logger.info('Applying permissions... (simplified implementation)');
    // Implementation would involve updating permission overwrites for all channels
  }
}

module.exports = ImportManager;
