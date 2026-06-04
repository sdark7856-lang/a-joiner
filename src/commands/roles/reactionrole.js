const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'roles',
  data: new SlashCommandBuilder()
    .setName('reaction-role')
    .setDescription('Grant a role when members react to a message with an emoji.')
    .addStringOption((o) =>
      o.setName('message_id').setDescription('ID of the message (in this channel)').setRequired(true),
    )
    .addStringOption((o) => o.setName('emoji').setDescription('Emoji to react with').setRequired(true))
    .addRoleOption((o) => o.setName('role').setDescription('Role to grant').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const messageId = interaction.options.getString('message_id');
    const emoji = interaction.options.getString('emoji').trim();
    const role = interaction.options.getRole('role');

    let message;
    try {
      message = await interaction.channel.messages.fetch(messageId);
    } catch {
      return interaction.reply({
        embeds: [embed.error('Could not find a message with that ID in this channel.')],
        ephemeral: true,
      });
    }

    // Determine the emoji key: custom emoji id, or the unicode string.
    const customMatch = emoji.match(/^<a?:\w+:(\d+)>$/);
    const emojiKey = customMatch ? customMatch[1] : emoji;

    try {
      await message.react(emoji);
    } catch {
      return interaction.reply({
        embeds: [embed.error('Failed to react with that emoji. Make sure it is valid and accessible.')],
        ephemeral: true,
      });
    }

    const reactionRoles = { ...(client.db.getSetting(gid, 'reactionRoles', {}) || {}) };
    reactionRoles[messageId] = { ...(reactionRoles[messageId] || {}) };
    reactionRoles[messageId][emojiKey] = role.id;
    client.db.setSetting(gid, 'reactionRoles', reactionRoles);

    return interaction.reply({
      embeds: [
        embed.success(`Reacting with ${emoji} on [that message](${message.url}) now grants ${role}.`),
      ],
      ephemeral: true,
    });
  },
};
