const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../lib/embed');

const SETTING = 'rssAlerts';
const POLL_NOTE = 'Saved. Alerts post when new feed items are detected — background polling runs when the bot is hosted with network access.';

module.exports = {
  category: 'notifications',
  data: new SlashCommandBuilder()
    .setName('rss-alerts')
    .setDescription('Manage RSS feed alert subscriptions.')
    .addSubcommand((s) =>
      s.setName('add').setDescription('Subscribe to an RSS feed')
        .addStringOption((o) => o.setName('feed_url').setDescription('RSS/Atom feed URL').setRequired(true))
        .addChannelOption((o) => o.setName('discord_channel').setDescription('Where to post alerts').addChannelTypes(ChannelType.GuildText)))
    .addSubcommand((s) =>
      s.setName('remove').setDescription('Unsubscribe from an RSS feed')
        .addStringOption((o) => o.setName('feed_url').setDescription('RSS/Atom feed URL').setRequired(true)))
    .addSubcommand((s) => s.setName('list').setDescription('List RSS alert subscriptions'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const alerts = client.db.getSetting(gid, SETTING, []);

    if (sub === 'add') {
      const source = interaction.options.getString('feed_url');
      const channel = interaction.options.getChannel('discord_channel') || interaction.channel;
      if (alerts.some((a) => a.source === source)) {
        return interaction.reply({ embeds: [embed.error('That feed is already subscribed.')], ephemeral: true });
      }
      alerts.push({ source, channelId: channel.id });
      client.db.setSetting(gid, SETTING, alerts);
      return interaction.reply({ embeds: [embed.success(`Subscribed to **${source}**, posting in ${channel}.\n${POLL_NOTE}`, 'RSS Alert Added')] });
    }

    if (sub === 'remove') {
      const source = interaction.options.getString('feed_url');
      const next = alerts.filter((a) => a.source !== source);
      if (next.length === alerts.length) {
        return interaction.reply({ embeds: [embed.error('No subscription found for that feed.')], ephemeral: true });
      }
      client.db.setSetting(gid, SETTING, next);
      return interaction.reply({ embeds: [embed.success(`Removed the subscription for **${source}**.`)] });
    }

    // list
    if (alerts.length === 0) {
      return interaction.reply({ embeds: [embed.info('No RSS alert subscriptions configured.', '📰 RSS Alerts')], ephemeral: true });
    }
    const lines = alerts.map((a, i) => `**${i + 1}.** ${a.source} → <#${a.channelId}>`);
    return interaction.reply({ embeds: [embed.base().setTitle('📰 RSS Alerts').setDescription(lines.join('\n'))] });
  },
};
