const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');
const { parseDuration, formatDuration } = require('../../lib/duration');

const MAX = 28 * 24 * 60 * 60 * 1000; // Discord timeout cap

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a member for a duration (e.g. 10m, 2h, 1d).')
    .addUserOption((o) => o.setName('user').setDescription('Member to mute').setRequired(true))
    .addStringOption((o) => o.setName('duration').setDescription('e.g. 10m, 2h, 1d').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const ms = parseDuration(interaction.options.getString('duration'));
    if (!target) return interaction.reply({ embeds: [embed.error('That user is not in the server.')], ephemeral: true });
    if (!ms) return interaction.reply({ embeds: [embed.error('Invalid duration. Try `10m`, `2h`, `1d`.')], ephemeral: true });
    if (ms > MAX) return interaction.reply({ embeds: [embed.error('Max timeout is 28 days.')], ephemeral: true });
    if (!target.moderatable) return interaction.reply({ embeds: [embed.error("I can't mute that member (role hierarchy).")], ephemeral: true });

    await target.timeout(ms, reason);
    const human = formatDuration(ms);
    const c = await createCase(client, interaction.guild, {
      action: 'mute', target: target.user, moderator: interaction.user, reason, duration: human,
    });
    target.send({ embeds: [embed.warn(`You were muted in **${interaction.guild.name}** for **${human}**.\n**Reason:** ${reason}`)] }).catch(() => {});
    return interaction.reply({ embeds: [embed.success(`Muted **${target.user.tag}** for **${human}**. (Case #${c.id})`)] });
  },
};
