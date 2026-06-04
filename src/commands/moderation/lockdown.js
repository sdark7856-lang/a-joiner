const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock or unlock every text channel in the server at once.')
    .addStringOption((o) =>
      o.setName('action').setDescription('Lock or lift the lockdown').setRequired(true)
        .addChoices({ name: 'Enable (lock all)', value: 'on' }, { name: 'Disable (unlock all)', value: 'off' }))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    const on = interaction.options.getString('action') === 'on';
    await interaction.deferReply();
    const everyone = interaction.guild.roles.everyone;
    const channels = interaction.guild.channels.cache.filter((c) => c.type === ChannelType.GuildText);

    let count = 0;
    for (const channel of channels.values()) {
      await channel.permissionOverwrites.edit(everyone, { SendMessages: on ? false : null }).then(() => count++).catch(() => {});
    }
    return interaction.editReply({
      embeds: [embed.success(`${on ? '🔒 Server lockdown enabled' : '🔓 Lockdown lifted'} across **${count}** channels.`)],
    });
  },
};
