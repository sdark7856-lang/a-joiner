const { SlashCommandBuilder, ChannelType } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show information about this server.')
    .setDMPermission(false),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner().catch(() => null);
    const channels = guild.channels.cache;
    const text = channels.filter((c) => c.type === ChannelType.GuildText).size;
    const voice = channels.filter(
      (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice,
    ).size;
    const categories = channels.filter((c) => c.type === ChannelType.GuildCategory).size;

    const e = embed
      .base()
      .setTitle(`🏰 ${guild.name}`)
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Owner', value: owner ? owner.user.tag : 'Unknown', inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Text Channels', value: `${text}`, inline: true },
        { name: 'Voice Channels', value: `${voice}`, inline: true },
        { name: 'Categories', value: `${categories}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        {
          name: 'Boosts',
          value: `Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`,
          inline: true,
        },
        {
          name: 'Created',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
      );

    const icon = guild.iconURL({ size: 256 });
    if (icon) e.setThumbnail(icon);

    return interaction.reply({ embeds: [e] });
  },
};
