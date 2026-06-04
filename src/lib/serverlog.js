const { EmbedBuilder } = require('discord.js');

/** Send an embed to the guild's configured audit-log channel, if set. */
function sendLog(guild, client, embedBuilder) {
  const id = client.db.getSetting(guild.id, 'logChannel');
  if (!id) return;
  const channel = guild.channels.cache.get(id);
  channel?.send({ embeds: [embedBuilder] }).catch(() => {});
}

function logEmbed(color, author) {
  return new EmbedBuilder().setColor(color).setAuthor({ name: author }).setTimestamp();
}

module.exports = { sendLog, logEmbed };
