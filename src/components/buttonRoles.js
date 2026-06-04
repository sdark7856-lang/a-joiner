const embed = require('../lib/embed');

// customId format: "rr:<roleId>" (button roles + select-menu roles).
module.exports = {
  id: 'rr:',
  async execute(interaction, client) {
    const member = interaction.member;

    // Select menu: values are role IDs.
    if (interaction.isAnySelectMenu()) {
      const added = [];
      for (const roleId of interaction.values) {
        if (!member.roles.cache.has(roleId)) {
          await member.roles.add(roleId).catch(() => {});
          added.push(`<@&${roleId}>`);
        }
      }
      return interaction.reply({ embeds: [embed.success(added.length ? `Added: ${added.join(' ')}` : 'No new roles added.')], ephemeral: true });
    }

    // Button: toggle a single role.
    const roleId = interaction.customId.split(':')[1];
    if (!interaction.guild.roles.cache.has(roleId)) {
      return interaction.reply({ embeds: [embed.error('That role no longer exists.')], ephemeral: true });
    }
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId).catch(() => {});
      return interaction.reply({ embeds: [embed.info(`Removed <@&${roleId}>.`)], ephemeral: true });
    }
    await member.roles.add(roleId).catch(() => {});
    return interaction.reply({ embeds: [embed.success(`Added <@&${roleId}>.`)], ephemeral: true });
  },
};
