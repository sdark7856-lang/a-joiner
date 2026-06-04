const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the server.')
    .addStringOption((o) =>
      o.setName('text').setDescription('Your suggestion').setRequired(true).setMaxLength(1000))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const text = interaction.options.getString('text');

    const channelId = client.db.getSetting(gid, 'suggestionChannel');
    let channel = interaction.channel;
    if (channelId) {
      const resolved = interaction.guild.channels.cache.get(channelId)
        || await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (resolved) channel = resolved;
    }

    const e = embed
      .base()
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('💡 New Suggestion')
      .setDescription(text)
      .setFooter({ text: '👍 0  •  👎 0' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('suggest:up').setLabel('👍').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('suggest:down').setLabel('👎').setStyle(ButtonStyle.Danger),
    );

    try {
      await channel.send({ embeds: [e], components: [row] });
    } catch {
      return interaction.reply({ embeds: [embed.error('I could not post to the suggestions channel. Check my permissions.')], ephemeral: true });
    }

    return interaction.reply({ embeds: [embed.success(`Your suggestion was posted in ${channel}!`)], ephemeral: true });
  },
};
