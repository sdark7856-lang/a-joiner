const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Give someone a kiss.')
    .addUserOption((o) =>
      o.setName('user').setDescription('Who to kiss').setRequired(true))
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embed.warn('You cannot kiss yourself! 😅')], ephemeral: true });
    }
    return interaction.reply({
      embeds: [embed.brand('💋 Kiss', `**${interaction.user.username}** gives ${target} a sweet kiss! 💋`)],
    });
  },
};
