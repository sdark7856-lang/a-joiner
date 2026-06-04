const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change or reset a member’s nickname.')
    .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
    .addStringOption((o) => o.setName('nickname').setDescription('New nickname (leave empty to reset)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .setDMPermission(false),

  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const nick = interaction.options.getString('nickname');
    if (!member) return interaction.reply({ embeds: [embed.error('That user is not in the server.')], ephemeral: true });
    if (!member.manageable) return interaction.reply({ embeds: [embed.error("I can't change that member's nickname (role hierarchy).")], ephemeral: true });

    await member.setNickname(nick || null);
    return interaction.reply({
      embeds: [embed.success(nick ? `Set **${member.user.tag}**'s nickname to **${nick}**.` : `Reset **${member.user.tag}**'s nickname.`)],
    });
  },
};
