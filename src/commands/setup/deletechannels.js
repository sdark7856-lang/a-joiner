const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'setup',
  data: new SlashCommandBuilder()
    .setName('delete-channels')
    .setDescription('Delete EVERY channel in the server (irreversible). Handy before /setup.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    const me = interaction.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ embeds: [embed.error('I need the **Manage Channels** permission.')], ephemeral: true });
    }

    const count = interaction.guild.channels.cache.size;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('dc_confirm').setLabel('Delete everything').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('dc_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({
      embeds: [embed.warn(
        `This will permanently delete **all ${count} channels** in **${interaction.guild.name}**.\nThis **cannot be undone**. Are you sure?`,
        '⚠️ Confirm channel wipe',
      )],
      components: [row],
    });

    const msg = await interaction.fetchReply();
    let choice;
    try {
      choice = await msg.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        componentType: ComponentType.Button,
        time: 30_000,
      });
    } catch {
      return interaction.editReply({ embeds: [embed.info('Timed out — nothing was deleted.')], components: [] }).catch(() => {});
    }

    if (choice.customId === 'dc_cancel') {
      return choice.update({ embeds: [embed.info('Cancelled — nothing was deleted.')], components: [] });
    }

    // Confirmed. Acknowledge before the channels (including this one) vanish.
    await choice.update({ embeds: [embed.warn('🗑️ Deleting all channels…')], components: [] });

    let deleted = 0;
    for (const channel of [...interaction.guild.channels.cache.values()]) {
      await channel.delete('Wiped via /delete-channels').then(() => deleted++).catch(() => {});
    }

    // The command's channel is gone, so report the result via DM.
    interaction.user
      .send({ embeds: [embed.success(`Deleted **${deleted}** channel(s) in **${interaction.guild.name}**.\nRun \`/setup\` to rebuild the server.`)] })
      .catch(() => {});
  },
};
