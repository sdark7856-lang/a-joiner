const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove a member’s timeout.')
    .addUserOption((o) => o.setName('user').setDescription('Member to unmute').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target) return interaction.reply({ embeds: [embed.error('That user is not in the server.')], ephemeral: true });
    if (!target.isCommunicationDisabled()) return interaction.reply({ embeds: [embed.info('That member is not muted.')], ephemeral: true });

    await target.timeout(null, reason);
    const c = await createCase(client, interaction.guild, {
      action: 'unmute', target: target.user, moderator: interaction.user, reason,
    });
    return interaction.reply({ embeds: [embed.success(`Unmuted **${target.user.tag}**. (Case #${c.id})`)] });
  },
};
