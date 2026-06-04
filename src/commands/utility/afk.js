const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set yourself as AFK.')
    .addStringOption((o) => o.setName('reason').setDescription('Why you are AFK'))
    .setDMPermission(false),

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'AFK';
    const gid = interaction.guild.id;
    const afk = client.db.store(gid, 'afk');
    afk[interaction.user.id] = { reason, since: Date.now() };
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.success(`You are now AFK: ${reason}`)],
    });
  },
};
