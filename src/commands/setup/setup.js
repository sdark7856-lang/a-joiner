const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const embed = require('../../lib/embed');

// Decorative prefixes placed beside every channel name. The user picks one.
const STYLES = {
  arrow: '➜',
  triangle: '➤',
  chevron: '⟫',
  bullet: '•',
  dot: '・',
  line: '┃',
  sparkle: '⊹',
  heart: '🖤',
};

// The server blueprint. `setting` keys auto-wire channels into bot config.
const TEMPLATE = [
  {
    name: 'WELCOME', emoji: '👋',
    channels: [
      { name: 'welcome', setting: 'welcomeChannel' },
      { name: 'rules' },
      { name: 'announcements' },
      { name: 'roles' },
    ],
  },
  {
    name: 'COMMUNITY', emoji: '💬',
    channels: [
      { name: 'general' },
      { name: 'media' },
      { name: 'memes' },
      { name: 'bot-commands' },
      { name: 'counting' },
    ],
  },
  {
    name: 'ENGAGEMENT', emoji: '⭐',
    channels: [
      { name: 'level-ups', setting: 'levelUpChannel' },
      { name: 'starboard', setting: 'starboardChannel' },
      { name: 'suggestions', setting: 'suggestionChannel' },
      { name: 'confessions', setting: 'confessionChannel' },
    ],
  },
  {
    name: 'FUN & GAMES', emoji: '🎮',
    channels: [
      { name: 'games' },
      { name: 'economy' },
      { name: 'music', setting: 'musicChannel' },
    ],
  },
  {
    name: 'SUPPORT', emoji: '🎫',
    channels: [{ name: 'open-a-ticket', setting: 'ticketChannel', panel: 'ticket' }],
  },
  {
    name: 'VOICE', emoji: '🔊',
    voice: [{ name: 'General' }, { name: 'Music' }, { name: 'Gaming' }, { name: 'AFK' }],
  },
  {
    name: 'STAFF', emoji: '🛡️', staffOnly: true,
    channels: [
      { name: 'mod-log', setting: 'modLogChannel' },
      { name: 'audit-logs', setting: 'logChannel' },
      { name: 'staff-chat' },
    ],
  },
];

async function ensureRole(guild, name, options) {
  const existing = guild.roles.cache.find((r) => r.name === name);
  if (existing) return existing;
  return guild.roles.create({ name, ...options });
}

module.exports = {
  category: 'setup',
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Automatically build a full server: categories, channels, roles & config.')
    .addStringOption((o) =>
      o
        .setName('style')
        .setDescription('Decorative icon placed beside each channel name')
        .addChoices(
          { name: '➜  Arrow', value: 'arrow' },
          { name: '➤  Triangle', value: 'triangle' },
          { name: '⟫  Chevron', value: 'chevron' },
          { name: '•  Bullet', value: 'bullet' },
          { name: '・ Dot', value: 'dot' },
          { name: '┃  Line', value: 'line' },
          { name: '⊹  Sparkle', value: 'sparkle' },
          { name: '🖤 Heart', value: 'heart' },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    const { guild } = interaction;
    const me = guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.ManageChannels) ||
        !me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        embeds: [embed.error('I need **Manage Channels** and **Manage Roles** permissions.')],
        ephemeral: true,
      });
    }

    const symbol = STYLES[interaction.options.getString('style') || 'arrow'];
    await interaction.reply({
      embeds: [embed.info(`🛠️ Building your server with the **${symbol}** style… this takes a moment.`)],
    });

    // Roles used by moderation + staff-only areas.
    const mutedRole = await ensureRole(guild, 'Muted', {
      color: 0x607d8b,
      reason: 'Zah Hub setup: mute role',
      permissions: [],
    });
    const staffRole = await ensureRole(guild, 'Staff', {
      color: 0x5865f2,
      hoist: true,
      reason: 'Zah Hub setup: staff role',
    });

    const everyone = guild.roles.everyone;
    const created = { categories: 0, text: 0, voice: 0 };
    const settings = {};
    let panelChannel = null;

    for (const cat of TEMPLATE) {
      const overwrites = [
        {
          id: mutedRole.id,
          deny: [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.SendMessagesInThreads,
            PermissionFlagsBits.CreatePublicThreads,
          ],
        },
      ];
      if (cat.staffOnly) {
        overwrites.push({ id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] });
        overwrites.push({ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel] });
      }

      const category = await guild.channels.create({
        name: `${cat.emoji}・${cat.name}`,
        type: ChannelType.GuildCategory,
        permissionOverwrites: overwrites,
      });
      created.categories++;

      for (const ch of cat.channels || []) {
        const channel = await guild.channels.create({
          name: `${symbol}${ch.name}`,
          type: ChannelType.GuildText,
          parent: category.id,
        });
        await channel.lockPermissions().catch(() => {});
        created.text++;
        if (ch.setting) settings[ch.setting] = channel.id;
        if (ch.panel === 'ticket') panelChannel = channel;
      }

      for (const vc of cat.voice || []) {
        await guild.channels.create({
          name: `${symbol} ${vc.name}`,
          type: ChannelType.GuildVoice,
          parent: category.id,
        });
        created.voice++;
      }
    }

    // Persist auto-wired config + the muted role id.
    for (const [k, v] of Object.entries(settings)) client.db.setSetting(guild.id, k, v);
    client.db.setSetting(guild.id, 'mutedRole', mutedRole.id);
    client.db.setSetting(guild.id, 'staffRole', staffRole.id);

    // Drop a ticket panel in the support channel.
    if (panelChannel) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket:create')
          .setLabel('Open a Ticket')
          .setEmoji('🎫')
          .setStyle(ButtonStyle.Primary),
      );
      panelChannel
        .send({
          embeds: [
            embed
              .brand('🎫 Support Tickets', 'Need help? Click the button below to open a private ticket with staff.')
              .setColor(embed.COLORS.brand),
          ],
          components: [row],
        })
        .catch(() => {});
    }

    const summary = embed
      .success(
        `Your server is ready! 🖤\n\n` +
          `**Categories:** ${created.categories}\n` +
          `**Text channels:** ${created.text}\n` +
          `**Voice channels:** ${created.voice}\n` +
          `**Roles created:** Muted, Staff\n\n` +
          `Mod-log, welcome, tickets, starboard, suggestions & level-up channels were auto-configured. ` +
          `Run \`/config view\` to review everything.`,
        'Setup Complete',
      )
      .setColor(embed.COLORS.success);

    await interaction.editReply({ embeds: [summary] });
  },
};
