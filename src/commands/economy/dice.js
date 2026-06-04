const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a die and guess the result for a 5x payout.')
    .addIntegerOption((o) => o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1))
    .addIntegerOption((o) => o.setName('guess').setDescription('Your guess (1-6)').setRequired(true).setMinValue(1).setMaxValue(6))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const amount = interaction.options.getInteger('amount');
    const guess = interaction.options.getInteger('guess');

    if (amount <= 0) {
      return interaction.reply({ embeds: [embed.error('Bet must be greater than 0.')], ephemeral: true });
    }

    const rec = client.db.user(gid, interaction.user.id);
    if ((rec.coins || 0) < amount) {
      return interaction.reply({ embeds: [embed.error(`You only have 🪙 ${(rec.coins || 0).toLocaleString()} coins.`)], ephemeral: true });
    }

    const roll = Math.floor(Math.random() * 6) + 1;

    if (roll === guess) {
      const payout = amount * 5;
      const net = payout - amount;
      rec.coins += net;
      client.db.save(gid);
      return interaction.reply({
        embeds: [embed.success(`🎲 The die landed on **${roll}** — you guessed it!\nYou won 🪙 **${payout.toLocaleString()}** coins (5x).\nWallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
      });
    }

    rec.coins -= amount;
    client.db.save(gid);
    return interaction.reply({
      embeds: [embed.error(`🎲 The die landed on **${roll}**. You guessed ${guess}.\nYou lost 🪙 **${amount.toLocaleString()}** coins.\nWallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
    });
  },
};
