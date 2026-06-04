const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../lib/embed');

function parseHex(input) {
  if (!input) return null;
  const cleaned = input.replace(/^#/, '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return parseInt(cleaned, 16);
}

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Build and send a custom embed.')
    .addStringOption((o) => o.setName('title').setDescription('Embed title'))
    .addStringOption((o) => o.setName('description').setDescription('Embed description'))
    .addStringOption((o) => o.setName('color').setDescription('Hex color, e.g. #5865f2'))
    .addChannelOption((o) =>
      o
        .setName('channel')
        .setDescription('Target channel (defaults to current)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const colorRaw = interaction.options.getString('color');
    const target = interaction.options.getChannel('channel') || interaction.channel;

    if (!title && !description) {
      return interaction.reply({
        embeds: [embed.error('Provide at least a title or a description.')],
        ephemeral: true,
      });
    }

    let color;
    if (colorRaw) {
      color = parseHex(colorRaw);
      if (color === null) {
        return interaction.reply({
          embeds: [embed.error('Invalid hex color. Use a format like `#5865f2`.')],
          ephemeral: true,
        });
      }
    }

    const e = embed.base(color ?? undefined);
    if (title) e.setTitle(title);
    if (description) e.setDescription(description);

    await target.send({ embeds: [e] });
    return interaction.reply({
      embeds: [embed.success(`Embed sent to ${target}.`)],
      ephemeral: true,
    });
  },
};
