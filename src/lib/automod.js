const { PermissionFlagsBits } = require('discord.js');
const embed = require('./embed');

const INVITE_RE = /(discord\.(gg|io|me|li)\/|discordapp\.com\/invite\/|discord\.com\/invite\/)/i;
const LINK_RE = /https?:\/\/[^\s]+/i;
const DEFAULT_PROFANITY = ['nigger', 'faggot', 'retard', 'kike', 'cunt'];

// In-memory spam tracker: userId -> array of recent timestamps.
const spamMap = new Map();

function capsRatio(text) {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 8) return 0;
  const upper = letters.replace(/[^A-Z]/g, '').length;
  return upper / letters.length;
}

/**
 * Runs enabled auto-mod filters against a message. Returns the triggered
 * reason string (and deletes the message) or null if nothing fired.
 */
async function runAutomod(message, client) {
  const cfg = client.db.getSetting(message.guild.id, 'automod', {});
  if (!Object.values(cfg).some(Boolean)) return null;
  // Staff & mods are exempt.
  if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return null;

  const content = message.content;
  let reason = null;

  if (cfg.antiInvite && INVITE_RE.test(content)) reason = 'Posting Discord invites';
  else if (cfg.antiLink && LINK_RE.test(content)) reason = 'Posting links';
  else if (cfg.antiMention && message.mentions.users.size > 5) reason = 'Mass mentions';
  else if (cfg.antiCaps && capsRatio(content) > 0.7) reason = 'Excessive caps';
  else if (cfg.profanity) {
    const list = client.db.getSetting(message.guild.id, 'profanityList', DEFAULT_PROFANITY);
    const lower = content.toLowerCase();
    if (list.some((w) => lower.includes(w))) reason = 'Prohibited language';
  }

  if (!reason && cfg.antiSpam) {
    const now = Date.now();
    const recent = (spamMap.get(message.author.id) || []).filter((t) => now - t < 5000);
    recent.push(now);
    spamMap.set(message.author.id, recent);
    if (recent.length >= 5) {
      reason = 'Spam / message flood';
      spamMap.set(message.author.id, []);
      message.member?.timeout(5 * 60 * 1000, 'Auto-mod: spam').catch(() => {});
    }
  }

  if (reason) {
    await message.delete().catch(() => {});
    const warn = await message.channel
      .send({ content: `<@${message.author.id}>`, embeds: [embed.warn(`Message removed — **${reason}**.`)] })
      .catch(() => null);
    if (warn) setTimeout(() => warn.delete().catch(() => {}), 5000);

    const logId = client.db.getSetting(message.guild.id, 'modLogChannel');
    const log = logId && message.guild.channels.cache.get(logId);
    if (log) {
      log.send({
        embeds: [embed.base(embed.COLORS.warn).setAuthor({ name: 'Auto-Mod' })
          .setDescription(`**${message.author.tag}** in ${message.channel} — ${reason}`)
          .addFields({ name: 'Content', value: content.slice(0, 1000) || '*none*' })],
      }).catch(() => {});
    }
    return reason;
  }
  return null;
}

module.exports = { runAutomod };
