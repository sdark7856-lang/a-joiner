const embed = require('../lib/embed');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // ----- Slash commands -----
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        client.logger.error(`Command ${interaction.commandName} failed:`, err);
        const payload = {
          embeds: [embed.error('Something went wrong running that command.')],
          ephemeral: true,
        };
        if (interaction.deferred || interaction.replied) {
          interaction.followUp(payload).catch(() => {});
        } else {
          interaction.reply(payload).catch(() => {});
        }
      }
      return;
    }

    // ----- Autocomplete -----
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction, client);
        } catch (err) {
          client.logger.error(`Autocomplete ${interaction.commandName} failed:`, err);
        }
      }
      return;
    }

    // ----- Buttons / select menus / modals (persistent components) -----
    if (
      interaction.isButton() ||
      interaction.isAnySelectMenu() ||
      interaction.isModalSubmit()
    ) {
      const handler = client.components.find((c) => interaction.customId.startsWith(c.id));
      if (!handler) return;
      try {
        await handler.execute(interaction, client);
      } catch (err) {
        client.logger.error(`Component ${interaction.customId} failed:`, err);
        if (!interaction.replied && !interaction.deferred) {
          interaction
            .reply({ embeds: [embed.error('Something went wrong.')], ephemeral: true })
            .catch(() => {});
        }
      }
    }
  },
};
