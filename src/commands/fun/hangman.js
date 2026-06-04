const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const WORDS = [
  'discord', 'javascript', 'computer', 'keyboard', 'mountain', 'elephant',
  'galaxy', 'pyramid', 'volcano', 'diamond', 'penguin', 'guitar',
  'rainbow', 'octopus', 'treasure', 'wizard', 'dragon', 'castle',
  'pancake', 'umbrella',
];

const STAGES = [
  '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n=========\n```',
  '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n=========\n```',
  '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========\n```',
  '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========\n```',
  '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========\n```',
  '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========\n```',
  '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n=========\n```',
];

function render(word, guessed) {
  return word.split('').map((c) => (guessed.has(c) ? c : '\\_')).join(' ');
}

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Play a game of hangman.')
    .setDMPermission(false),

  async execute(interaction) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const guessed = new Set();
    let wrong = 0;
    const maxWrong = 6;

    const buildEmbed = (note) => {
      const e = embed.brand('🎯 Hangman', `${STAGES[wrong]}\nWord: \`${render(word, guessed)}\`\nWrong: **${wrong}/${maxWrong}**\nGuessed: ${[...guessed].join(', ') || 'none'}${note ? `\n\n${note}` : ''}`);
      return e;
    };

    await interaction.reply({ embeds: [buildEmbed('Type a single letter to guess!')] });

    const filter = (m) => m.author.id === interaction.user.id && !m.author.bot;
    const collector = interaction.channel.createMessageCollector({ filter, time: 120000 });

    collector.on('collect', async (m) => {
      const letter = m.content.trim().toLowerCase();
      if (letter.length !== 1 || !/[a-z]/.test(letter)) {
        await interaction.followUp({ embeds: [embed.warn('Please guess a single letter (a-z).')] });
        return;
      }
      if (guessed.has(letter)) {
        await interaction.followUp({ embeds: [embed.warn(`You already guessed **${letter}**.`)] });
        return;
      }

      guessed.add(letter);
      if (!word.includes(letter)) wrong += 1;

      const solved = word.split('').every((c) => guessed.has(c));
      if (solved) {
        collector.stop('won');
        return;
      }
      if (wrong >= maxWrong) {
        collector.stop('lost');
        return;
      }

      await interaction.followUp({ embeds: [buildEmbed()] });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'won') {
        await interaction.followUp({ embeds: [embed.success(`You guessed it! The word was **${word}**. 🎉`, '🎯 Hangman')] });
      } else if (reason === 'lost') {
        await interaction.followUp({ embeds: [embed.error(`${STAGES[maxWrong]}\nGame over! The word was **${word}**.`, '🎯 Hangman')] });
      } else {
        await interaction.followUp({ embeds: [embed.warn(`Time's up! The word was **${word}**.`, '🎯 Hangman')] });
      }
    });
  },
};
