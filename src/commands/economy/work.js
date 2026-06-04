const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const COOLDOWN = 60 * 60 * 1000; // 1h
const JOBS = [
  'You delivered pizzas across town',
  'You streamed for a few hours and got donations',
  'You walked the neighborhood dogs',
  'You fixed a friend\'s computer',
  'You sold some homemade cookies',
  'You did a shift at the coffee shop',
  'You mowed a few lawns',
  'You wrote some freelance code',
];

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work a job to earn some coins.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const rec = client.db.user(gid, interaction.user.id);
    const now = Date.now();
    const last = rec.lastWork || 0;

    if (now - last < COOLDOWN) {
      const readyAt = Math.floor((last + COOLDOWN) / 1000);
      return interaction.reply({
        embeds: [embed.warn(`You're tired from working. Try again <t:${readyAt}:R>.`)],
        ephemeral: true,
      });
    }

    const earned = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
    const job = JOBS[Math.floor(Math.random() * JOBS.length)];

    rec.coins = (rec.coins || 0) + earned;
    rec.lastWork = now;
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.success(`${job} and earned 🪙 **${earned}** coins!\nNew wallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
    });
  },
};
