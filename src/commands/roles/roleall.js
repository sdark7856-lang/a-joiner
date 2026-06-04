const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'roles',
  data: new SlashCommandBuilder()
    .setName('role-all')
    .setDescription('Add a role to every (non-bot) member.')
    .addRoleOption((o) => o.setName('role').setDescription('Role to add').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    if (!role.editable) {
      return interaction.reply({
        embeds: [embed.error("I can't assign that role (it's above my highest role).")],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const members = await interaction.guild.members.fetch();
    let added = 0;
    let skipped = 0;

    for (const member of members.values()) {
      if (member.user.bot) continue;
      if (member.roles.cache.has(role.id)) continue;
      if (!member.manageable) {
        skipped++;
        continue;
      }
      try {
        await member.roles.add(role);
        added++;
      } catch {
        skipped++;
      }
    }

    return interaction.editReply({
      embeds: [
        embed.success(
          `Added ${role} to **${added}** member(s).` + (skipped ? ` Skipped **${skipped}** I couldn't manage.` : ''),
        ),
      ],
    });
  },
};
