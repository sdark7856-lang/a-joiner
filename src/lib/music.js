/**
 * Per-guild music state + voice helpers for Zah Hub.
 *
 * Voice support is OPTIONAL. `@discordjs/voice` and `play-dl` (plus
 * `libsodium-wrappers` and `ffmpeg-static`) are heavy native/network
 * dependencies that may not be installed in every environment. This module
 * NEVER requires them at the top level; instead `loadVoice()` resolves them
 * lazily inside a try/catch so the bot keeps loading without them.
 */

// Per-guild state map. Shape:
// { queue: [], playing: null, connection: null, player: null,
//   loop: 'off'|'track'|'queue', volume: 100, textChannelId, voiceChannelId }
const states = new Map();

let voiceCache;

/**
 * Attempt to load the optional voice stack. Cached after the first call.
 * Returns { available, voice, playdl }. Never throws.
 */
function loadVoice() {
  if (voiceCache) return voiceCache;
  let voice = null;
  let playdl = null;
  try {
    // eslint-disable-next-line global-require
    voice = require('@discordjs/voice');
    // eslint-disable-next-line global-require
    playdl = require('play-dl');
  } catch {
    voice = null;
    playdl = null;
  }
  voiceCache = { available: Boolean(voice && playdl), voice, playdl };
  return voiceCache;
}

function defaultState() {
  return {
    queue: [],
    playing: null,
    connection: null,
    player: null,
    loop: 'off',
    volume: 100,
    textChannelId: null,
    voiceChannelId: null,
  };
}

function getState(guildId) {
  return states.get(guildId) || null;
}

function getOrCreateState(guildId) {
  let s = states.get(guildId);
  if (!s) {
    s = defaultState();
    states.set(guildId, s);
  }
  return s;
}

function deleteState(guildId) {
  const s = states.get(guildId);
  if (s) {
    try {
      if (s.player) s.player.stop(true);
    } catch {
      /* ignore */
    }
    try {
      if (s.connection) s.connection.destroy();
    } catch {
      /* ignore */
    }
  }
  states.delete(guildId);
}

/**
 * Search play-dl for a track and return a normalized descriptor.
 * Accepts a direct URL or a free-text query. Returns null if nothing found.
 */
async function resolveTrack(query, requestedBy) {
  const { available, playdl } = loadVoice();
  if (!available) return null;

  let info;
  const isUrl = /^https?:\/\//i.test(query);
  if (isUrl) {
    const validated = await playdl.validate(query);
    if (validated === 'yt_video') {
      const yt = await playdl.video_basic_info(query);
      info = yt.video_details;
    }
  }
  if (!info) {
    const results = await playdl.search(query, { limit: 1, source: { youtube: 'video' } });
    if (!results || results.length === 0) return null;
    info = results[0];
  }

  return {
    title: info.title || 'Unknown',
    url: info.url,
    durationRaw: info.durationRaw || info.durationInSec || '0:00',
    durationSec: info.durationInSec || 0,
    thumbnail: (info.thumbnails && info.thumbnails[0] && info.thumbnails[0].url) || null,
    requestedBy: requestedBy || null,
  };
}

/**
 * Begin playback of the head of the queue for a guild. Joins voice if needed,
 * builds an audio player, streams the track via play-dl and wires up an idle
 * handler that advances the queue while honoring the loop mode.
 *
 * Caller is responsible for having pushed at least one track into state.queue.
 */
async function play(client, guild) {
  const { available, voice, playdl } = loadVoice();
  if (!available) return false;

  const state = getOrCreateState(guild.id);

  // Nothing queued -> nothing to do.
  if (state.queue.length === 0) {
    state.playing = null;
    return false;
  }

  const track = state.queue.shift();
  state.playing = track;

  // Establish or reuse the voice connection.
  if (!state.connection) {
    state.connection = voice.joinVoiceChannel({
      channelId: state.voiceChannelId,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
  }

  // Create the player once and subscribe the connection to it.
  if (!state.player) {
    state.player = voice.createAudioPlayer();
    state.connection.subscribe(state.player);

    state.player.on(voice.AudioPlayerStatus.Idle, () => {
      // Track finished: apply loop mode then advance.
      if (state.loop === 'track' && state.playing) {
        state.queue.unshift(state.playing);
      } else if (state.loop === 'queue' && state.playing) {
        state.queue.push(state.playing);
      }
      if (state.queue.length > 0) {
        play(client, guild).catch(() => {});
      } else {
        state.playing = null;
        deleteState(guild.id);
      }
    });

    state.player.on('error', () => {
      // On stream error, try to advance rather than wedge the queue.
      if (state.queue.length > 0) {
        play(client, guild).catch(() => {});
      } else {
        deleteState(guild.id);
      }
    });
  }

  const stream = await playdl.stream(track.url);
  const resource = voice.createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true,
  });
  if (resource.volume) {
    resource.volume.setVolume(Math.max(0, Math.min(200, state.volume)) / 100);
  }
  state.resource = resource;
  state.player.play(resource);

  return true;
}

module.exports = {
  loadVoice,
  getState,
  getOrCreateState,
  deleteState,
  resolveTrack,
  play,
  states,
};
