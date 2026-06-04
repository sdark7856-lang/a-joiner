const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');
const { parseDuration, formatDuration } = require('../../lib/duration');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user (optionally temporary).')
    .addUserOption((o) => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .addStringOption((o) => o.setName('duration').setDescription('Temp ban length e.g. 7d (optional)'))
    .addIntegerOption((o) => o.setName('delete_days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const durStr = interaction.options.getString('duration');
    const ms = durStr ? parseDuration(durStr) : null;
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

    const member = interaction.options.getMember('user');
    if (member && !member.bannable) return interaction.reply({ embeds: [embed.error("I can't ban that member (role hierarchy).")], ephemeral: true });

    await user.send({ embeds: [embed.error(`You were banned from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
    await interaction.guild.bans.create(user.id, { reason, deleteMessageSeconds: deleteDays * 86400 });

    const human = ms ? formatDuration(ms) : null;
    const c = await createCase(client, interaction.guild, {
      action: 'ban', target: user, moderator: interaction.user, reason, duration: human,
    });

    if (ms) {
      const tempBans = client.db.store(interaction.guild.id, 'tempBans');
      tempBans[user.id] = Date.now() + ms;
      client.db.save(interaction.guild.id);
    }

    return interaction.reply({
      embeds: [embed.success(`Banned **${user.tag}**${human ? ` for **${human}**` : ''}. (Case #${c.id})`)],
    });
  },
};
