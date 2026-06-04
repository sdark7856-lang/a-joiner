const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('rep')
    .setDescription('Give a reputation point to another user.')
    .addUserOption((o) =>
      o.setName('user').setDescription('User to give reputation to').setRequired(true))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const target = interaction.options.getUser('user');

    if (target.bot) {
      return interaction.reply({ embeds: [embed.error('You cannot give reputation to a bot.')], ephemeral: true });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embed.error('You cannot give reputation to yourself.')], ephemeral: true });
    }

    const giver = client.db.user(gid, interaction.user.id);
    const now = Date.now();
    const last = giver.repCooldown || 0;
    if (now - last < COOLDOWN_MS) {
      const remaining = COOLDOWN_MS - (now - last);
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const mins = Math.ceil((remaining % (60 * 60 * 1000)) / (60 * 1000));
      return interaction.reply({
        embeds: [embed.warn(`You already gave reputation recently. Try again in **${hours}h ${mins}m**.`)],
        ephemeral: true,
      });
    }

    const rec = client.db.user(gid, target.id);
    rec.rep = (rec.rep || 0) + 1;
    giver.repCooldown = now;
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.success(`You gave a reputation point to **${target.username}**! They now have **${rec.rep}** rep. ⭐`, '⭐ Reputation')],
    });
  },
};
