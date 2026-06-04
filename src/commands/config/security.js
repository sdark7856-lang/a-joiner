const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'config',
  data: new SlashCommandBuilder()
    .setName('security')
    .setDescription('Configure raid protection and the new-account gate.')
    .addSubcommand((s) =>
      s.setName('antiraid').setDescription('Toggle mass-join raid detection')
        .addBooleanOption((o) => o.setName('enabled').setDescription('On or off').setRequired(true))
        .addIntegerOption((o) => o.setName('threshold').setDescription('Joins within 10s to trigger an alert (default 8)').setMinValue(3).setMaxValue(50)))
    .addSubcommand((s) =>
      s.setName('accountage').setDescription('Auto-kick accounts younger than N days')
        .addIntegerOption((o) => o.setName('days').setDescription('Minimum account age in days (0 disables)').setMinValue(0).setMaxValue(365).setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    if (sub === 'antiraid') {
      const enabled = interaction.options.getBoolean('enabled');
      const threshold = interaction.options.getInteger('threshold');
      client.db.setSetting(gid, 'antiRaid', enabled);
      if (threshold) client.db.setSetting(gid, 'raidThreshold', threshold);
      return interaction.reply({ embeds: [embed.success(`Anti-raid is now **${enabled ? 'on' : 'off'}**${threshold ? ` (threshold ${threshold}/10s)` : ''}.`)] });
    }

    if (sub === 'accountage') {
      const days = interaction.options.getInteger('days');
      client.db.setSetting(gid, 'minAccountAge', days);
      return interaction.reply({ embeds: [embed.success(days ? `New accounts under **${days} day(s)** old will be auto-kicked.` : 'Account-age gate disabled.')] });
    }
  },
};
