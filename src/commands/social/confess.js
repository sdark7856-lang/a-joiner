const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Post an anonymous confession.')
    .addStringOption((o) =>
      o.setName('text').setDescription('Your confession').setRequired(true).setMaxLength(1000))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const text = interaction.options.getString('text');

    const channelId = client.db.getSetting(gid, 'confessionChannel');
    let channel = interaction.channel;
    if (channelId) {
      const resolved = interaction.guild.channels.cache.get(channelId)
        || await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (resolved) channel = resolved;
    }

    // Embed intentionally contains no author info to stay anonymous.
    const e = embed
      .base()
      .setTitle('🤫 Anonymous Confession')
      .setDescription(text)
      .setFooter({ text: 'Sent anonymously' });

    try {
      await channel.send({ embeds: [e] });
    } catch {
      return interaction.reply({ embeds: [embed.error('I could not post to the confessions channel. Check my permissions.')], ephemeral: true });
    }

    return interaction.reply({ embeds: [embed.success('Your confession was posted anonymously.')], ephemeral: true });
  },
};
