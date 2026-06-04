const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const PROMPTS = [
  'broken a bone.',
  'lied to get out of work or school.',
  'sang karaoke in public.',
  'fallen asleep in a movie theater.',
  'eaten food that fell on the floor.',
  'forgotten someone\'s name right after meeting them.',
  'stayed up for more than 24 hours straight.',
  'gotten lost in a new city.',
  'sent a text to the wrong person.',
  'laughed so hard I cried.',
  'pretended to be sick to skip an event.',
  'binge-watched an entire series in one day.',
  'tripped in front of a crowd.',
  'forgotten my own password too many times.',
  'talked to myself out loud in public.',
];

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('nhie')
    .setDescription('Never Have I Ever — a random prompt.')
    .setDMPermission(false),

  async execute(interaction) {
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    return interaction.reply({
      embeds: [embed.brand('🙅 Never Have I Ever...', `Never have I ever ${prompt}`)],
    });
  },
};
