const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

const KEY_PERMS = [
  ['Administrator', PermissionFlagsBits.Administrator],
  ['ManageGuild', PermissionFlagsBits.ManageGuild],
  ['ManageRoles', PermissionFlagsBits.ManageRoles],
  ['ManageChannels', PermissionFlagsBits.ManageChannels],
  ['ManageMessages', PermissionFlagsBits.ManageMessages],
  ['KickMembers', PermissionFlagsBits.KickMembers],
  ['BanMembers', PermissionFlagsBits.BanMembers],
  ['ModerateMembers', PermissionFlagsBits.ModerateMembers],
  ['MentionEveryone', PermissionFlagsBits.MentionEveryone],
];

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Show detailed info about a member.')
    .addUserOption((o) => o.setName('user').setDescription('User to look up'))
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const e = embed
      .base()
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        {
          name: 'Account Created',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: false,
        },
      );

    if (member) {
      if (member.joinedTimestamp) {
        e.addFields({
          name: 'Joined Server',
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
          inline: false,
        });
      }

      const roles = member.roles.cache
        .filter((r) => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => r.toString());
      e.addFields({
        name: `Roles [${roles.length}]`,
        value: roles.length ? roles.slice(0, 25).join(' ') : 'None',
        inline: false,
      });

      const perms = KEY_PERMS.filter(([, flag]) => member.permissions.has(flag)).map(([name]) => name);
      e.addFields({
        name: 'Key Permissions',
        value: perms.length ? perms.join(', ') : 'None',
        inline: false,
      });
    }

    return interaction.reply({ embeds: [e] });
  },
};
