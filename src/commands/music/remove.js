const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const music = require('../../lib/music');

const NEED = '`@discordjs/voice`, `play-dl`, `libsodium-wrappers` and `ffmpeg-static`';

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a track from the queue by position.')
    .addIntegerOption((o) =>
      o.setName('position').setDescription('Queue position (see /queue)').setRequired(true).setMinValue(1))
    .setDMPermission(false),

  async execute(interaction) {
    if (!music.loadVoice().available) {
      return interaction.reply({
        embeds: [embed.error(`Music playback requires ${NEED} to be installed (these need network access to install). It is unavailable here.`, 'Music unavailable')],
        ephemeral: true,
      });
    }

    const state = music.getState(interaction.guild.id);
    if (!state || state.queue.length === 0) {
      return interaction.reply({ embeds: [embed.error('The queue is empty.')], ephemeral: true });
    }

    const position = interaction.options.getInteger('position');
    if (position > state.queue.length) {
      return interaction.reply({ embeds: [embed.error(`There is no track at position **${position}**. The queue has **${state.queue.length}** track(s).`)], ephemeral: true });
    }

    const [removed] = state.queue.splice(position - 1, 1);
    return interaction.reply({ embeds: [embed.success(`Removed **${removed.title}** from the queue.`)] });
  },
};
