const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const music = require('../../lib/music');

const NEED = '`@discordjs/voice`, `play-dl`, `libsodium-wrappers` and `ffmpeg-static`';

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current queue.')
    .setDMPermission(false),

  async execute(interaction) {
    if (!music.loadVoice().available) {
      return interaction.reply({
        embeds: [embed.error(`Music playback requires ${NEED} to be installed (these need network access to install). It is unavailable here.`, 'Music unavailable')],
        ephemeral: true,
      });
    }

    const state = music.getState(interaction.guild.id);
    if (!state || (!state.playing && state.queue.length === 0)) {
      return interaction.reply({ embeds: [embed.error('The queue is empty.')], ephemeral: true });
    }

    const e = embed.base().setTitle('🎶 Queue');
    if (state.playing) {
      e.addFields({ name: 'Now Playing', value: `[${state.playing.title}](${state.playing.url}) • ${state.playing.durationRaw}` });
    }

    if (state.queue.length > 0) {
      const lines = state.queue
        .slice(0, 10)
        .map((t, i) => `**${i + 1}.** [${t.title}](${t.url}) • ${t.durationRaw}`);
      const extra = state.queue.length > 10 ? `\n…and ${state.queue.length - 10} more` : '';
      e.addFields({ name: `Up Next (${state.queue.length})`, value: lines.join('\n') + extra });
    } else {
      e.addFields({ name: 'Up Next', value: '—' });
    }

    e.setFooter({ text: `Loop: ${state.loop} • Volume: ${state.volume}%` });
    return interaction.reply({ embeds: [e] });
  },
};
