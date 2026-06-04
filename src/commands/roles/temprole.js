const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { parseDuration, formatDuration } = require('../../lib/duration');

module.exports = {
  category: 'roles',
  data: new SlashCommandBuilder()
    .setName('temp-role')
    .setDescription('Give a member a role for a limited time.')
    .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
    .addRoleOption((o) => o.setName('role').setDescription('Role to assign').setRequired(true))
    .addStringOption((o) =>
      o.setName('duration').setDescription('Duration (e.g. 10m, 2h, 1d)').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    const durationStr = interaction.options.getString('duration');

    const ms = parseDuration(durationStr);
    if (!ms) {
      return interaction.reply({
        embeds: [embed.error('Invalid duration. Use formats like `10m`, `2h` or `1d`.')],
        ephemeral: true,
      });
    }

    if (!member) {
      return interaction.reply({
        embeds: [embed.error('That user is not in the server.')],
        ephemeral: true,
      });
    }

    if (!role.editable) {
      return interaction.reply({
        embeds: [embed.error("I can't assign that role (it's above my highest role).")],
        ephemeral: true,
      });
    }

    try {
      await member.roles.add(role);
    } catch {
      return interaction.reply({
        embeds: [embed.error('Failed to add the role to that member.')],
        ephemeral: true,
      });
    }

    setTimeout(() => {
      member.roles.remove(role).catch(() => {});
    }, ms);

    return interaction.reply({
      embeds: [
        embed.success(`Gave ${role} to **${member.user.tag}** for **${formatDuration(ms)}**.`),
      ],
    });
  },
};
