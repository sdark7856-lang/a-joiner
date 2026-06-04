const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban then instantly unban a member to wipe their recent messages.')
    .addUserOption((o) => o.setName('user').setDescription('Member to softban').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const member = interaction.options.getMember('user');
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (member && !member.bannable) return interaction.reply({ embeds: [embed.error("I can't softban that member (role hierarchy).")], ephemeral: true });

    await user.send({ embeds: [embed.warn(`You were softbanned (kicked + messages wiped) from **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});
    await interaction.guild.bans.create(user.id, { reason: `Softban: ${reason}`, deleteMessageSeconds: 86400 });
    await interaction.guild.bans.remove(user.id, 'Softban auto-unban');

    const c = await createCase(client, interaction.guild, {
      action: 'softban', target: user, moderator: interaction.user, reason,
    });
    return interaction.reply({ embeds: [embed.success(`Softbanned **${user.tag}** and wiped their recent messages. (Case #${c.id})`)] });
  },
};
