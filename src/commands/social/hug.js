const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('hug')
    .setDescription('Give someone a hug.')
    .addUserOption((o) =>
      o.setName('user').setDescription('Who to hug').setRequired(true))
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embed.warn('You wrap your arms around yourself. 🫂')], ephemeral: true });
    }
    return interaction.reply({
      embeds: [embed.brand('🫂 Hug', `**${interaction.user.username}** gives ${target} a warm hug! 🫂`)],
    });
  },
};
