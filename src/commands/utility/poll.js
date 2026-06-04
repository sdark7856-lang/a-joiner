const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const LETTERS = [
  '🇦', '🇧', '🇨', '🇩', '🇪',
  '🇫', '🇬', '🇭', '🇮', '🇯',
];

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with up to 10 options (comma-separated).')
    .addStringOption((o) => o.setName('question').setDescription('The poll question').setRequired(true))
    .addStringOption((o) =>
      o.setName('options').setDescription('Comma-separated options (2-10). Omit for a yes/no poll.'),
    )
    .setDMPermission(false),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const rawOptions = interaction.options.getString('options');

    if (!rawOptions || !rawOptions.includes(',')) {
      const e = embed.base().setTitle('📊 Poll').setDescription(`**${question}**`);
      await interaction.reply({ embeds: [e] });
      const msg = await interaction.fetchReply();
      await msg.react('👍');
      await msg.react('👎');
      return;
    }

    const options = rawOptions
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (options.length < 2 || options.length > 10) {
      return interaction.reply({
        embeds: [embed.error('Provide between 2 and 10 comma-separated options.')],
        ephemeral: true,
      });
    }

    const lines = options.map((opt, i) => `${LETTERS[i]} ${opt}`);
    const e = embed
      .base()
      .setTitle('📊 Poll')
      .setDescription(`**${question}**\n\n${lines.join('\n')}`);

    await interaction.reply({ embeds: [e] });
    const msg = await interaction.fetchReply();
    for (let i = 0; i < options.length; i++) {
      await msg.react(LETTERS[i]);
    }
  },
};
