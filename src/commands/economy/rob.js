const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const COOLDOWN = 2 * 60 * 60 * 1000; // 2h
const FINE = 150;

module.exports = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob another user\'s wallet.')
    .addUserOption((o) => o.setName('user').setDescription('User to rob').setRequired(true))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const target = interaction.options.getUser('user');

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embed.error("You can't rob yourself.")], ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ embeds: [embed.error("You can't rob a bot.")], ephemeral: true });
    }

    const rec = client.db.user(gid, interaction.user.id);
    const victim = client.db.user(gid, target.id);
    const now = Date.now();
    const last = rec.lastRob || 0;

    if (now - last < COOLDOWN) {
      const readyAt = Math.floor((last + COOLDOWN) / 1000);
      return interaction.reply({
        embeds: [embed.warn(`You're laying low after your last job. Try again <t:${readyAt}:R>.`)],
        ephemeral: true,
      });
    }

    if ((victim.coins || 0) <= 0) {
      return interaction.reply({ embeds: [embed.error(`${target.username} has no coins in their wallet to rob.`)], ephemeral: true });
    }

    rec.lastRob = now;
    rec.coins = rec.coins || 0;

    if (Math.random() < 0.4) {
      const pct = Math.random() * (0.30 - 0.10) + 0.10;
      const stolen = Math.max(1, Math.floor(victim.coins * pct));
      victim.coins -= stolen;
      rec.coins += stolen;
      client.db.save(gid);
      return interaction.reply({
        embeds: [embed.success(`You robbed **${target.username}** and stole 🪙 **${stolen}** coins!\nNew wallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
      });
    }

    const fine = Math.min(FINE, rec.coins);
    rec.coins -= fine;
    client.db.save(gid);
    return interaction.reply({
      embeds: [embed.error(`You got caught trying to rob **${target.username}** and paid a fine of 🪙 **${fine}** coins.\nNew wallet: 🪙 ${rec.coins.toLocaleString()} coins.`)],
    });
  },
};
