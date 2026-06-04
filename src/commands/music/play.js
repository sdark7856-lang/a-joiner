const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const music = require('../../lib/music');

const NEED = '`@discordjs/voice`, `play-dl`, `libsodium-wrappers` and `ffmpeg-static`';

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a track or add it to the queue.')
    .addStringOption((o) =>
      o.setName('query').setDescription('A search term or YouTube URL').setRequired(true))
    .setDMPermission(false),

  async execute(interaction, client) {
    if (!music.loadVoice().available) {
      return interaction.reply({
        embeds: [embed.error(`Music playback requires ${NEED} to be installed (these need network access to install). It is unavailable here.`, 'Music unavailable')],
        ephemeral: true,
      });
    }

    const member = interaction.member;
    const voiceChannel = member && member.voice && member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        embeds: [embed.error('You must be in a voice channel to play music.')],
        ephemeral: true,
      });
    }

    const query = interaction.options.getString('query');
    await interaction.deferReply();

    let track;
    try {
      track = await music.resolveTrack(query, interaction.user.tag);
    } catch {
      track = null;
    }
    if (!track) {
      return interaction.editReply({ embeds: [embed.error(`No results found for **${query}**.`)] });
    }

    const state = music.getOrCreateState(interaction.guild.id);
    state.textChannelId = interaction.channelId;
    state.voiceChannelId = voiceChannel.id;
    state.queue.push(track);

    const wasIdle = !state.playing;
    if (wasIdle) {
      try {
        await music.play(client, interaction.guild);
      } catch {
        music.deleteState(interaction.guild.id);
        return interaction.editReply({ embeds: [embed.error('Failed to start playback.')] });
      }
    }

    const e = embed
      .base()
      .setTitle(wasIdle ? '▶️ Now Playing' : '➕ Added to Queue')
      .setDescription(`[${track.title}](${track.url})`)
      .addFields(
        { name: 'Duration', value: `${track.durationRaw}`, inline: true },
        { name: 'Position', value: wasIdle ? 'Now' : `#${state.queue.length}`, inline: true },
        { name: 'Requested by', value: `${track.requestedBy}`, inline: true },
      );
    if (track.thumbnail) e.setThumbnail(track.thumbnail);
    return interaction.editReply({ embeds: [e] });
  },
};
