const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Show a profile card for yourself or another user.')
    .addUserOption((o) => o.setName('user').setDescription('User to view'))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const target = interaction.options.getUser('user') || interaction.user;
    const rec = client.db.user(gid, target.id);

    const level = rec.level || 0;
    const xp = rec.xp || 0;
    const coins = (rec.coins || 0) + (rec.bank || 0);
    const rep = rec.rep || 0;
    const bio = rec.bio || 'No bio set';

    const e = embed
      .base(rec.bgColor || undefined)
      .setTitle(`📇 ${target.username}'s Profile`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(bio)
      .addFields(
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'XP', value: `${xp.toLocaleString()}`, inline: true },
        { name: 'Coins', value: `🪙 ${coins.toLocaleString()}`, inline: true },
        { name: 'Reputation', value: `⭐ ${rep}`, inline: true },
      );

    if (rec.marriedTo) {
      e.addFields({ name: 'Married To', value: `💍 <@${rec.marriedTo}>`, inline: true });
    }

    return interaction.reply({ embeds: [e] });
  },
};
