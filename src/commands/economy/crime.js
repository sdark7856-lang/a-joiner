const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const COOLDOWN = 60 * 60 * 1000; // 1h
const WINS = [
  'You pulled off a daring heist',
  'You hacked a vending machine',
  'You ran a sketchy side hustle',
  'You pickpocketed a tourist',
];
const FAILS = [
  'You got caught and paid a fine',
  'The cops chased you down',
  'Your scheme backfired badly',
  'Security tackled you at the door',
];

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Commit a crime for a risky reward.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const rec = client.db.user(gid, interaction.user.id);
    const now = Date.now();
    const last = rec.lastCrime || 0;

    if (now - last < COOLDOWN) {
      const readyAt = Math.floor((last + COOLDOWN) / 1000);
      return interaction.reply({
        embeds: [embed.warn(`Lay low for now. Try again <t:${readyAt}:R>.`)],
        ephemeral: true,
      });
    }

    rec.lastCrime = now;
    rec.coins = rec.coins || 0;

    if (Math.random() < 0.5) {
      const gain = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
      rec.coins += gain;
      client.db.save(gid);
      const flavor = WINS[Math.floor(Math.random() * WINS.length)];
      return interaction.reply({
        embeds: [embed.success(`${flavor} and got away with 🪙 **${gain}** coins!\nNew wallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
      });
    }

    const loss = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    const actual = Math.min(loss, rec.coins);
    rec.coins -= actual;
    client.db.save(gid);
    const flavor = FAILS[Math.floor(Math.random() * FAILS.length)];
    return interaction.reply({
      embeds: [embed.error(`${flavor} and lost 🪙 **${actual}** coins.\nNew wallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
    });
  },
};
