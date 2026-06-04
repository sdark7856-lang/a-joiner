const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set this channel’s slowmode (seconds between messages).')
    .addIntegerOption((o) => o.setName('seconds').setDescription('0 to disable, max 21600').setMinValue(0).setMaxValue(21600).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    await interaction.channel.setRateLimitPerUser(seconds);
    return interaction.reply({
      embeds: [embed.success(seconds ? `Slowmode set to **${seconds}s**.` : 'Slowmode disabled.')],
    });
  },
};
