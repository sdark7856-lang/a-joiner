const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const REWARD = 250;
const COOLDOWN = 22 * 60 * 60 * 1000; // 22h

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward of coins.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const rec = client.db.user(gid, interaction.user.id);
    const now = Date.now();
    const last = rec.lastDaily || 0;

    if (now - last < COOLDOWN) {
      const readyAt = Math.floor((last + COOLDOWN) / 1000);
      return interaction.reply({
        embeds: [embed.warn(`You already claimed your daily reward. Come back <t:${readyAt}:R>.`)],
        ephemeral: true,
      });
    }

    rec.coins = (rec.coins || 0) + REWARD;
    rec.lastDaily = now;
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.success(`You claimed your daily reward of 🪙 **${REWARD}** coins!\nNew wallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
    });
  },
};
