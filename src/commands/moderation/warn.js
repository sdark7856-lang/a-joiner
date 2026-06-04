const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { createCase } = require('../../lib/cases');

// Auto-escalation ladder: warn count -> action.
const ESCALATION = { 3: 'mute', 4: 'kick', 5: 'ban' };

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member and track their infractions.')
    .addUserOption((o) => o.setName('user').setDescription('Member to warn').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for the warning'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target) return interaction.reply({ embeds: [embed.error('That user is not in the server.')], ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ embeds: [embed.error("You can't warn yourself.")], ephemeral: true });
    if (target.user.bot) return interaction.reply({ embeds: [embed.error("You can't warn a bot.")], ephemeral: true });

    const record = client.db.user(interaction.guild.id, target.id);
    record.warns.push({ reason, moderator: interaction.user.id, timestamp: Date.now() });
    client.db.save(interaction.guild.id);

    const count = record.warns.length;
    const c = await createCase(client, interaction.guild, {
      action: 'warn', target: target.user, moderator: interaction.user, reason,
    });

    target.send({ embeds: [embed.warn(`You were warned in **${interaction.guild.name}**.\n**Reason:** ${reason}`)] }).catch(() => {});

    let escalation = '';
    const action = ESCALATION[count];
    if (action) {
      try {
        if (action === 'mute') {
          await target.timeout(60 * 60 * 1000, `Auto-escalation: ${count} warns`);
          escalation = '\n⚠️ Auto-muted for 1 hour (3 warns).';
        } else if (action === 'kick' && target.kickable) {
          await target.kick(`Auto-escalation: ${count} warns`);
          escalation = '\n⚠️ Auto-kicked (4 warns).';
        } else if (action === 'ban' && target.bannable) {
          await target.ban({ reason: `Auto-escalation: ${count} warns` });
          escalation = '\n⛔ Auto-banned (5 warns).';
        }
      } catch { /* ignore escalation failure */ }
    }

    return interaction.reply({
      embeds: [embed.success(`**${target.user.tag}** has been warned. (Warn #${count}, Case #${c.id})\n**Reason:** ${reason}${escalation}`)],
    });
  },
};
