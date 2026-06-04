const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock this channel so @everyone can’t send messages.')
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason });
    await createCase(client, interaction.guild, {
      action: 'lock', target: { tag: `#${interaction.channel.name}`, id: interaction.channel.id }, moderator: interaction.user, reason,
    });
    return interaction.reply({ embeds: [embed.success(`🔒 Locked **#${interaction.channel.name}**.`)] });
  },
};
