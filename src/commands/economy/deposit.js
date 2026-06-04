const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Move coins from your wallet to your bank.')
    .addStringOption((o) => o.setName('amount').setDescription('Amount or "all"').setRequired(true))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const rec = client.db.user(gid, interaction.user.id);
    const wallet = rec.coins || 0;
    const input = interaction.options.getString('amount').trim().toLowerCase();

    let amount;
    if (input === 'all') {
      amount = wallet;
    } else {
      amount = parseInt(input, 10);
      if (Number.isNaN(amount)) {
        return interaction.reply({ embeds: [embed.error('Enter a valid number or "all".')], ephemeral: true });
      }
    }

    if (amount <= 0) {
      return interaction.reply({ embeds: [embed.error('Amount must be greater than 0.')], ephemeral: true });
    }
    if (amount > wallet) {
      return interaction.reply({ embeds: [embed.error(`You only have 🪙 ${wallet.toLocaleString()} coins in your wallet.`)], ephemeral: true });
    }

    rec.coins = wallet - amount;
    rec.bank = (rec.bank || 0) + amount;
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.success(`Deposited 🪙 **${amount.toLocaleString()}** coins.\nWallet: 🪙 ${rec.coins.toLocaleString()} | Bank: 🪙 ${rec.bank.toLocaleString()}`)],
    });
  },
};
