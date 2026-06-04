const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Give coins from your wallet to another user.')
    .addUserOption((o) => o.setName('user').setDescription('User to give coins to').setRequired(true))
    .addIntegerOption((o) => o.setName('amount').setDescription('Amount of coins').setRequired(true).setMinValue(1))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply({ embeds: [embed.error('Amount must be greater than 0.')], ephemeral: true });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embed.error("You can't give coins to yourself.")], ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ embeds: [embed.error("You can't give coins to a bot.")], ephemeral: true });
    }

    const rec = client.db.user(gid, interaction.user.id);
    if ((rec.coins || 0) < amount) {
      return interaction.reply({ embeds: [embed.error(`You only have 🪙 ${(rec.coins || 0).toLocaleString()} coins in your wallet.`)], ephemeral: true });
    }

    const victim = client.db.user(gid, target.id);
    rec.coins -= amount;
    victim.coins = (victim.coins || 0) + amount;
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.success(`You gave 🪙 **${amount.toLocaleString()}** coins to **${target.username}**.\nYour wallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
    });
  },
};
