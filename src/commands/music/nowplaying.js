const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const music = require('../../lib/music');

const NEED = '`@discordjs/voice`, `play-dl`, `libsodium-wrappers` and `ffmpeg-static`';

function progressBar(ratio, size = 18) {
  const filled = Math.max(0, Math.min(size, Math.round(ratio * size)));
  return '▬'.repeat(filled) + '🔘' + '▬'.repeat(Math.max(0, size - filled - 1));
}

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing track.')
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

    const track = state.playing;
    let elapsedSec = 0;
    try {
      if (state.resource && state.resource.playbackDuration) {
        elapsedSec = state.resource.playbackDuration / 1000;
      }
    } catch {
      elapsedSec = 0;
    }
    const total = track.durationSec || 0;
    const ratio = total > 0 ? Math.min(1, elapsedSec / total) : 0;

    const e = embed
      .base()
      .setTitle('▶️ Now Playing')
      .setDescription(`[${track.title}](${track.url})`)
      .addFields(
        { name: 'Progress', value: `${progressBar(ratio)}\n${fmt(elapsedSec)} / ${total > 0 ? fmt(total) : track.durationRaw}` },
        { name: 'Requested by', value: `${track.requestedBy || '—'}`, inline: true },
        { name: 'Loop', value: state.loop, inline: true },
        { name: 'Volume', value: `${state.volume}%`, inline: true },
      );
    if (track.thumbnail) e.setThumbnail(track.thumbnail);
    return interaction.reply({ embeds: [e] });
  },
};
