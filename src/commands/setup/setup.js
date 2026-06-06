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

// Lean script-hub server: ~9 channels total. Normal chat, staff chat, a VC,
// and the essentials a script hub needs. `setting` keys auto-wire config.
const TEMPLATE = [
  {
    name: 'INFORMATION', emoji: '📢',
    channels: [{ name: 'announcements' }],
  },
  {
    name: 'SCRIPT HUB', emoji: '📜',
    channels: [
      { name: 'scripts' },
      { name: 'get-key' },
      { name: 'chat', setting: 'welcomeChannel' },
      { name: 'vouches' },
    ],
  },
  {
    name: 'SUPPORT', emoji: '🎫',
    channels: [{ name: 'create-ticket', setting: 'ticketChannel', panel: 'ticket' }],
  },
  {
    name: 'VOICE', emoji: '🔊',
    voice: [{ name: 'Voice Chat' }],
  },
  {
    name: 'STAFF', emoji: '🛡️', staffOnly: true,
    channels: [
      { name: 'staff-chat' },
      { name: 'mod-log', setting: 'modLogChannel' },
    ],
  },
];

// Staff & member role ladder. Created highest-first so Discord stacks them in
// the right order. Emoji icons sit beside each name. `admin` grants
// Administrator; `staff` roles can see the staff-only category.
const ROLE_TEMPLATE = [
  { key: 'owner', name: '👑 Owner', color: 0xf1c40f, hoist: true, admin: true },
  { key: 'headMod', name: '⚔️ Head Mod', color: 0xe74c3c, hoist: true, staff: true,
    perms: ['ModerateMembers', 'ManageMessages', 'KickMembers', 'BanMembers', 'ManageNicknames', 'MuteMembers', 'DeafenMembers', 'MoveMembers', 'ViewAuditLog', 'ManageThreads', 'ManageChannels'] },
  { key: 'headStaff', name: '🛡️ Head Staff', color: 0xe67e22, hoist: true, staff: true,
    perms: ['ModerateMembers', 'ManageMessages', 'KickMembers', 'BanMembers', 'ManageNicknames', 'MuteMembers', 'DeafenMembers', 'MoveMembers', 'ViewAuditLog'] },
  { key: 'staff', name: '⭐ Staff', color: 0x5865f2, hoist: true, staff: true,
    perms: ['ModerateMembers', 'ManageMessages', 'KickMembers', 'ManageNicknames'] },
  { key: 'mod', name: '🔨 Mod', color: 0x3498db, hoist: true, staff: true,
    perms: ['ModerateMembers', 'ManageMessages'] },
  { key: 'member', name: '👤 Member', color: 0x2ecc71, hoist: true, perms: [] },
  { key: 'muted', name: '💤 Muted', color: 0x4f545c, hoist: false, perms: [] },
];

async function ensureRole(guild, name, options) {
  const existing = guild.roles.cache.find((r) => r.name === name);
  if (existing) return existing;
  try {
    return await guild.roles.create({ name, ...options });
  } catch {
    // Bot may lack permission to grant some flags (e.g. Administrator); make a
    // cosmetic role instead so setup still completes.
    return guild.roles
      .create({ name, color: options.color, hoist: options.hoist, reason: options.reason })
      .catch(() => null);
  }
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

    // ----- Build the role ladder (highest first → correct hierarchy) -----
    const roles = {};
    const staffRoleIds = [];
    for (const def of ROLE_TEMPLATE) {
      let permissions = [];
      if (def.admin) permissions = [PermissionFlagsBits.Administrator];
      else if (def.perms) permissions = def.perms.map((p) => PermissionFlagsBits[p]).filter(Boolean);
      const role = await ensureRole(guild, def.name, {
        color: def.color,
        hoist: def.hoist,
        permissions,
        reason: 'Zah Hub setup: role ladder',
      });
      if (!role) continue;
      roles[def.key] = role;
      if (def.admin || def.staff) staffRoleIds.push(role.id);
    }
    const mutedRole = roles.muted;
    const staffRole = roles.staff;

    const everyone = guild.roles.everyone;
    const created = { categories: 0, text: 0, voice: 0 };
    const settings = {};
    let panelChannel = null;

    for (const cat of TEMPLATE) {
      const overwrites = [];
      if (mutedRole) {
        overwrites.push({
          id: mutedRole.id,
          deny: [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.SendMessagesInThreads,
            PermissionFlagsBits.CreatePublicThreads,
          ],
        });
      }
      if (cat.staffOnly) {
        overwrites.push({ id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] });
        for (const rid of staffRoleIds) overwrites.push({ id: rid, allow: [PermissionFlagsBits.ViewChannel] });
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

    // Persist auto-wired config + role ids.
    for (const [k, v] of Object.entries(settings)) client.db.setSetting(guild.id, k, v);
    if (mutedRole) client.db.setSetting(guild.id, 'mutedRole', mutedRole.id);
    if (staffRole) client.db.setSetting(guild.id, 'staffRole', staffRole.id);
    client.db.setSetting(
      guild.id,
      'roleIds',
      Object.fromEntries(Object.entries(roles).map(([k, r]) => [k, r.id])),
    );

    // Give bots the 🤖 Bots role and the server owner the 👑 Owner role.
    if (roles.bots) {
      for (const m of guild.members.cache.filter((mem) => mem.user.bot).values()) {
        m.roles.add(roles.bots).catch(() => {});
      }
    }
    if (roles.owner) {
      const owner = await guild.members.fetch(guild.ownerId).catch(() => null);
      owner?.roles.add(roles.owner).catch(() => {});
    }

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
          `**Roles created:** 👑 Owner › ⚔️ Head Mod › 🛡️ Head Staff › ⭐ Staff › 🔨 Mod › 👤 Member › 💤 Muted\n\n` +
          `Mod-log, welcome (chat) & ticket channels were auto-configured. ` +
          `Run \`/config view\` to review everything.`,
        'Setup Complete',
      )
      .setColor(embed.COLORS.success);

    await interaction.editReply({ embeds: [summary] });
  },
};
