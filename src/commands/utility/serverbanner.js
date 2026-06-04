const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('server-banner')
    .setDescription('Show the server icon and banner.')
    .setDMPermission(false),

  async execute(interaction) {
    const guild = interaction.guild;
    const icon = guild.iconURL({ size: 512 });
    const banner = guild.bannerURL({ size: 1024 });

    const e = embed.base().setTitle(`🖼️ ${guild.name}`);
    const links = [];
    if (icon) {
      e.setThumbnail(icon);
      links.push(`[Icon](${icon})`);
    }
    if (banner) {
      e.setImage(banner);
      links.push(`[Banner](${banner})`);
    }

    if (!icon && !banner) {
      e.setDescription('This server has no icon or banner set.');
    } else {
      e.setDescription(links.join(' • '));
    }

    return interaction.reply({ embeds: [e] });
  },
};
