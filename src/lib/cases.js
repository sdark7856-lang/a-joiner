const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('./embed');

const ACTION_COLORS = {
  warn: COLORS.warn,
  mute: 0xe67e22,
  unmute: COLORS.success,
  kick: 0xe74c3c,
  ban: COLORS.error,
  unban: COLORS.success,
  softban: COLORS.error,
  lock: 0x95a5a6,
  unlock: COLORS.success,
};

/**
 * Create a moderation case, persist it, and post it to the configured mod-log
 * channel. Returns the created case object (with its incremental id).
 */
async function createCase(client, guild, { action, target, moderator, reason, duration }) {
  const db = client.db;
  const data = db.data(guild.id);
  const id = (data.cases.at(-1)?.id || 0) + 1;

  const record = {
    id,
    action,
    targetId: target?.id ?? null,
    targetTag: target?.tag ?? target?.user?.tag ?? 'Unknown',
    moderatorId: moderator?.id ?? null,
    moderatorTag: moderator?.tag ?? 'System',
    reason: reason || 'No reason provided',
    duration: duration || null,
    timestamp: Date.now(),
  };
  data.cases.push(record);
  db.save(guild.id);

  const logChannelId = db.getSetting(guild.id, 'modLogChannel');
  if (logChannelId) {
    const channel = guild.channels.cache.get(logChannelId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(ACTION_COLORS[action] || COLORS.brand)
        .setAuthor({ name: `Case #${id} • ${action.toUpperCase()}` })
        .addFields(
          { name: 'User', value: `${record.targetTag} (${record.targetId})`, inline: true },
          { name: 'Moderator', value: record.moderatorTag, inline: true },
          { name: 'Reason', value: record.reason },
        )
        .setTimestamp();
      if (duration) embed.addFields({ name: 'Duration', value: duration, inline: true });
      channel.send({ embeds: [embed] }).catch(() => {});
    }
  }
  return record;
}

function getCase(client, guildId, id) {
  return client.db.data(guildId).cases.find((c) => c.id === id) || null;
}

module.exports = { createCase, getCase, ACTION_COLORS };
