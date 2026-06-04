const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../lib/embed');

const QUESTIONS = [
  { category: 'General', q: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Madrid'], answer: 1 },
  { category: 'General', q: 'How many continents are there on Earth?', options: ['5', '6', '7', '8'], answer: 2 },
  { category: 'General', q: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3 },
  { category: 'General', q: 'Which language has the most native speakers?', options: ['English', 'Hindi', 'Mandarin Chinese', 'Spanish'], answer: 2 },
  { category: 'Science', q: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2 },
  { category: 'Science', q: 'What planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1 },
  { category: 'Science', q: 'How many bones are in the adult human body?', options: ['206', '201', '212', '198'], answer: 0 },
  { category: 'Science', q: 'What gas do plants primarily absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 2 },
  { category: 'Gaming', q: 'What company created Mario?', options: ['Sega', 'Nintendo', 'Sony', 'Microsoft'], answer: 1 },
  { category: 'Gaming', q: 'In Minecraft, what material do you need to make a pickaxe mine obsidian?', options: ['Iron', 'Gold', 'Diamond', 'Stone'], answer: 2 },
  { category: 'Gaming', q: 'What is the best-selling video game of all time?', options: ['Tetris', 'Minecraft', 'GTA V', 'Wii Sports'], answer: 1 },
  { category: 'Gaming', q: 'Which character is the mascot of Sega?', options: ['Mario', 'Kirby', 'Sonic', 'Link'], answer: 2 },
  { category: 'History', q: 'In which year did World War II end?', options: ['1943', '1945', '1947', '1950'], answer: 1 },
  { category: 'History', q: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'], answer: 2 },
  { category: 'History', q: 'Which ancient civilization built the pyramids of Giza?', options: ['Romans', 'Greeks', 'Egyptians', 'Mayans'], answer: 2 },
  { category: 'History', q: 'The Great Wall is located in which country?', options: ['Japan', 'India', 'China', 'Korea'], answer: 2 },
];

const CATEGORIES = [...new Set(QUESTIONS.map((q) => q.category))];
const LETTERS = ['🇦', '🇧', '🇨', '🇩'];

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Answer a multiple-choice trivia question.')
    .addStringOption((o) => {
      o.setName('category').setDescription('Pick a category (random if omitted)');
      for (const c of CATEGORIES) o.addChoices({ name: c, value: c });
      return o;
    })
    .setDMPermission(false),

  async execute(interaction) {
    const cat = interaction.options.getString('category');
    const pool = cat ? QUESTIONS.filter((q) => q.category === cat) : QUESTIONS;
    const question = pool[Math.floor(Math.random() * pool.length)];

    const buildRow = (disabled, revealed) => {
      const row = new ActionRowBuilder();
      question.options.forEach((opt, idx) => {
        let style = ButtonStyle.Primary;
        if (revealed) {
          if (idx === question.answer) style = ButtonStyle.Success;
          else if (idx === revealed.picked) style = ButtonStyle.Danger;
          else style = ButtonStyle.Secondary;
        }
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`trivia_${idx}`)
            .setLabel(`${String.fromCharCode(65 + idx)}`)
            .setStyle(style)
            .setDisabled(disabled),
        );
      });
      return row;
    };

    const body = `**Category:** ${question.category}\n\n**${question.q}**\n\n${question.options.map((o, i) => `${LETTERS[i]} ${o}`).join('\n')}\n\n⏱️ You have 20 seconds.`;

    const msg = await interaction.reply({
      embeds: [embed.brand('❓ Trivia', body)],
      components: [buildRow(false, null)],
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 20000, max: 1 });

    let answered = false;

    collector.on('collect', async (i) => {
      answered = true;
      const picked = parseInt(i.customId.split('_')[1], 10);
      const correct = picked === question.answer;
      const correctText = `${LETTERS[question.answer]} ${question.options[question.answer]}`;

      const result = correct
        ? embed.success(`Correct! The answer was **${correctText}**. 🎉`, '❓ Trivia')
        : embed.error(`Wrong! You picked **${question.options[picked]}**.\nThe correct answer was **${correctText}**.`, '❓ Trivia');

      await i.update({ embeds: [result], components: [buildRow(true, { picked })] });
    });

    collector.on('end', async () => {
      if (!answered) {
        const correctText = `${LETTERS[question.answer]} ${question.options[question.answer]}`;
        await interaction.editReply({
          embeds: [embed.warn(`Time's up! The correct answer was **${correctText}**.`, '❓ Trivia')],
          components: [buildRow(true, {})],
        }).catch(() => {});
      }
    });
  },
};
