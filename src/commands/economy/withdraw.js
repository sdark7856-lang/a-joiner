const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Move coins from your bank to your wallet.')
    .addStringOption((o) => o.setName('amount').setDescription('Amount or "all"').setRequired(true))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const rec = client.db.user(gid, interaction.user.id);
    const bank = rec.bank || 0;
    const input = interaction.options.getString('amount').trim().toLowerCase();

    let amount;
    if (input === 'all') {
      amount = bank;
    } else {
      amount = parseInt(input, 10);
      if (Number.isNaN(amount)) {
        return interaction.reply({ embeds: [embed.error('Enter a valid number or "all".')], ephemeral: true });
      }
    }

    if (amount <= 0) {
      return interaction.reply({ embeds: [embed.error('Amount must be greater than 0.')], ephemeral: true });
    }
    if (amount > bank) {
      return interaction.reply({ embeds: [embed.error(`You only have 🪙 ${bank.toLocaleString()} coins in your bank.`)], ephemeral: true });
    }

    rec.bank = bank - amount;
    rec.coins = (rec.coins || 0) + amount;
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.success(`Withdrew 🪙 **${amount.toLocaleString()}** coins.\nWallet: 🪙 ${rec.coins.toLocaleString()} | Bank: 🪙 ${rec.bank.toLocaleString()}`)],
    });
  },
};
