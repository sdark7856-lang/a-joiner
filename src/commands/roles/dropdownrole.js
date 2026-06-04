const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'roles',
  data: (() => {
    const b = new SlashCommandBuilder()
      .setName('dropdown-role')
      .setDescription('Post a dropdown menu that lets members pick roles.')
      .addStringOption((o) => o.setName('title').setDescription('Menu title').setRequired(true))
      .addRoleOption((o) => o.setName('role1').setDescription('Role 1').setRequired(true));
    for (let i = 2; i <= 5; i++) {
      b.addRoleOption((o) => o.setName(`role${i}`).setDescription(`Role ${i}`));
    }
    return b
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .setDMPermission(false);
  })(),

  async execute(interaction) {
    const title = interaction.options.getString('title');

    const roles = [];
    const seen = new Set();
    for (let i = 1; i <= 5; i++) {
      const role = interaction.options.getRole(`role${i}`);
      if (role && !seen.has(role.id)) {
        seen.add(role.id);
        roles.push(role);
      }
    }

    if (roles.length === 0) {
      return interaction.reply({
        embeds: [embed.error('You must provide at least one role.')],
        ephemeral: true,
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('rr:menu')
      .setPlaceholder('Select your roles')
      .setMinValues(0)
      .setMaxValues(roles.length)
      .addOptions(
        roles.map((role) =>
          new StringSelectMenuOptionBuilder().setLabel(role.name).setValue(role.id),
        ),
      );

    const row = new ActionRowBuilder().addComponents(menu);
    const e = embed.base().setTitle(`🎭 ${title}`).setDescription('Use the menu below to manage your roles.');

    await interaction.channel.send({ embeds: [e], components: [row] });
    return interaction.reply({
      embeds: [embed.success(`Dropdown role menu posted with ${roles.length} role(s).`)],
      ephemeral: true,
    });
  },
};
