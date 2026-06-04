const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'leveling',
  data: new SlashCommandBuilder()
    .setName('xp-multiplier')
    .setDescription('Manage per-role XP multipliers.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((s) =>
      s
        .setName('set')
        .setDescription('Set an XP multiplier for a role.')
        .addRoleOption((o) => o.setName('role').setDescription('Role').setRequired(true))
        .addNumberOption((o) =>
          o
            .setName('multiplier')
            .setDescription('Multiplier (e.g. 2 for double XP, 0 to remove)')
            .setRequired(true)
            .setMinValue(0),
        ),
    )
    .addSubcommand((s) => s.setName('list').setDescription('List all role XP multipliers.')),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const multipliers = { ...(client.db.getSetting(gid, 'xpMultipliers', {}) || {}) };

    if (sub === 'set') {
      const role = interaction.options.getRole('role');
      const multiplier = interaction.options.getNumber('multiplier');

      if (multiplier === 0) {
        delete multipliers[role.id];
        client.db.setSetting(gid, 'xpMultipliers', multipliers);
        return interaction.reply({
          embeds: [embed.success(`Removed the XP multiplier for ${role}.`)],
        });
      }

      multipliers[role.id] = multiplier;
      client.db.setSetting(gid, 'xpMultipliers', multipliers);
      return interaction.reply({
        embeds: [embed.success(`Members with ${role} now earn **${multiplier}×** XP.`)],
      });
    }

    // list
    const entries = Object.entries(multipliers);
    if (entries.length === 0) {
      return interaction.reply({ embeds: [embed.info('No XP multipliers configured.')] });
    }
    const lines = entries
      .sort((a, b) => b[1] - a[1])
      .map(([roleId, mult]) => `<@&${roleId}> → **${mult}×**`);
    return interaction.reply({
      embeds: [embed.base().setTitle('✨ XP Multipliers').setDescription(lines.join('\n'))],
    });
  },
};
