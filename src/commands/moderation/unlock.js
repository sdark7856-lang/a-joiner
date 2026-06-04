const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock this channel so @everyone can send messages again.')
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }, { reason });
    await createCase(client, interaction.guild, {
      action: 'unlock', target: { tag: `#${interaction.channel.name}`, id: interaction.channel.id }, moderator: interaction.user, reason,
    });
    return interaction.reply({ embeds: [embed.success(`🔓 Unlocked **#${interaction.channel.name}**.`)] });
  },
};
