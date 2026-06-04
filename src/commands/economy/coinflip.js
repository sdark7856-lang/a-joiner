const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and gamble your coins.')
    .addIntegerOption((o) => o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1))
    .addStringOption((o) =>
      o.setName('side').setDescription('Heads or tails').setRequired(true)
        .addChoices({ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' }))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const amount = interaction.options.getInteger('amount');
    const side = interaction.options.getString('side');

    if (amount <= 0) {
      return interaction.reply({ embeds: [embed.error('Bet must be greater than 0.')], ephemeral: true });
    }

    const rec = client.db.user(gid, interaction.user.id);
    if ((rec.coins || 0) < amount) {
      return interaction.reply({ embeds: [embed.error(`You only have 🪙 ${(rec.coins || 0).toLocaleString()} coins.`)], ephemeral: true });
    }

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = result === side;

    if (won) {
      rec.coins += amount;
      client.db.save(gid);
      return interaction.reply({
        embeds: [embed.success(`The coin landed on **${result}**! You won 🪙 **${amount.toLocaleString()}** coins.\nWallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
      });
    }

    rec.coins -= amount;
    client.db.save(gid);
    return interaction.reply({
      embeds: [embed.error(`The coin landed on **${result}**. You lost 🪙 **${amount.toLocaleString()}** coins.\nWallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
    });
  },
};
