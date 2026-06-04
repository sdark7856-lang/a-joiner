const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const music = require('../../lib/music');

const NEED = '`@discordjs/voice`, `play-dl`, `libsodium-wrappers` and `ffmpeg-static`';

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the playback volume (0-200).')
    .addIntegerOption((o) =>
      o.setName('percent').setDescription('Volume percentage').setRequired(true)
        .setMinValue(0).setMaxValue(200))
    .setDMPermission(false),

  async execute(interaction) {
    if (!music.loadVoice().available) {
      return interaction.reply({
        embeds: [embed.error(`Music playback requires ${NEED} to be installed (these need network access to install). It is unavailable here.`, 'Music unavailable')],
        ephemeral: true,
      });
    }

    const state = music.getState(interaction.guild.id);
    if (!state || !state.playing) {
      return interaction.reply({ embeds: [embed.error('Nothing is currently playing.')], ephemeral: true });
    }

    const percent = interaction.options.getInteger('percent');
    state.volume = percent;
    try {
      if (state.resource && state.resource.volume) {
        state.resource.volume.setVolume(percent / 100);
      }
    } catch {
      /* resource may not support inline volume */
    }
    return interaction.reply({ embeds: [embed.success(`Volume set to **${percent}%**.`)] });
  },
};
