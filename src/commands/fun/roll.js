const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll a die.')
    .addIntegerOption((o) =>
      o.setName('sides').setDescription('Number of sides (default 6)').setMinValue(2).setMaxValue(1000))
    .setDMPermission(false),

  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') ?? 6;
    const roll = Math.floor(Math.random() * sides) + 1;
    return interaction.reply({
      embeds: [embed.brand('🎲 Dice Roll', `You rolled a **${roll}** on a **${sides}**-sided die!`)],
    });
  },
};
