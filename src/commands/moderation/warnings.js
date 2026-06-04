const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View or clear a member’s warnings.')
    .addSubcommand((s) =>
      s.setName('list').setDescription('List a member’s warnings')
        .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)))
    .addSubcommand((s) =>
      s.setName('clear').setDescription('Clear a member’s warnings')
        .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const record = client.db.user(interaction.guild.id, user.id);

    if (interaction.options.getSubcommand() === 'clear') {
      const n = record.warns.length;
      record.warns = [];
      client.db.save(interaction.guild.id);
      return interaction.reply({ embeds: [embed.success(`Cleared **${n}** warning(s) for ${user.tag}.`)] });
    }

    if (!record.warns.length) return interaction.reply({ embeds: [embed.info(`${user.tag} has no warnings. 🖤`)] });
    const list = record.warns
      .map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.moderator}> • <t:${Math.floor(w.timestamp / 1000)}:R>`)
      .slice(-15)
      .join('\n');
    return interaction.reply({ embeds: [embed.base().setTitle(`Warnings for ${user.tag} (${record.warns.length})`).setDescription(list)] });
  },
};
