const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const CATEGORY_META = {
  moderation: { emoji: '🛡️', label: 'Moderation' },
  automod: { emoji: '🤖', label: 'Auto-Moderation' },
  config: { emoji: '⚙️', label: 'Configuration' },
  setup: { emoji: '🏗️', label: 'Server Setup' },
  leveling: { emoji: '📈', label: 'Leveling' },
  economy: { emoji: '💰', label: 'Economy' },
  fun: { emoji: '🎮', label: 'Games & Fun' },
  music: { emoji: '🎵', label: 'Music' },
  utility: { emoji: '📊', label: 'Utility' },
  social: { emoji: '🤝', label: 'Social' },
  roles: { emoji: '🎭', label: 'Roles' },
  notifications: { emoji: '🔔', label: 'Notifications' },
  general: { emoji: '🖤', label: 'General' },
};

module.exports = {
  category: 'general',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List every Zah Hub command, grouped by category.')
    .addStringOption((o) => o.setName('category').setDescription('Show only one category')),

  async execute(interaction, client) {
    const grouped = new Map();
    for (const cmd of client.commands.values()) {
      const cat = cmd.category || 'general';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(cmd.data.name);
    }

    const filter = interaction.options.getString('category')?.toLowerCase();
    const e = embed.base().setTitle('🖤 Zah Hub — Command Help')
      .setDescription(`I have **${client.commands.size}** commands across **${grouped.size}** categories.\nUse \`/help category:<name>\` to focus on one.`);

    const cats = [...grouped.keys()].sort();
    for (const cat of cats) {
      if (filter && cat !== filter) continue;
      const meta = CATEGORY_META[cat] || { emoji: '•', label: cat };
      const names = grouped.get(cat).sort().map((n) => `\`${n}\``).join(' ');
      e.addFields({ name: `${meta.emoji} ${meta.label} (${grouped.get(cat).length})`, value: names.slice(0, 1024) });
    }
    if (filter && !grouped.has(filter)) {
      return interaction.reply({ embeds: [embed.error(`No category named **${filter}**.`)], ephemeral: true });
    }
    return interaction.reply({ embeds: [e] });
  },
};
