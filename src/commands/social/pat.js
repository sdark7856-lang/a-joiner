const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('pat')
    .setDescription('Pat someone on the head.')
    .addUserOption((o) =>
      o.setName('user').setDescription('Who to pat').setRequired(true))
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embed.warn('You pat yourself on the head. 🥲')], ephemeral: true });
    }
    return interaction.reply({
      embeds: [embed.brand('👋 Pat', `**${interaction.user.username}** gently pats ${target} on the head! 😊`)],
    });
  },
};
