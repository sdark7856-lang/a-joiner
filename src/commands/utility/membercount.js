const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Show member counts for this server.')
    .setDMPermission(false),

  async execute(interaction) {
    const guild = interaction.guild;
    const cached = guild.members.cache;
    const bots = cached.filter((m) => m.user.bot).size;
    const humans = cached.size - bots;
    const online = cached.filter(
      (m) => m.presence && m.presence.status && m.presence.status !== 'offline',
    ).size;

    const e = embed
      .base()
      .setTitle(`👥 ${guild.name} — Members`)
      .addFields(
        { name: 'Total', value: `${guild.memberCount}`, inline: true },
        { name: 'Humans', value: `${humans} (cached)`, inline: true },
        { name: 'Bots', value: `${bots} (cached)`, inline: true },
        { name: 'Online', value: `${online} (cached)`, inline: true },
      );

    return interaction.reply({ embeds: [e] });
  },
};
