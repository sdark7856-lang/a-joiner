const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Show a user's avatar with download links.")
    .addUserOption((o) => o.setName('user').setDescription('User to view'))
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const png = user.displayAvatarURL({ extension: 'png', size: 1024, forceStatic: true });
    const webp = user.displayAvatarURL({ extension: 'webp', size: 1024, forceStatic: true });
    const display = user.displayAvatarURL({ size: 1024 });

    const e = embed
      .base()
      .setTitle(`🖼️ ${user.tag}'s avatar`)
      .setImage(display)
      .setDescription(`[PNG](${png}) • [WebP](${webp})`);

    return interaction.reply({ embeds: [e] });
  },
};
