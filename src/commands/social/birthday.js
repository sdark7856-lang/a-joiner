const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmt(b) {
  return `${MONTHS[b.month - 1]} ${b.day}`;
}

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Manage server birthdays.')
    .setDMPermission(false)
    .addSubcommand((sc) =>
      sc.setName('set').setDescription('Set your birthday.')
        .addIntegerOption((o) => o.setName('month').setDescription('Month (1-12)').setRequired(true).setMinValue(1).setMaxValue(12))
        .addIntegerOption((o) => o.setName('day').setDescription('Day (1-31)').setRequired(true).setMinValue(1).setMaxValue(31)))
    .addSubcommand((sc) =>
      sc.setName('view').setDescription("View a user's birthday.")
        .addUserOption((o) => o.setName('user').setDescription('User to view')))
    .addSubcommand((sc) =>
      sc.setName('list').setDescription('List upcoming birthdays.')),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const birthdays = client.db.store(gid, 'birthdays');

    if (sub === 'set') {
      const month = interaction.options.getInteger('month');
      const day = interaction.options.getInteger('day');

      if (month < 1 || month > 12) {
        return interaction.reply({ embeds: [embed.error('Month must be between 1 and 12.')], ephemeral: true });
      }
      const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (day < 1 || day > daysInMonth[month - 1]) {
        return interaction.reply({ embeds: [embed.error(`Day must be between 1 and ${daysInMonth[month - 1]} for ${MONTHS[month - 1]}.`)], ephemeral: true });
      }

      birthdays[interaction.user.id] = { month, day };
      client.db.save(gid);
      return interaction.reply({ embeds: [embed.success(`Your birthday is set to **${fmt({ month, day })}**! 🎂`)], ephemeral: true });
    }

    if (sub === 'view') {
      const target = interaction.options.getUser('user') || interaction.user;
      const b = birthdays[target.id];
      if (!b) {
        return interaction.reply({ embeds: [embed.info(`**${target.username}** has not set a birthday.`)], ephemeral: true });
      }
      return interaction.reply({ embeds: [embed.info(`🎂 **${target.username}**'s birthday is **${fmt(b)}**.`)] });
    }

    // list
    const entries = Object.entries(birthdays);
    if (entries.length === 0) {
      return interaction.reply({ embeds: [embed.info('No birthdays have been set yet.')] });
    }

    const now = new Date();
    const todayKey = (now.getMonth() + 1) * 100 + now.getDate();

    const withDistance = entries.map(([uid, b]) => {
      const key = b.month * 100 + b.day;
      const distance = key >= todayKey ? key - todayKey : key - todayKey + 1300; // wrap to next year
      return { uid, b, distance };
    });
    withDistance.sort((a, b) => a.distance - b.distance);

    const lines = withDistance.slice(0, 15).map((e) => `🎂 <@${e.uid}> — **${fmt(e.b)}**`);

    return interaction.reply({
      embeds: [embed.base().setTitle('🎉 Upcoming Birthdays').setDescription(lines.join('\n'))],
    });
  },
};
