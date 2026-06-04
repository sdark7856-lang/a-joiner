const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const embed = require('../lib/embed');

module.exports = {
  id: 'ticket:',
  async execute(interaction, client) {
    const action = interaction.customId.split(':')[1];
    const gid = interaction.guild.id;
    const tickets = client.db.store(gid, 'tickets');

    if (action === 'create') {
      const existing = Object.entries(tickets).find(([, t]) => t.userId === interaction.user.id);
      if (existing && interaction.guild.channels.cache.has(existing[0])) {
        return interaction.reply({ embeds: [embed.error(`You already have an open ticket: <#${existing[0]}>`)], ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });
      const staffRole = client.db.getSetting(gid, 'staffRole');
      const overwrites = [
        { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ];
      if (staffRole) overwrites.push({ id: staffRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`.slice(0, 90),
        type: ChannelType.GuildText,
        parent: interaction.channel.parentId,
        permissionOverwrites: overwrites,
      });
      tickets[channel.id] = { userId: interaction.user.id, opened: Date.now() };
      client.db.save(gid);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket:close').setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
      );
      await channel.send({
        content: `${interaction.user}${staffRole ? ` <@&${staffRole}>` : ''}`,
        embeds: [embed.brand('🎫 Ticket Opened', 'Staff will be with you shortly. Describe your issue below.')],
        components: [row],
      });
      return interaction.editReply({ embeds: [embed.success(`Your ticket is ready: ${channel}`)] });
    }

    if (action === 'close') {
      if (!tickets[interaction.channel.id]) {
        return interaction.reply({ embeds: [embed.error('This is not a ticket channel.')], ephemeral: true });
      }
      await interaction.reply({ embeds: [embed.warn('Closing this ticket in 5 seconds…')] });

      // Lightweight transcript to the audit-log channel.
      const logId = client.db.getSetting(interaction.guild.id, 'logChannel');
      const log = logId && interaction.guild.channels.cache.get(logId);
      if (log) {
        const msgs = await interaction.channel.messages.fetch({ limit: 100 }).catch(() => null);
        if (msgs) {
          const text = [...msgs.values()].reverse()
            .map((m) => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content}`)
            .join('\n');
          log.send({
            embeds: [embed.info(`Transcript for **#${interaction.channel.name}**`)],
            files: [{ attachment: Buffer.from(text || 'empty'), name: `${interaction.channel.name}.txt` }],
          }).catch(() => {});
        }
      }

      delete tickets[interaction.channel.id];
      client.db.save(interaction.guild.id);
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
  },
};
