const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View the items a user owns.')
    .addUserOption((o) => o.setName('user').setDescription('User to check'))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const target = interaction.options.getUser('user') || interaction.user;
    const rec = client.db.user(gid, target.id);
    const inventory = Array.isArray(rec.inventory) ? rec.inventory : [];

    if (inventory.length === 0) {
      return interaction.reply({
        embeds: [embed.info(`${target.username} has no items. Buy some with \`/shop\` and \`/buy\`.`, '🎒 Inventory')],
      });
    }

    const counts = new Map();
    for (const it of inventory) {
      const key = it.name || it.id;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const lines = [...counts.entries()].map(([name, count]) => `• ${name}${count > 1 ? ` ×${count}` : ''}`);

    const e = embed
      .base()
      .setTitle(`🎒 ${target.username}'s inventory`)
      .setDescription(lines.join('\n'));

    return interaction.reply({ embeds: [e] });
  },
};
