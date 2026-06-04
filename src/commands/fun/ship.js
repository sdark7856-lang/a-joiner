const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

function bar(percent) {
  const filled = Math.round(percent / 10);
  return '💗'.repeat(filled) + '🖤'.repeat(10 - filled);
}

function flavor(percent) {
  if (percent >= 90) return 'A match made in heaven! 💞';
  if (percent >= 70) return 'There is some serious chemistry here! 💖';
  if (percent >= 50) return 'Could work with a little effort. 💛';
  if (percent >= 30) return 'It might be a tough one... 💔';
  return 'Maybe just stay friends. 🙈';
}

function shipName(a, b) {
  return a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2));
}

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Calculate the compatibility between two people.')
    .addUserOption((o) => o.setName('user1').setDescription('First person').setRequired(true))
    .addUserOption((o) => o.setName('user2').setDescription('Second person (defaults to you)'))
    .setDMPermission(false),

  async execute(interaction) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2') ?? interaction.user;

    if (user1.id === user2.id) {
      return interaction.reply({ embeds: [embed.warn('You cannot ship someone with themselves!')], ephemeral: true });
    }

    const ids = [user1.id, user2.id].sort();
    let sum = 0;
    for (const ch of ids.join('')) sum += ch.charCodeAt(0);
    const percent = sum % 101;

    const name = shipName(user1.username, user2.username);

    return interaction.reply({
      embeds: [embed.brand(
        '💘 Love Calculator',
        `${user1} 💕 ${user2}\n\n**${percent}%**\n${bar(percent)}\n\nShip name: **${name}**\n${flavor(percent)}`,
      )],
    });
  },
};
