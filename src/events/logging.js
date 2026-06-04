// Audit-style logging for message/channel/role/voice/nickname changes.
// All handlers post to the guild's configured `logChannel`.
const { sendLog, logEmbed } = require('../lib/serverlog');
const { COLORS } = require('../lib/embed');

module.exports = [
  {
    name: 'messageDelete',
    execute(message, client) {
      if (!message.guild || message.author?.bot) return;
      sendLog(message.guild, client,
        logEmbed(COLORS.error, '🗑️ Message Deleted')
          .setDescription(`**Author:** ${message.author ?? 'Unknown'}\n**Channel:** ${message.channel}`)
          .addFields({ name: 'Content', value: (message.content || '*no text*').slice(0, 1024) }));
    },
  },
  {
    name: 'messageUpdate',
    execute(oldMsg, newMsg, client) {
      if (!newMsg.guild || newMsg.author?.bot || oldMsg.content === newMsg.content) return;
      sendLog(newMsg.guild, client,
        logEmbed(COLORS.warn, '✏️ Message Edited')
          .setDescription(`**Author:** ${newMsg.author}\n**Channel:** ${newMsg.channel}\n[Jump](${newMsg.url})`)
          .addFields(
            { name: 'Before', value: (oldMsg.content || '*unknown*').slice(0, 1024) },
            { name: 'After', value: (newMsg.content || '*unknown*').slice(0, 1024) }));
    },
  },
  {
    name: 'channelCreate',
    execute(channel, client) {
      if (!channel.guild) return;
      sendLog(channel.guild, client, logEmbed(COLORS.success, '📁 Channel Created').setDescription(`**${channel.name}** (${channel})`));
    },
  },
  {
    name: 'channelDelete',
    execute(channel, client) {
      if (!channel.guild) return;
      sendLog(channel.guild, client, logEmbed(COLORS.error, '📁 Channel Deleted').setDescription(`**#${channel.name}**`));
    },
  },
  {
    name: 'roleCreate',
    execute(role, client) {
      sendLog(role.guild, client, logEmbed(COLORS.success, '🎭 Role Created').setDescription(`${role} (${role.name})`));
    },
  },
  {
    name: 'roleDelete',
    execute(role, client) {
      sendLog(role.guild, client, logEmbed(COLORS.error, '🎭 Role Deleted').setDescription(`**${role.name}**`));
    },
  },
  {
    name: 'guildMemberUpdate',
    execute(oldM, newM, client) {
      if (oldM.nickname !== newM.nickname) {
        sendLog(newM.guild, client, logEmbed(COLORS.info, '📝 Nickname Changed')
          .setDescription(`**Member:** ${newM.user}\n**Before:** ${oldM.nickname || '*none*'}\n**After:** ${newM.nickname || '*none*'}`));
      }
      const added = newM.roles.cache.filter((r) => !oldM.roles.cache.has(r.id));
      const removed = oldM.roles.cache.filter((r) => !newM.roles.cache.has(r.id));
      if (added.size || removed.size) {
        const parts = [];
        if (added.size) parts.push(`**+** ${added.map((r) => r).join(' ')}`);
        if (removed.size) parts.push(`**−** ${removed.map((r) => r).join(' ')}`);
        sendLog(newM.guild, client, logEmbed(COLORS.info, '🎭 Roles Updated').setDescription(`**Member:** ${newM.user}\n${parts.join('\n')}`));
      }
    },
  },
  {
    name: 'voiceStateUpdate',
    execute(oldS, newS, client) {
      const guild = newS.guild;
      const user = newS.member?.user;
      if (!user) return;
      if (!oldS.channel && newS.channel) sendLog(guild, client, logEmbed(COLORS.success, '🔊 Voice Join').setDescription(`${user} joined **${newS.channel.name}**`));
      else if (oldS.channel && !newS.channel) sendLog(guild, client, logEmbed(COLORS.error, '🔇 Voice Leave').setDescription(`${user} left **${oldS.channel.name}**`));
      else if (oldS.channel?.id !== newS.channel?.id) sendLog(guild, client, logEmbed(COLORS.info, '🔀 Voice Move').setDescription(`${user}: **${oldS.channel.name}** → **${newS.channel.name}**`));
    },
  },
];
