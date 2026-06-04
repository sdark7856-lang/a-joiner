const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Show your wallet, bank, and total balance.')
    .addUserOption((o) => o.setName('user').setDescription('User to check'))
    .setDMPermission(false),

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const rec = client.db.user(interaction.guild.id, target.id);
    const wallet = rec.coins || 0;
    const bank = rec.bank || 0;
    const total = wallet + bank;

    const e = embed
      .base()
      .setTitle(`💰 ${target.username}'s balance`)
      .addFields(
        { name: 'Wallet', value: `🪙 ${wallet.toLocaleString()} coins`, inline: true },
        { name: 'Bank', value: `🪙 ${bank.toLocaleString()} coins`, inline: true },
        { name: 'Total', value: `🪙 ${total.toLocaleString()} coins`, inline: true },
      );

    return interaction.reply({ embeds: [e] });
  },
};
