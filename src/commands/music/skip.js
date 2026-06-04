const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const music = require('../../lib/music');

const NEED = '`@discordjs/voice`, `play-dl`, `libsodium-wrappers` and `ffmpeg-static`';

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current track.')
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

    const skipped = state.playing;
    // Stopping the player triggers the Idle handler which advances the queue.
    if (state.player) state.player.stop();
    return interaction.reply({ embeds: [embed.success(`Skipped **${skipped.title}**.`)] });
  },
};
