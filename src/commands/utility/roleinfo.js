const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Show information about a role.')
    .addRoleOption((o) => o.setName('role').setDescription('Role to look up').setRequired(true))
    .setDMPermission(false),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const perms = role.permissions.toArray();
    const hex = `#${role.color.toString(16).padStart(6, '0')}`;

    const e = embed
      .base(role.color || undefined)
      .setTitle(`🎭 ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.color ? hex : 'None', inline: true },
        { name: 'Position', value: `${role.position}`, inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Members', value: `${role.members.size}`, inline: true },
        {
          name: 'Created',
          value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`,
          inline: false,
        },
        {
          name: `Permissions [${perms.length}]`,
          value: perms.length ? perms.join(', ').slice(0, 1024) : 'None',
          inline: false,
        },
      );

    return interaction.reply({ embeds: [e] });
  },
};
