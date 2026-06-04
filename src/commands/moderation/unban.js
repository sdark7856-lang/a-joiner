const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by ID.')
    .addStringOption((o) => o.setName('user_id').setDescription('The user ID to unban').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const id = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const ban = await interaction.guild.bans.fetch(id).catch(() => null);
    if (!ban) return interaction.reply({ embeds: [embed.error('That user is not banned (or the ID is invalid).')], ephemeral: true });

    await interaction.guild.bans.remove(id, reason);
    const tempBans = client.db.store(interaction.guild.id, 'tempBans');
    delete tempBans[id];
    client.db.save(interaction.guild.id);

    const c = await createCase(client, interaction.guild, {
      action: 'unban', target: ban.user, moderator: interaction.user, reason,
    });
    return interaction.reply({ embeds: [embed.success(`Unbanned **${ban.user.tag}**. (Case #${c.id})`)] });
  },
};
