const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('divorce')
    .setDescription('End your current marriage.')
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const rec = client.db.user(gid, interaction.user.id);

    if (!rec.marriedTo) {
      return interaction.reply({ embeds: [embed.error('You are not married to anyone.')], ephemeral: true });
    }

    const partnerId = rec.marriedTo;
    const partnerRec = client.db.user(gid, partnerId);

    rec.marriedTo = null;
    if (partnerRec.marriedTo === interaction.user.id) {
      partnerRec.marriedTo = null;
    }
    client.db.save(gid);

    return interaction.reply({
      embeds: [embed.info(`💔 **${interaction.user.username}** and <@${partnerId}> are no longer married.`, '💔 Divorce')],
    });
  },
};
