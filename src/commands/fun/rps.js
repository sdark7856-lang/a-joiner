const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const CHOICES = ['rock', 'paper', 'scissors'];
const EMOJI = { rock: '🪨', paper: '📄', scissors: '✂️' };
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play rock-paper-scissors against the bot.')
    .addStringOption((o) =>
      o.setName('choice').setDescription('Your move').setRequired(true)
        .addChoices(
          { name: 'Rock', value: 'rock' },
          { name: 'Paper', value: 'paper' },
          { name: 'Scissors', value: 'scissors' },
        ))
    .setDMPermission(false),

  async execute(interaction) {
    const player = interaction.options.getString('choice');
    const bot = CHOICES[Math.floor(Math.random() * CHOICES.length)];

    const line = `You: ${EMOJI[player]} **${player}**  vs  Bot: ${EMOJI[bot]} **${bot}**`;

    if (player === bot) {
      return interaction.reply({ embeds: [embed.warn(`${line}\n\nIt's a **tie**!`, '✊ Rock Paper Scissors')] });
    }
    if (BEATS[player] === bot) {
      return interaction.reply({ embeds: [embed.success(`${line}\n\nYou **win**! 🎉`, '✊ Rock Paper Scissors')] });
    }
    return interaction.reply({ embeds: [embed.error(`${line}\n\nYou **lose**!`, '✊ Rock Paper Scissors')] });
  },
};
