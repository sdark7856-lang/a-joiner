const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const { levelForXp } = require('../../lib/leveling');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  category: 'leveling',
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top 10 users by XP.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const users = client.db.allUsers(gid);

    const sorted = Object.entries(users)
      .filter(([, rec]) => (rec.xp || 0) > 0)
      .sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0))
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.reply({ embeds: [embed.info('No one has earned any XP yet.')] });
    }

    const lines = sorted.map(([id, rec], i) => {
      const rank = MEDALS[i] || `**${i + 1}.**`;
      const xp = rec.xp || 0;
      const level = levelForXp(xp);
      return `${rank} <@${id}> — Level ${level} • ${xp.toLocaleString()} XP`;
    });

    const e = embed
      .base()
      .setTitle('🏆 XP Leaderboard')
      .setDescription(lines.join('\n'));

    return interaction.reply({ embeds: [e] });
  },
};
