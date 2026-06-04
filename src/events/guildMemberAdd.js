const embed = require('../lib/embed');

const joinTracker = new Map(); // guildId -> timestamps[]

function render(template, member) {
  return template
    .replaceAll('{user}', `<@${member.id}>`)
    .replaceAll('{username}', member.user.username)
    .replaceAll('{server}', member.guild.name)
    .replaceAll('{count}', member.guild.memberCount);
}

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const gid = member.guild.id;
    const db = client.db;

    // ----- Account age gate -----
    const minDays = db.getSetting(gid, 'minAccountAge', 0);
    if (minDays > 0) {
      const ageDays = (Date.now() - member.user.createdTimestamp) / 86400000;
      if (ageDays < minDays) {
        await member.send({ embeds: [embed.error(`Your account is too new to join **${member.guild.name}** (must be ${minDays}+ days old).`)] }).catch(() => {});
        await member.kick(`Account younger than ${minDays} days`).catch(() => {});
        return;
      }
    }

    // ----- Anti-raid: detect mass joins -----
    if (db.getSetting(gid, 'antiRaid', false)) {
      const now = Date.now();
      const recent = (joinTracker.get(gid) || []).filter((t) => now - t < 10_000);
      recent.push(now);
      joinTracker.set(gid, recent);
      const threshold = db.getSetting(gid, 'raidThreshold', 8);
      if (recent.length >= threshold) {
        const logId = db.getSetting(gid, 'modLogChannel');
        const log = logId && member.guild.channels.cache.get(logId);
        log?.send({ embeds: [embed.error(`🚨 **Possible raid detected** — ${recent.length} joins in 10s. Consider \`/lockdown on\`.`)] }).catch(() => {});
      }
    }

    // ----- Role persistence (restore previous roles) -----
    const persisted = db.store(gid, 'rolePersistence')[member.id];
    if (persisted?.length) {
      for (const roleId of persisted) member.roles.add(roleId).catch(() => {});
    }

    // ----- Autorole -----
    const autorole = db.getSetting(gid, 'autorole');
    if (autorole) member.roles.add(autorole).catch(() => {});

    // ----- Welcome message -----
    const channelId = db.getSetting(gid, 'welcomeChannel');
    const channel = channelId && member.guild.channels.cache.get(channelId);
    if (channel) {
      const msg = db.getSetting(gid, 'welcomeMessage', '🖤 Welcome {user} to **{server}**! You are member #{count}.');
      channel.send({ embeds: [embed.base(embed.COLORS.success).setDescription(render(msg, member)).setThumbnail(member.user.displayAvatarURL())] }).catch(() => {});
    }

    // ----- Welcome DM -----
    const dm = db.getSetting(gid, 'welcomeDM');
    if (dm) member.send({ embeds: [embed.info(render(dm, member))] }).catch(() => {});
  },
};
