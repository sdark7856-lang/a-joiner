const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../lib/embed');

const SETTING = 'youtubeAlerts';
const POLL_NOTE = 'Saved. Alerts post when new uploads are detected — background polling runs when the bot is hosted with network access.';

module.exports = {
  category: 'notifications',
  data: new SlashCommandBuilder()
    .setName('youtube-alerts')
    .setDescription('Manage YouTube upload alert subscriptions.')
    .addSubcommand((s) =>
      s.setName('add').setDescription('Subscribe to a YouTube channel')
        .addStringOption((o) => o.setName('channel_url').setDescription('YouTube channel URL').setRequired(true))
        .addChannelOption((o) => o.setName('discord_channel').setDescription('Where to post alerts').addChannelTypes(ChannelType.GuildText)))
    .addSubcommand((s) =>
      s.setName('remove').setDescription('Unsubscribe from a YouTube channel')
        .addStringOption((o) => o.setName('channel_url').setDescription('YouTube channel URL').setRequired(true)))
    .addSubcommand((s) => s.setName('list').setDescription('List YouTube alert subscriptions'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const alerts = client.db.getSetting(gid, SETTING, []);

    if (sub === 'add') {
      const source = interaction.options.getString('channel_url');
      const channel = interaction.options.getChannel('discord_channel') || interaction.channel;
      if (alerts.some((a) => a.source === source)) {
        return interaction.reply({ embeds: [embed.error('That channel is already subscribed.')], ephemeral: true });
      }
      alerts.push({ source, channelId: channel.id });
      client.db.setSetting(gid, SETTING, alerts);
      return interaction.reply({ embeds: [embed.success(`Subscribed to **${source}**, posting in ${channel}.\n${POLL_NOTE}`, 'YouTube Alert Added')] });
    }

    if (sub === 'remove') {
      const source = interaction.options.getString('channel_url');
      const next = alerts.filter((a) => a.source !== source);
      if (next.length === alerts.length) {
        return interaction.reply({ embeds: [embed.error('No subscription found for that channel.')], ephemeral: true });
      }
      client.db.setSetting(gid, SETTING, next);
      return interaction.reply({ embeds: [embed.success(`Removed the subscription for **${source}**.`)] });
    }

    // list
    if (alerts.length === 0) {
      return interaction.reply({ embeds: [embed.info('No YouTube alert subscriptions configured.', '📺 YouTube Alerts')], ephemeral: true });
    }
    const lines = alerts.map((a, i) => `**${i + 1}.** ${a.source} → <#${a.channelId}>`);
    return interaction.reply({ embeds: [embed.base().setTitle('📺 YouTube Alerts').setDescription(lines.join('\n'))] });
  },
};
