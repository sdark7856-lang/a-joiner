const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { getCase, ACTION_COLORS } = require('../../lib/cases');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('Look up or edit a moderation case by ID.')
    .addSubcommand((s) =>
      s.setName('view').setDescription('View a case')
        .addIntegerOption((o) => o.setName('id').setDescription('Case ID').setRequired(true)))
    .addSubcommand((s) =>
      s.setName('edit').setDescription('Edit a case reason')
        .addIntegerOption((o) => o.setName('id').setDescription('Case ID').setRequired(true))
        .addStringOption((o) => o.setName('reason').setDescription('New reason').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const id = interaction.options.getInteger('id');
    const record = getCase(client, interaction.guild.id, id);
    if (!record) return interaction.reply({ embeds: [embed.error(`Case #${id} not found.`)], ephemeral: true });

    if (interaction.options.getSubcommand() === 'edit') {
      record.reason = interaction.options.getString('reason');
      client.db.save(interaction.guild.id);
      return interaction.reply({ embeds: [embed.success(`Updated reason for Case #${id}.`)] });
    }

    const e = embed.base(ACTION_COLORS[record.action] || embed.COLORS.brand)
      .setTitle(`Case #${record.id} • ${record.action.toUpperCase()}`)
      .addFields(
        { name: 'User', value: `${record.targetTag} (${record.targetId})`, inline: true },
        { name: 'Moderator', value: record.moderatorTag, inline: true },
        { name: 'When', value: `<t:${Math.floor(record.timestamp / 1000)}:F>` },
        { name: 'Reason', value: record.reason },
      );
    if (record.duration) e.addFields({ name: 'Duration', value: record.duration, inline: true });
    return interaction.reply({ embeds: [e] });
  },
};
