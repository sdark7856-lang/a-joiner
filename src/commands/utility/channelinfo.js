const { SlashCommandBuilder, ChannelType } = require('discord.js');
const embed = require('../../lib/embed');

const TYPE_NAMES = {
  [ChannelType.GuildText]: 'Text',
  [ChannelType.GuildVoice]: 'Voice',
  [ChannelType.GuildCategory]: 'Category',
  [ChannelType.GuildAnnouncement]: 'Announcement',
  [ChannelType.GuildStageVoice]: 'Stage',
  [ChannelType.GuildForum]: 'Forum',
  [ChannelType.AnnouncementThread]: 'Announcement Thread',
  [ChannelType.PublicThread]: 'Public Thread',
  [ChannelType.PrivateThread]: 'Private Thread',
};

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Show information about a channel.')
    .addChannelOption((o) => o.setName('channel').setDescription('Channel to look up'))
    .setDMPermission(false),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const e = embed
      .base()
      .setTitle(`📺 ${channel.name}`)
      .addFields(
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: TYPE_NAMES[channel.type] ?? `${channel.type}`, inline: true },
        {
          name: 'Created',
          value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
      );

    if (channel.parent) e.addFields({ name: 'Category', value: channel.parent.name, inline: true });
    if (typeof channel.rateLimitPerUser === 'number') {
      e.addFields({
        name: 'Slowmode',
        value: channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'Off',
        inline: true,
      });
    }
    if (typeof channel.nsfw === 'boolean') {
      e.addFields({ name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true });
    }
    if (channel.topic) e.addFields({ name: 'Topic', value: channel.topic.slice(0, 1024), inline: false });

    return interaction.reply({ embeds: [e] });
  },
};
