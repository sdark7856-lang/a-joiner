const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

function parseHex(input) {
  if (!input) return null;
  const cleaned = input.replace(/^#/, '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return cleaned.toLowerCase();
}

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Preview a hex color.')
    .addStringOption((o) =>
      o.setName('hex').setDescription('Hex color, e.g. #5865f2 or 5865f2').setRequired(true),
    )
    .setDMPermission(false),

  async execute(interaction) {
    const hex = parseHex(interaction.options.getString('hex'));
    if (!hex) {
      return interaction.reply({
        embeds: [embed.error('Invalid hex color. Use a format like `#5865f2`.')],
        ephemeral: true,
      });
    }

    const int = parseInt(hex, 16);
    const r = (int >> 16) & 0xff;
    const g = (int >> 8) & 0xff;
    const b = int & 0xff;

    const e = embed
      .base(int)
      .setTitle(`🎨 #${hex}`)
      .addFields(
        { name: 'Hex', value: `#${hex}`, inline: true },
        { name: 'RGB', value: `${r}, ${g}, ${b}`, inline: true },
      )
      .setImage(`https://singlecolorimage.com/get/${hex}/200x200`);

    return interaction.reply({ embeds: [e] });
  },
};
