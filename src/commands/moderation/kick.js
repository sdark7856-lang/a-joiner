const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .addUserOption((o) => o.setName('user').setDescription('Member to kick').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target) return interaction.reply({ embeds: [embed.error('That user is not in the server.')], ephemeral: true });
    if (!target.kickable) return interaction.reply({ embeds: [embed.error("I can't kick that member (role hierarchy).")], ephemeral: true });

    await target.send({ embeds: [embed.warn(`You were kicked from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
    await target.kick(reason);
    const c = await createCase(client, interaction.guild, {
      action: 'kick', target: target.user, moderator: interaction.user, reason,
    });
    return interaction.reply({ embeds: [embed.success(`Kicked **${target.user.tag}**. (Case #${c.id})`)] });
  },
};
