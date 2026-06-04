const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../lib/embed');

async function resolve(reaction) {
  if (reaction.partial) await reaction.fetch().catch(() => {});
  if (reaction.message.partial) await reaction.message.fetch().catch(() => {});
  return reaction;
}

function emojiKey(reaction) {
  return reaction.emoji.id || reaction.emoji.name;
}

module.exports = [
  {
    name: 'messageReactionAdd',
    async execute(reaction, user, client) {
      if (user.bot) return;
      await resolve(reaction);
      const guild = reaction.message.guild;
      if (!guild) return;

      // ----- Reaction roles -----
      const rr = client.db.getSetting(guild.id, 'reactionRoles', {});
      const roleId = rr[reaction.message.id]?.[emojiKey(reaction)];
      if (roleId) {
        const member = await guild.members.fetch(user.id).catch(() => null);
        member?.roles.add(roleId).catch(() => {});
      }

      // ----- Starboard -----
      if (reaction.emoji.name === '⭐') {
        const starChannelId = client.db.getSetting(guild.id, 'starboardChannel');
        if (!starChannelId) return;
        const threshold = client.db.getSetting(guild.id, 'starThreshold', 3);
        if (reaction.count < threshold) return;
        const starred = client.db.store(guild.id, 'starred');
        if (starred[reaction.message.id]) return;
        const channel = guild.channels.cache.get(starChannelId);
        if (!channel) return;
        const msg = reaction.message;
        const e = new EmbedBuilder()
          .setColor(COLORS.warn)
          .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
          .setDescription(msg.content || '*no text*')
          .addFields({ name: 'Source', value: `[Jump to message](${msg.url})` })
          .setTimestamp();
        const img = msg.attachments.first();
        if (img) e.setImage(img.url);
        const sent = await channel.send({ content: `⭐ **${reaction.count}** | ${msg.channel}`, embeds: [e] }).catch(() => null);
        if (sent) { starred[msg.id] = sent.id; client.db.save(guild.id); }
      }
    },
  },
  {
    name: 'messageReactionRemove',
    async execute(reaction, user, client) {
      if (user.bot) return;
      await resolve(reaction);
      const guild = reaction.message.guild;
      if (!guild) return;
      const rr = client.db.getSetting(guild.id, 'reactionRoles', {});
      const roleId = rr[reaction.message.id]?.[emojiKey(reaction)];
      if (roleId) {
        const member = await guild.members.fetch(user.id).catch(() => null);
        member?.roles.remove(roleId).catch(() => {});
      }
    },
  },
];
