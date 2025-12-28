const { Events } = require('discord.js');
const UIHandler = require('../handlers/uiHandler');
const logger = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenuInteraction(interaction);
    }
  },
};

async function handleButtonInteraction(interaction) {
  const customId = interaction.customId;

  try {
    if (customId === 'export_server') {
      await UIHandler.handleExport(interaction);
    } else if (customId === 'import_template') {
      const templates = UIHandler.getAvailableTemplates();
      if (templates.length === 0) {
        await interaction.reply({ content: 'No saved templates found. Export a server first!', ephemeral: true });
        return;
      }

      const embed = UIHandler.createMainEmbed();
      const selectMenu = UIHandler.createTemplateSelect(templates);

      await interaction.reply({ embeds: [embed], components: [selectMenu], ephemeral: true });
    } else if (customId === 'confirm_import') {
      // Check if template and options are selected
      const selectedTemplate = interaction.client.selectedTemplate;
      const selectedOption = interaction.client.selectedOption;

      if (!selectedTemplate || !selectedOption) {
        await interaction.reply({ content: 'Please select a template and import options first.', ephemeral: true });
        return;
      }

      await UIHandler.handleImport(interaction, selectedTemplate, selectedOption);

      // Clear stored state
      delete interaction.client.selectedTemplate;
      delete interaction.client.selectedOption;
    } else if (customId === 'cancel_import') {
      await interaction.reply({ content: 'Import cancelled.', ephemeral: true });
    }
  } catch (error) {
    logger.error('Button interaction error:', error);
    await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
  }
}

async function handleSelectMenuInteraction(interaction) {
  const customId = interaction.customId;
  const value = interaction.values[0];

  try {
    if (customId === 'select_template') {
      const embed = UIHandler.createMainEmbed();
      const importOptions = UIHandler.createImportOptions();
      const confirmButtons = UIHandler.createConfirmationButtons();

      // Store the selected template
      interaction.client.selectedTemplate = value;

      await interaction.update({
        embeds: [embed],
        components: [importOptions, confirmButtons],
        content: `Selected template: ${value}. Choose what to import:`
      });
    } else if (customId === 'import_options') {
      // Store the selected import option
      interaction.client.selectedOption = value;
      await interaction.reply({ content: `Import option selected: ${value}. Click confirm to proceed.`, ephemeral: true });
    }
  } catch (error) {
    logger.error('Select menu interaction error:', error);
    await interaction.reply({ content: 'An error occurred while processing your selection.', ephemeral: true });
  }
}
