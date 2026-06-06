const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../lib/embed');

const CHANNEL_KEYS = [
  'modLogChannel', 'logChannel', 'welcomeChannel', 'goodbyeChannel', 'ticketChannel',
];

const AUTOMOD_FILTERS = ['antiSpam', 'antiInvite', 'antiLink', 'antiCaps', 'antiMention', 'profanity'];

module.exports = {
  category: 'config',
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure Zah Hub for this server.')
    .addSubcommand((s) => s.setName('view').setDescription('View the current configuration'))
    .addSubcommand((s) =>
      s.setName('channel').setDescription('Set a feature channel')
        .addStringOption((o) => o.setName('feature').setDescription('Which channel').setRequired(true)
          .addChoices(...CHANNEL_KEYS.map((k) => ({ name: k, value: k }))))
        .addChannelOption((o) => o.setName('channel').setDescription('Target channel').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand((s) =>
      s.setName('welcome').setDescription('Set the welcome message')
        .addStringOption((o) => o.setName('message').setDescription('Use {user}, {server}, {count}').setRequired(true)))
    .addSubcommand((s) =>
      s.setName('goodbye').setDescription('Set the goodbye message')
        .addStringOption((o) => o.setName('message').setDescription('Use {user}, {server}, {count}').setRequired(true)))
    .addSubcommand((s) =>
      s.setName('autorole').setDescription('Set a role automatically given on join')
        .addRoleOption((o) => o.setName('role').setDescription('Role (or omit to disable)')))
    .addSubcommand((s) =>
      s.setName('automod').setDescription('Toggle an auto-moderation filter')
        .addStringOption((o) => o.setName('filter').setDescription('Filter').setRequired(true)
          .addChoices(...AUTOMOD_FILTERS.map((f) => ({ name: f, value: f }))))
        .addBooleanOption((o) => o.setName('enabled').setDescription('On or off').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const db = client.db;
    const sub = interaction.options.getSubcommand();

    if (sub === 'view') {
      const s = db.settings(gid);
      const chan = (k) => (s[k] ? `<#${s[k]}>` : '—');
      const am = db.getSetting(gid, 'automod', {});
      const e = embed.base().setTitle(`⚙️ ${interaction.guild.name} • Configuration`)
        .addFields(
          { name: '📋 Logging', value: `Mod-log: ${chan('modLogChannel')}\nAudit: ${chan('logChannel')}`, inline: true },
          { name: '👋 Welcome', value: `Welcome: ${chan('welcomeChannel')}\nGoodbye: ${chan('goodbyeChannel')}`, inline: true },
          { name: '🎫 Tickets', value: chan('ticketChannel'), inline: true },
          { name: '🎭 Autorole', value: s.autorole ? `<@&${s.autorole}>` : '—', inline: true },
          { name: '🤖 Auto-mod', value: AUTOMOD_FILTERS.map((f) => `${am[f] ? '🟢' : '⚪'} ${f}`).join('\n') },
        );
      return interaction.reply({ embeds: [e] });
    }

    if (sub === 'channel') {
      const key = interaction.options.getString('feature');
      const channel = interaction.options.getChannel('channel');
      db.setSetting(gid, key, channel.id);
      return interaction.reply({ embeds: [embed.success(`Set **${key}** to ${channel}.`)] });
    }

    if (sub === 'welcome' || sub === 'goodbye') {
      db.setSetting(gid, sub === 'welcome' ? 'welcomeMessage' : 'goodbyeMessage', interaction.options.getString('message'));
      return interaction.reply({ embeds: [embed.success(`Updated the ${sub} message.`)] });
    }

    if (sub === 'autorole') {
      const role = interaction.options.getRole('role');
      db.setSetting(gid, 'autorole', role ? role.id : null);
      return interaction.reply({ embeds: [embed.success(role ? `Autorole set to ${role}.` : 'Autorole disabled.')] });
    }

    if (sub === 'automod') {
      const filter = interaction.options.getString('filter');
      const enabled = interaction.options.getBoolean('enabled');
      const am = db.getSetting(gid, 'automod', {});
      am[filter] = enabled;
      db.setSetting(gid, 'automod', am);
      return interaction.reply({ embeds: [embed.success(`Auto-mod **${filter}** is now **${enabled ? 'on' : 'off'}**.`)] });
    }
  },
};
