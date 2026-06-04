const embed = require('../lib/embed');
const { runAutomod } = require('../lib/automod');
const { levelForXp } = require('../lib/leveling');

const xpCooldown = new Map(); // `${guild}:${user}` -> timestamp

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    // ----- AFK: clear your own, notify on mentioning others -----
    const afk = client.db.store(message.guild.id, 'afk');
    if (afk[message.author.id]) {
      delete afk[message.author.id];
      client.db.save(message.guild.id);
      const m = await message.reply({ embeds: [embed.info(`👋 Welcome back, I removed your AFK.`)] }).catch(() => null);
      if (m) setTimeout(() => m.delete().catch(() => {}), 5000);
    }
    for (const user of message.mentions.users.values()) {
      if (afk[user.id]) {
        message.reply({ embeds: [embed.info(`💤 **${user.username}** is AFK: ${afk[user.id].reason}`)] }).catch(() => {});
      }
    }

    // ----- Auto-moderation -----
    if (await runAutomod(message, client)) return;

    // ----- XP / leveling -----
    if (client.db.getSetting(message.guild.id, 'levelsEnabled', true) !== false) {
      const key = `${message.guild.id}:${message.author.id}`;
      if (!xpCooldown.has(key) || Date.now() - xpCooldown.get(key) > 60_000) {
        xpCooldown.set(key, Date.now());
        const record = client.db.user(message.guild.id, message.author.id);
        const before = record.level ?? levelForXp(record.xp);
        record.xp += Math.floor(Math.random() * 11) + 15; // 15-25
        const after = levelForXp(record.xp);
        if (after > before) {
          record.level = after;
          await handleLevelUp(message, client, after);
        }
        client.db.save(message.guild.id);
      }
    }
  },
};

async function handleLevelUp(message, client, level) {
  const gid = message.guild.id;
  // Role rewards
  const rewards = client.db.getSetting(gid, 'levelRoles', {}); // { level: roleId }
  if (rewards[level]) {
    message.member.roles.add(rewards[level]).catch(() => {});
  }
  // Announcement
  const channelId = client.db.getSetting(gid, 'levelUpChannel');
  const channel = (channelId && message.guild.channels.cache.get(channelId)) || message.channel;
  channel
    .send({ embeds: [embed.base(embed.COLORS.success).setDescription(`🎉 ${message.author} reached **level ${level}**!`)] })
    .catch(() => {});
}
