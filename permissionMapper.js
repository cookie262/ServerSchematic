const { PermissionsBitField } = require('discord.js');

function mapPermissions(permissions) {
  return permissions.toArray();
}

function applyPermissions(channel, overwrites) {
  const permissionOverwrites = overwrites.map(overwrite => ({
    id: overwrite.id,
    allow: new PermissionsBitField(overwrite.allow),
    deny: new PermissionsBitField(overwrite.deny),
    type: overwrite.type,
  }));

  return channel.permissionOverwrites.set(permissionOverwrites);
}

module.exports = { mapPermissions, applyPermissions };
