const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('richest')
    .setDescription('Show the top 10 richest users in the server.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const users = client.db.allUsers(gid) || {};

    const ranked = Object.entries(users)
      .map(([userId, rec]) => ({ userId, total: (rec.coins || 0) + (rec.bank || 0) }))
      .filter((u) => u.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (ranked.length === 0) {
      return interaction.reply({
        embeds: [embed.info('No one has any coins yet. Use `/daily` or `/work` to get started!', '🏆 Richest')],
      });
    }

    const lines = ranked.map((u, i) => {
      const rank = MEDALS[i] || `**${i + 1}.**`;
      return `${rank} <@${u.userId}> — 🪙 ${u.total.toLocaleString()} coins`;
    });

    const e = embed
      .base()
      .setTitle('🏆 Richest Users')
      .setDescription(lines.join('\n'));

    return interaction.reply({ embeds: [e] });
  },
};
