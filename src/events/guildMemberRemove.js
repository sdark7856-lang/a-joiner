const embed = require('../lib/embed');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const gid = member.guild.id;
    const db = client.db;

    // Save roles for persistence on rejoin.
    const roles = member.roles.cache.filter((r) => r.id !== gid && !r.managed).map((r) => r.id);
    db.store(gid, 'rolePersistence')[member.id] = roles;
    db.save(gid);

    const channelId = db.getSetting(gid, 'goodbyeChannel') || db.getSetting(gid, 'welcomeChannel');
    const channel = channelId && member.guild.channels.cache.get(channelId);
    if (channel) {
      const msg = db.getSetting(gid, 'goodbyeMessage', '👋 **{username}** left **{server}**. We’re now {count} members.');
      const rendered = msg
        .replaceAll('{user}', member.user.username)
        .replaceAll('{username}', member.user.username)
        .replaceAll('{server}', member.guild.name)
        .replaceAll('{count}', member.guild.memberCount);
      channel.send({ embeds: [embed.base(embed.COLORS.error).setDescription(rendered)] }).catch(() => {});
    }
  },
};
