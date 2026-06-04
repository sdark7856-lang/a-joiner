const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const TRUTHS = [
  'What is the most embarrassing thing you have ever done?',
  'What is a secret you have never told anyone?',
  'Who was your first crush?',
  'What is the biggest lie you have ever told?',
  'What is your most irrational fear?',
  'What is something you are glad your family does not know about you?',
  'What is the worst thing you have ever done?',
  'Have you ever pretended to like a gift you hated?',
  'What is the most childish thing you still do?',
  'What is your most embarrassing childhood memory?',
];

const DARES = [
  'Send the last photo in your camera roll.',
  'Talk in an accent for the next 10 minutes.',
  'Do your best impression of another member.',
  'Type with your elbows for the next message.',
  'Sing a song of the group\'s choosing.',
  'Send a voice message of you laughing.',
  'Change your nickname to whatever the group says for an hour.',
  'Text someone "I know what you did" with no context.',
  'Do 10 jumping jacks right now.',
  'Speak only in questions for the next 5 minutes.',
];

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('truthordare')
    .setDescription('Get a random truth or dare.')
    .addStringOption((o) =>
      o.setName('type').setDescription('Pick truth or dare (random if omitted)')
        .addChoices({ name: 'Truth', value: 'truth' }, { name: 'Dare', value: 'dare' }))
    .setDMPermission(false),

  async execute(interaction) {
    let type = interaction.options.getString('type');
    if (!type) type = Math.random() < 0.5 ? 'truth' : 'dare';

    const pool = type === 'truth' ? TRUTHS : DARES;
    const prompt = pool[Math.floor(Math.random() * pool.length)];
    const title = type === 'truth' ? '💬 Truth' : '🔥 Dare';

    return interaction.reply({ embeds: [embed.brand(title, prompt)] });
  },
};
