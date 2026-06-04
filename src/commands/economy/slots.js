const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const REELS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Spin the slot machine.')
    .addIntegerOption((o) => o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply({ embeds: [embed.error('Bet must be greater than 0.')], ephemeral: true });
    }

    const rec = client.db.user(gid, interaction.user.id);
    if ((rec.coins || 0) < amount) {
      return interaction.reply({ embeds: [embed.error(`You only have 🪙 ${(rec.coins || 0).toLocaleString()} coins.`)], ephemeral: true });
    }

    const spin = [0, 0, 0].map(() => REELS[Math.floor(Math.random() * REELS.length)]);
    const [a, b, c] = spin;

    let multiplier = 0;
    if (a === b && b === c) {
      multiplier = a === '💎' ? 10 : a === '7️⃣' ? 8 : 5; // all three match
    } else if (a === b || b === c || a === c) {
      multiplier = 2; // two match
    }

    const line = spin.join(' | ');
    let resultEmbed;

    if (multiplier > 0) {
      const payout = amount * multiplier;
      const net = payout - amount;
      rec.coins += net;
      client.db.save(gid);
      resultEmbed = embed.success(
        `[ ${line} ]\nYou won 🪙 **${payout.toLocaleString()}** coins (${multiplier}x)!\nWallet: 🪙 ${rec.coins.toLocaleString()} coins.`,
        '🎰 Slots',
      );
    } else {
      rec.coins -= amount;
      client.db.save(gid);
      resultEmbed = embed.error(
        `[ ${line} ]\nNo match. You lost 🪙 **${amount.toLocaleString()}** coins.\nWallet: 🪙 ${rec.coins.toLocaleString()} coins.`,
        '🎰 Slots',
      );
    }

    return interaction.reply({ embeds: [resultEmbed] });
  },
};
