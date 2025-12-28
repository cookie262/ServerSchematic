const fs = require('fs');
const path = require('path');
const { mapPermissions } = require('../utils/permissionMapper');
const logger = require('../utils/logger');

class ExportManager {
  static async exportServer(guild) {
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        serverId: guild.id,
        roles: [],
        channels: [],
      };

      // Export roles
      const roles = guild.roles.cache
        .filter(role => !role.managed && role.id !== guild.id) // Exclude @everyone and managed roles
        .sort((a, b) => b.position - a.position); // Sort by position descending

      for (const role of roles.values()) {
        exportData.roles.push({
          id: role.id,
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          mentionable: role.mentionable,
          permissions: mapPermissions(role.permissions),
          position: role.position,
        });
      }

      // Export channels
      const categories = guild.channels.cache
        .filter(channel => channel.type === 4) // Category channels
        .sort((a, b) => a.position - b.position);

      for (const category of categories.values()) {
        const categoryData = {
          id: category.id,
          name: category.name,
          type: category.type,
          position: category.position,
          permissionOverwrites: category.permissionOverwrites.cache.map(overwrite => ({
            id: overwrite.id,
            type: overwrite.type,
            allow: mapPermissions(overwrite.allow),
            deny: mapPermissions(overwrite.deny),
          })),
          children: [],
        };

        const children = guild.channels.cache
          .filter(channel => channel.parentId === category.id)
          .sort((a, b) => a.position - b.position);

        for (const child of children.values()) {
          categoryData.children.push({
            id: child.id,
            name: child.name,
            type: child.type,
            position: child.position,
            permissionOverwrites: child.permissionOverwrites.cache.map(overwrite => ({
              id: overwrite.id,
              type: overwrite.type,
              allow: mapPermissions(overwrite.allow),
              deny: mapPermissions(overwrite.deny),
            })),
            ...(child.type === 2 && { bitrate: child.bitrate, userLimit: child.userLimit }), // Voice channel specifics
            ...(child.type === 15 && { availableTags: child.availableTags }), // Forum channel specifics
          });
        }

        exportData.channels.push(categoryData);
      }

      // Export channels without categories
      const uncategorizedChannels = guild.channels.cache
        .filter(channel => !channel.parentId && channel.type !== 4)
        .sort((a, b) => a.position - b.position);

      for (const channel of uncategorizedChannels.values()) {
        exportData.channels.push({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          position: channel.position,
          permissionOverwrites: channel.permissionOverwrites.cache.map(overwrite => ({
            id: overwrite.id,
            type: overwrite.type,
            allow: mapPermissions(overwrite.allow),
            deny: mapPermissions(overwrite.deny),
          })),
          ...(channel.type === 2 && { bitrate: channel.bitrate, userLimit: channel.userLimit }),
          ...(channel.type === 15 && { availableTags: channel.availableTags }),
        });
      }

      // Save to file
      const fileName = `${guild.id}.json`;
      const filePath = path.join(__dirname, '../../exports', fileName);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

      logger.info(`Server ${guild.name} (${guild.id}) exported successfully.`);
      return exportData;
    } catch (error) {
      logger.error('Error exporting server:', error);
      throw error;
    }
  }
}

module.exports = ExportManager;
