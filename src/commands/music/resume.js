const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const music = require('../../lib/music');

const NEED = '`@discordjs/voice`, `play-dl`, `libsodium-wrappers` and `ffmpeg-static`';

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume playback.')
    .setDMPermission(false),

  async execute(interaction) {
    if (!music.loadVoice().available) {
      return interaction.reply({
        embeds: [embed.error(`Music playback requires ${NEED} to be installed (these need network access to install). It is unavailable here.`, 'Music unavailable')],
        ephemeral: true,
      });
    }

    const state = music.getState(interaction.guild.id);
    if (!state || !state.playing || !state.player) {
      return interaction.reply({ embeds: [embed.error('Nothing is currently playing.')], ephemeral: true });
    }

    const ok = state.player.unpause();
    if (!ok) {
      return interaction.reply({ embeds: [embed.warn('Playback is not paused.')], ephemeral: true });
    }
    return interaction.reply({ embeds: [embed.success('Resumed playback.')] });
  },
};
