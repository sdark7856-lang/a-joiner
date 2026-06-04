const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Browse purchasable items.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const items = client.db.getSetting(gid, 'shopItems', []) || [];

    if (items.length === 0) {
      return interaction.reply({
        embeds: [embed.info('The shop is empty. Admins can add items with `/shop-admin additem`.', '🛒 Shop')],
      });
    }

    const lines = items.map((it) => {
      const role = it.roleId ? ` (role <@&${it.roleId}>)` : '';
      return `**${it.id}** — ${it.name} — 🪙 ${Number(it.price).toLocaleString()}${role}`;
    });

    const e = embed
      .base()
      .setTitle('🛒 Shop')
      .setDescription(`${lines.join('\n')}\n\nUse \`/buy <item_id>\` to purchase.`);

    return interaction.reply({ embeds: [e] });
  },
};
