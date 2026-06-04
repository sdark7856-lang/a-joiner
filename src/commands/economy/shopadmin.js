const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('shop-admin')
    .setDescription('Manage the server shop items.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((sub) =>
      sub
        .setName('additem')
        .setDescription('Add an item to the shop.')
        .addStringOption((o) => o.setName('name').setDescription('Item name').setRequired(true))
        .addIntegerOption((o) => o.setName('price').setDescription('Price in coins').setRequired(true).setMinValue(1))
        .addRoleOption((o) => o.setName('role').setDescription('Role to grant when purchased')),
    )
    .addSubcommand((sub) =>
      sub
        .setName('removeitem')
        .setDescription('Remove an item from the shop.')
        .addStringOption((o) => o.setName('id').setDescription('Item id to remove').setRequired(true)),
    ),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const items = client.db.getSetting(gid, 'shopItems', []) || [];

    if (sub === 'additem') {
      const name = interaction.options.getString('name');
      const price = interaction.options.getInteger('price');
      const role = interaction.options.getRole('role');

      if (price <= 0) {
        return interaction.reply({ embeds: [embed.error('Price must be greater than 0.')], ephemeral: true });
      }

      const id = `item-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      const item = { id, name, price };
      if (role) item.roleId = role.id;
      items.push(item);
      client.db.setSetting(gid, 'shopItems', items);

      const roleText = role ? `\nGrants role <@&${role.id}>.` : '';
      return interaction.reply({
        embeds: [embed.success(`Added **${name}** (\`${id}\`) for 🪙 **${price.toLocaleString()}** coins.${roleText}`, '🛒 Shop Admin')],
      });
    }

    // removeitem
    const id = interaction.options.getString('id');
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) {
      return interaction.reply({ embeds: [embed.error(`No shop item found with id \`${id}\`.`)], ephemeral: true });
    }
    const [removed] = items.splice(idx, 1);
    client.db.setSetting(gid, 'shopItems', items);

    return interaction.reply({
      embeds: [embed.success(`Removed **${removed.name}** (\`${removed.id}\`) from the shop.`, '🛒 Shop Admin')],
    });
  },
};
