const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop.')
    .addStringOption((o) => o.setName('item_id').setDescription('The id of the item to buy').setRequired(true))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const itemId = interaction.options.getString('item_id');
    const items = client.db.getSetting(gid, 'shopItems', []) || [];

    const item = items.find((it) => it.id === itemId);
    if (!item) {
      return interaction.reply({ embeds: [embed.error(`No shop item found with id \`${itemId}\`. Use \`/shop\` to browse.`)], ephemeral: true });
    }

    const rec = client.db.user(gid, interaction.user.id);
    const price = Number(item.price) || 0;
    if ((rec.coins || 0) < price) {
      return interaction.reply({
        embeds: [embed.error(`You need 🪙 **${price.toLocaleString()}** coins but only have 🪙 ${(rec.coins || 0).toLocaleString()}.`)],
        ephemeral: true,
      });
    }

    if (item.roleId) {
      const member = interaction.member;
      if (member.roles.cache.has(item.roleId)) {
        return interaction.reply({ embeds: [embed.error('You already own that role.')], ephemeral: true });
      }
      try {
        await member.roles.add(item.roleId);
      } catch {
        return interaction.reply({
          embeds: [embed.error('I could not assign that role. Make sure my role is above it and I have Manage Roles.')],
          ephemeral: true,
        });
      }
    }

    rec.coins = (rec.coins || 0) - price;
    if (!item.roleId) {
      if (!Array.isArray(rec.inventory)) rec.inventory = [];
      rec.inventory.push({ id: item.id, name: item.name });
    }
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.success(`You bought **${item.name}** for 🪙 **${price.toLocaleString()}** coins.\nWallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
    });
  },
};
