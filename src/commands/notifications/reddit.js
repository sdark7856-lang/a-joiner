const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../lib/embed');

const SETTING = 'redditAlerts';
const POLL_NOTE = 'Saved. Alerts post when new posts are detected — background polling runs when the bot is hosted with network access.';

module.exports = {
  category: 'notifications',
  data: new SlashCommandBuilder()
    .setName('reddit-alerts')
    .setDescription('Manage subreddit post alert subscriptions.')
    .addSubcommand((s) =>
      s.setName('add').setDescription('Subscribe to a subreddit')
        .addStringOption((o) => o.setName('subreddit').setDescription('Subreddit name or URL').setRequired(true))
        .addChannelOption((o) => o.setName('discord_channel').setDescription('Where to post alerts').addChannelTypes(ChannelType.GuildText)))
    .addSubcommand((s) =>
      s.setName('remove').setDescription('Unsubscribe from a subreddit')
        .addStringOption((o) => o.setName('subreddit').setDescription('Subreddit name or URL').setRequired(true)))
    .addSubcommand((s) => s.setName('list').setDescription('List subreddit alert subscriptions'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const alerts = client.db.getSetting(gid, SETTING, []);

    if (sub === 'add') {
      const source = interaction.options.getString('subreddit');
      const channel = interaction.options.getChannel('discord_channel') || interaction.channel;
      if (alerts.some((a) => a.source === source)) {
        return interaction.reply({ embeds: [embed.error('That subreddit is already subscribed.')], ephemeral: true });
      }
      alerts.push({ source, channelId: channel.id });
      client.db.setSetting(gid, SETTING, alerts);
      return interaction.reply({ embeds: [embed.success(`Subscribed to **${source}**, posting in ${channel}.\n${POLL_NOTE}`, 'Reddit Alert Added')] });
    }

    if (sub === 'remove') {
      const source = interaction.options.getString('subreddit');
      const next = alerts.filter((a) => a.source !== source);
      if (next.length === alerts.length) {
        return interaction.reply({ embeds: [embed.error('No subscription found for that subreddit.')], ephemeral: true });
      }
      client.db.setSetting(gid, SETTING, next);
      return interaction.reply({ embeds: [embed.success(`Removed the subscription for **${source}**.`)] });
    }

    // list
    if (alerts.length === 0) {
      return interaction.reply({ embeds: [embed.info('No subreddit alert subscriptions configured.', '🔶 Reddit Alerts')], ephemeral: true });
    }
    const lines = alerts.map((a, i) => `**${i + 1}.** ${a.source} → <#${a.channelId}>`);
    return interaction.reply({ embeds: [embed.base().setTitle('🔶 Reddit Alerts').setDescription(lines.join('\n'))] });
  },
};
