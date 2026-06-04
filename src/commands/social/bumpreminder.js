const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

const INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours

// guildId -> intervalId, kept at module level so toggling off can clear it.
const timers = new Map();

function clearTimer(gid) {
  const existing = timers.get(gid);
  if (existing) {
    clearInterval(existing);
    timers.delete(gid);
  }
}

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('bump-reminder')
    .setDescription('Toggle 2-hour bump reminders in this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addStringOption((o) =>
      o.setName('state').setDescription('Turn reminders on or off').setRequired(true)
        .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const state = interaction.options.getString('state');

    if (state === 'off') {
      clearTimer(gid);
      client.db.setSetting(gid, 'bumpReminder', false);
      return interaction.reply({ embeds: [embed.info('Bump reminders have been turned **off**.')] });
    }

    // on
    const channelId = interaction.channel.id;
    client.db.setSetting(gid, 'bumpReminder', true);
    client.db.setSetting(gid, 'bumpChannel', channelId);

    clearTimer(gid);
    const timer = setInterval(async () => {
      const channel = client.channels.cache.get(channelId)
        || await client.channels.fetch(channelId).catch(() => null);
      if (!channel) {
        clearTimer(gid);
        return;
      }
      channel.send({
        embeds: [embed.info('It\'s time to bump the server! Run `/bump` to keep us climbing. 🚀', '⏰ Bump Reminder')],
      }).catch(() => {});
    }, INTERVAL_MS);

    // Don't keep the process alive solely for this timer.
    if (typeof timer.unref === 'function') timer.unref();
    timers.set(gid, timer);

    return interaction.reply({
      embeds: [embed.success(`Bump reminders are **on**. I will remind <#${channelId}> every **2 hours**.`)],
    });
  },
};
