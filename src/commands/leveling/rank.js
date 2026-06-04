const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const { levelForXp, totalXpForLevel, xpForLevel } = require('../../lib/leveling');

function progressBar(ratio, size = 10) {
  const filled = Math.max(0, Math.min(size, Math.round(ratio * size)));
  return '█'.repeat(filled) + '░'.repeat(size - filled);
}

module.exports = {
  category: 'leveling',
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Show your level, xp and progress to the next level.')
    .addUserOption((o) => o.setName('user').setDescription('User to view'))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const target = interaction.options.getUser('user') || interaction.user;
    const rec = client.db.user(gid, target.id);

    const xp = rec.xp || 0;
    const level = levelForXp(xp);
    const xpIntoLevel = xp - totalXpForLevel(level);
    const xpNeeded = xpForLevel(level);
    const ratio = xpNeeded > 0 ? xpIntoLevel / xpNeeded : 0;
    const pct = Math.round(ratio * 100);

    const users = client.db.allUsers(gid);
    const sorted = Object.entries(users).sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0));
    const position = sorted.findIndex(([id]) => id === target.id) + 1;

    const e = embed
      .base()
      .setTitle(`📊 ${target.username}'s Rank`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'Total XP', value: `${xp.toLocaleString()}`, inline: true },
        { name: 'Rank', value: position > 0 ? `#${position}` : 'Unranked', inline: true },
        {
          name: `Progress to Level ${level + 1}`,
          value: `${progressBar(ratio)} ${pct}%\n${xpIntoLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`,
        },
      );

    return interaction.reply({ embeds: [e] });
  },
};
