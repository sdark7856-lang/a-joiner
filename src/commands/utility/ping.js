const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Show websocket heartbeat and round-trip latency.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const sent = await interaction.reply({
      embeds: [embed.info('Pinging...', '🏓 Pong')],
      fetchReply: true,
    });
    const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = Math.round(client.ws.ping);

    const e = embed
      .base()
      .setTitle('🏓 Pong')
      .addFields(
        { name: 'Websocket Heartbeat', value: `\`${ws}ms\``, inline: true },
        { name: 'Round-trip Latency', value: `\`${roundTrip}ms\``, inline: true },
      );

    return interaction.editReply({ embeds: [e] });
  },
};
