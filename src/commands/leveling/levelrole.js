const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'leveling',
  data: new SlashCommandBuilder()
    .setName('level-role')
    .setDescription('Manage roles awarded at specific levels.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((s) =>
      s
        .setName('add')
        .setDescription('Award a role when a user reaches a level.')
        .addIntegerOption((o) =>
          o.setName('level').setDescription('Level required').setRequired(true).setMinValue(1),
        )
        .addRoleOption((o) => o.setName('role').setDescription('Role to award').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('remove')
        .setDescription('Remove a level role reward.')
        .addIntegerOption((o) =>
          o.setName('level').setDescription('Level to remove').setRequired(true).setMinValue(1),
        ),
    )
    .addSubcommand((s) => s.setName('list').setDescription('List all level role rewards.')),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const levelRoles = { ...(client.db.getSetting(gid, 'levelRoles', {}) || {}) };

    if (sub === 'add') {
      const level = interaction.options.getInteger('level');
      const role = interaction.options.getRole('role');
      if (level < 1) {
        return interaction.reply({ embeds: [embed.error('Level must be at least 1.')], ephemeral: true });
      }
      levelRoles[String(level)] = role.id;
      client.db.setSetting(gid, 'levelRoles', levelRoles);
      return interaction.reply({
        embeds: [embed.success(`Members reaching **Level ${level}** will now receive ${role}.`)],
      });
    }

    if (sub === 'remove') {
      const level = interaction.options.getInteger('level');
      if (!levelRoles[String(level)]) {
        return interaction.reply({
          embeds: [embed.error(`No role is configured for **Level ${level}**.`)],
          ephemeral: true,
        });
      }
      delete levelRoles[String(level)];
      client.db.setSetting(gid, 'levelRoles', levelRoles);
      return interaction.reply({
        embeds: [embed.success(`Removed the level role reward for **Level ${level}**.`)],
      });
    }

    // list
    const entries = Object.entries(levelRoles).sort((a, b) => Number(a[0]) - Number(b[0]));
    if (entries.length === 0) {
      return interaction.reply({ embeds: [embed.info('No level roles configured.')] });
    }
    const lines = entries.map(([lvl, roleId]) => `**Level ${lvl}** → <@&${roleId}>`);
    return interaction.reply({
      embeds: [embed.base().setTitle('🎖️ Level Roles').setDescription(lines.join('\n'))],
    });
  },
};
