const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');

const MAX_LEN = 200;

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('setbio')
    .setDescription('Set your profile bio.')
    .addStringOption((o) =>
      o.setName('text').setDescription('Your new bio (max 200 chars)').setRequired(true).setMaxLength(MAX_LEN))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const text = interaction.options.getString('text');

    if (text.length > MAX_LEN) {
      return interaction.reply({
        embeds: [embed.error(`Your bio is too long (${text.length}/${MAX_LEN} characters).`)],
        ephemeral: true,
      });
    }

    const rec = client.db.user(gid, interaction.user.id);
    rec.bio = text;
    client.db.save(gid);

    return interaction.reply({ embeds: [embed.success('Your bio has been updated!')], ephemeral: true });
  },
};
