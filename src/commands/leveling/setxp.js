const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');
const { levelForXp } = require('../../lib/leveling');

module.exports = {
  category: 'leveling',
  data: new SlashCommandBuilder()
    .setName('set-xp')
    .setDescription("Set a user's total XP.")
    .addUserOption((o) => o.setName('user').setDescription('User to modify').setRequired(true))
    .addIntegerOption((o) =>
      o.setName('amount').setDescription('New total XP').setRequired(true).setMinValue(0),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const rec = client.db.user(gid, target.id);
    rec.xp = amount;
    rec.level = levelForXp(amount);
    client.db.save(gid);

    return interaction.reply({
      embeds: [
        embed.success(
          `Set **${target.tag || target.username}**'s XP to **${amount.toLocaleString()}** (Level **${rec.level}**).`,
        ),
      ],
    });
  },
};
