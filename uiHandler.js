const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ExportManager = require('../managers/exportManager');
const ImportManager = require('../managers/importManager');
const logger = require('../utils/logger');

class UIHandler {
  static createMainEmbed() {
    return new EmbedBuilder()
      .setTitle('🛠️ Server Template Manager')
      .setDescription('Manage your Discord server templates with ease. Choose an action below.')
      .setColor(0x5865f2)
      .addFields(
        { name: '📤 Export Server', value: 'Save your current server structure as a template.', inline: true },
        { name: '📥 Import Template', value: 'Apply a saved template to this server.', inline: true }
      )
      .setFooter({ text: 'Server Schematic Bot • Professional Discord Tools' });
  }

  static createMainButtons() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('export_server')
          .setLabel('Export Server')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📤'),
        new ButtonBuilder()
          .setCustomId('import_template')
          .setLabel('Import Template')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📥')
      );
  }

  static createTemplateSelect(templates) {
    const options = templates.map(template => ({
      label: `Template ${template.serverId}`,
      value: template.fileName,
      description: `Exported on ${new Date(template.exportedAt).toLocaleDateString()}`,
    }));

    return new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_template')
          .setPlaceholder('Choose a template to import')
          .addOptions(options)
      );
  }

  static createImportOptions() {
    return new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('import_options')
          .setPlaceholder('What would you like to import?')
          .addOptions([
            { label: 'Everything', value: 'everything', description: 'Roles, channels, and permissions' },
            { label: 'Roles Only', value: 'roles', description: 'Import roles only' },
            { label: 'Channels Only', value: 'channels', description: 'Import channels only' },
            { label: 'Permissions Only', value: 'permissions', description: 'Import permissions only' },
          ])
      );
  }

  static createConfirmationButtons() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_import')
          .setLabel('Confirm Import')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId('cancel_import')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌')
      );
  }

  static createProgressEmbed(progress, total) {
    const percentage = Math.round((progress / total) * 100);
    return new EmbedBuilder()
      .setTitle('🔄 Import Progress')
      .setDescription(`Importing server template... ${progress}/${total} (${percentage}%)`)
      .setColor(0xffa500)
      .addFields({ name: 'Status', value: 'In progress...', inline: true })
      .setFooter({ text: 'This may take a few minutes. Please wait.' });
  }

  static createSuccessEmbed(summary) {
    return new EmbedBuilder()
      .setTitle('✅ Import Complete')
      .setDescription('Your server template has been successfully imported!')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Roles Created', value: summary.roles.toString(), inline: true },
        { name: 'Channels Created', value: summary.channels.toString(), inline: true },
        { name: 'Permissions Applied', value: summary.permissions.toString(), inline: true }
      )
      .setFooter({ text: 'Server Schematic Bot • Template imported successfully' });
  }

  static createErrorEmbed(error) {
    return new EmbedBuilder()
      .setTitle('❌ Error')
      .setDescription('An error occurred while processing your request.')
      .setColor(0xff0000)
      .addFields({ name: 'Details', value: error.message || 'Unknown error' })
      .setFooter({ text: 'Please try again or contact support if the issue persists.' });
  }

  static async handleExport(interaction) {
    try {
      await interaction.deferReply();

      const guild = interaction.guild;
      const exportData = await ExportManager.exportServer(guild);

      const embed = new EmbedBuilder()
        .setTitle('✅ Export Complete')
        .setDescription(`Your server "${guild.name}" has been exported successfully!`)
        .setColor(0x00ff00)
        .addFields(
          { name: 'Roles Exported', value: exportData.roles.length.toString(), inline: true },
          { name: 'Channels Exported', value: exportData.channels.length.toString(), inline: true },
          { name: 'File Saved', value: `${guild.id}.json`, inline: true }
        )
        .setFooter({ text: 'Server Schematic Bot • Template saved' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error('Export error:', error);
      const errorEmbed = this.createErrorEmbed(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  static async handleImport(interaction, templateFile, options) {
    try {
      await interaction.deferReply();

      const guild = interaction.guild;
      const filePath = path.join(__dirname, '../../exports', templateFile);
      const exportData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const progress = await ImportManager.importServer(guild, exportData, options);

      const successEmbed = this.createSuccessEmbed(progress);
      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      logger.error('Import error:', error);
      const errorEmbed = this.createErrorEmbed(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  static getAvailableTemplates() {
    const exportsDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportsDir)) return [];

    return fs.readdirSync(exportsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(exportsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return { fileName: file, ...data };
      });
  }
}

module.exports = UIHandler;
