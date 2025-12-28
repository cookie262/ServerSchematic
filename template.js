const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkCooldown } = require('../utils/rateLimiter');
const UIHandler = require('../handlers/uiHandler');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('template')
    .setDescription('Manage server templates')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const userId = interaction.user.id;
    const command = 'template';
    const cooldownSeconds = parseInt(process.env.COMMAND_COOLDOWN) || 60;

    if (!checkCooldown(userId, command, cooldownSeconds)) {
      const remainingTime = Math.ceil((cooldownSeconds * 1000 - (Date.now() - require('../utils/rateLimiter').rateLimiter.get(`${userId}-${command}`))) / 1000);
      return await interaction.reply({
        content: `⏰ Please wait ${remainingTime} seconds before using this command again.`,
        ephemeral: true,
      });
    }

    // Check if user is server owner or admin
    if (interaction.user.id !== interaction.guild.ownerId && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return await interaction.reply({
        content: '❌ You must be the server owner or have administrator permissions to use this command.',
        ephemeral: true,
      });
    }

    // Check bot permissions
    const botMember = interaction.guild.members.me;
    const requiredPermissions = [
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ViewChannel,
    ];

    const missingPermissions = requiredPermissions.filter(perm => !botMember.permissions.has(perm));

    if (missingPermissions.length > 0) {
      const permNames = missingPermissions.map(perm => PermissionFlagsBits[perm]).join(', ');
      return await interaction.reply({
        content: `❌ The bot is missing the following permissions: ${permNames}`,
        ephemeral: true,
      });
    }

    const embed = UIHandler.createMainEmbed();
    const buttons = UIHandler.createMainButtons();

    await interaction.reply({ embeds: [embed], components: [buttons] });
  },
};
