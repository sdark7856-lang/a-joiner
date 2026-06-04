const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('flip')
    .setDescription('Flip a coin (just for fun).')
    .setDMPermission(false),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const face = result === 'Heads' ? '🪙' : '🌑';
    return interaction.reply({
      embeds: [embed.brand('🪙 Coin Flip', `The coin landed on **${result}**! ${face}`)],
    });
  },
};
