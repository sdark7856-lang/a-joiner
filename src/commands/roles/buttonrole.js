const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const embed = require('../../lib/embed');

const STYLES = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
};

module.exports = {
  category: 'roles',
  data: new SlashCommandBuilder()
    .setName('button-role')
    .setDescription('Post a button that toggles a role when clicked.')
    .addRoleOption((o) => o.setName('role').setDescription('Role to toggle').setRequired(true))
    .addStringOption((o) => o.setName('label').setDescription('Button label (default: role name)'))
    .addStringOption((o) => o.setName('emoji').setDescription('Button emoji'))
    .addStringOption((o) =>
      o
        .setName('color')
        .setDescription('Button color')
        .addChoices(
          { name: 'Primary', value: 'primary' },
          { name: 'Secondary', value: 'secondary' },
          { name: 'Success', value: 'success' },
          { name: 'Danger', value: 'danger' },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const label = interaction.options.getString('label') || role.name;
    const emoji = interaction.options.getString('emoji');
    const color = interaction.options.getString('color') || 'primary';

    const button = new ButtonBuilder()
      .setCustomId(`rr:${role.id}`)
      .setLabel(label)
      .setStyle(STYLES[color] || ButtonStyle.Primary);
    if (emoji) {
      try {
        button.setEmoji(emoji);
      } catch {
        /* ignore invalid emoji */
      }
    }

    const row = new ActionRowBuilder().addComponents(button);
    const e = embed
      .base()
      .setTitle('🎭 Self Role')
      .setDescription(`Click the button below to toggle ${role}.`);

    await interaction.channel.send({ embeds: [e], components: [row] });
    return interaction.reply({
      embeds: [embed.success(`Button role message posted for ${role}.`)],
      ephemeral: true,
    });
  },
};
