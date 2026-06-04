const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('guess-number')
    .setDescription('Guess the number between 1 and 100 in 6 tries.')
    .setDMPermission(false),

  async execute(interaction) {
    const target = Math.floor(Math.random() * 100) + 1;
    const maxAttempts = 6;
    let attempts = 0;

    await interaction.reply({
      embeds: [embed.brand('🔢 Guess the Number', `I'm thinking of a number between **1** and **100**.\nYou have **${maxAttempts}** attempts. Type your guess in the chat!`)],
    });

    const filter = (m) => m.author.id === interaction.user.id && !m.author.bot;
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async (m) => {
      const guess = parseInt(m.content.trim(), 10);
      if (Number.isNaN(guess)) {
        await interaction.followUp({ embeds: [embed.warn('That is not a valid number. Try again.')] });
        return;
      }

      attempts += 1;
      const left = maxAttempts - attempts;

      if (guess === target) {
        collector.stop('won');
        return;
      }

      if (left <= 0) {
        collector.stop('lost');
        return;
      }

      const hint = guess < target ? 'higher ⬆️' : 'lower ⬇️';
      await interaction.followUp({
        embeds: [embed.info(`**${guess}** is not it. Try **${hint}**.\nAttempts left: **${left}**`, '🔢 Guess the Number')],
      });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'won') {
        await interaction.followUp({ embeds: [embed.success(`Correct! The number was **${target}**. You got it in **${attempts}** attempt(s)! 🎉`, '🔢 Guess the Number')] });
      } else {
        await interaction.followUp({ embeds: [embed.error(`Game over! The number was **${target}**.`, '🔢 Guess the Number')] });
      }
    });
  },
};
