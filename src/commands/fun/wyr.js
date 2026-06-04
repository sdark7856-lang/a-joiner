const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const DILEMMAS = [
  ['be able to fly', 'be invisible'],
  ['have unlimited money', 'have unlimited time'],
  ['never use social media again', 'never watch another movie or show'],
  ['be able to talk to animals', 'speak every human language'],
  ['live without music', 'live without television'],
  ['always be 10 minutes late', 'always be 20 minutes early'],
  ['have the ability to teleport', 'be able to read minds'],
  ['fight one horse-sized duck', 'fight one hundred duck-sized horses'],
  ['never eat your favorite food again', 'only eat your favorite food forever'],
  ['have super strength', 'have super speed'],
  ['know how you will die', 'know when you will die'],
  ['always have to say everything on your mind', 'never speak again'],
  ['be famous but poor', 'be unknown but rich'],
  ['relive the same day forever', 'lose all your memories'],
  ['have no internet', 'have no air conditioning or heating'],
];

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('wyr')
    .setDescription('Would You Rather — a random dilemma.')
    .setDMPermission(false),

  async execute(interaction) {
    const [a, b] = DILEMMAS[Math.floor(Math.random() * DILEMMAS.length)];
    return interaction.reply({
      embeds: [embed.brand('🤔 Would You Rather...', `🅰️ ${a}\n\n**OR**\n\n🅱️ ${b}`)],
    });
  },
};
