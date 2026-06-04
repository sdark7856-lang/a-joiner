const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const { parseDuration, formatDuration } = require('../../lib/duration');

const MAX_MS = 24 * 60 * 60 * 1000;

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder (max 24h).')
    .addStringOption((o) =>
      o.setName('time').setDescription('When, e.g. 10m, 2h, 1d').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('message').setDescription('What to remind you about').setRequired(true),
    )
    .setDMPermission(false),

  async execute(interaction) {
    const timeRaw = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const ms = parseDuration(timeRaw);

    if (!ms) {
      return interaction.reply({
        embeds: [embed.error('Invalid time. Use a format like `10m`, `2h`, or `1d`.')],
        ephemeral: true,
      });
    }

    if (ms > MAX_MS) {
      return interaction.reply({
        embeds: [embed.error('The maximum reminder duration is **24h**.')],
        ephemeral: true,
      });
    }

    const when = Math.floor((Date.now() + ms) / 1000);
    const user = interaction.user;
    const channel = interaction.channel;

    setTimeout(async () => {
      const e = embed
        .base()
        .setTitle('⏰ Reminder')
        .setDescription(message)
        .setFooter({ text: `Set ${formatDuration(ms)} ago` });
      try {
        await user.send({ embeds: [e] });
      } catch {
        if (channel) {
          channel.send({ content: `${user}`, embeds: [e] }).catch(() => {});
        }
      }
    }, ms);

    return interaction.reply({
      embeds: [embed.success(`I'll remind you <t:${when}:R> about: ${message}`)],
    });
  },
};
