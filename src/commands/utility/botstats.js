const { SlashCommandBuilder, version: djsVersion } = require('discord.js');
const embed = require('../../lib/embed');
const { formatDuration } = require('../../lib/duration');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('botstats')
    .setDescription('Show bot statistics: uptime, guilds, users, ping, memory.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const uptimeMs = client.uptime ?? process.uptime() * 1000;
    const guildCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    const ws = Math.round(client.ws.ping);
    const mem = process.memoryUsage();
    const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(1);
    const rss = (mem.rss / 1024 / 1024).toFixed(1);

    const e = embed
      .base()
      .setTitle('📊 Bot Statistics')
      .addFields(
        { name: 'Uptime', value: formatDuration(uptimeMs) || '0s', inline: true },
        { name: 'Servers', value: `${guildCount}`, inline: true },
        { name: 'Users', value: `${userCount.toLocaleString()}`, inline: true },
        { name: 'Ping', value: `${ws}ms`, inline: true },
        { name: 'Memory', value: `${heapUsed} MB heap / ${rss} MB RSS`, inline: true },
        { name: 'discord.js', value: `v${djsVersion}`, inline: true },
      );

    return interaction.reply({ embeds: [e] });
  },
};
