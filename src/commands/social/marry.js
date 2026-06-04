const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const embed = require('../../lib/embed');

module.exports = {
  category: 'social',
  data: new SlashCommandBuilder()
    .setName('marry')
    .setDescription('Propose marriage to another user.')
    .addUserOption((o) =>
      o.setName('user').setDescription('The user to propose to').setRequired(true))
    .setDMPermission(false),

  async execute(interaction, client) {
    const gid = interaction.guild.id;
    const partner = interaction.options.getUser('user');
    const author = interaction.user;

    if (partner.bot) {
      return interaction.reply({ embeds: [embed.error('You cannot marry a bot.')], ephemeral: true });
    }
    if (partner.id === author.id) {
      return interaction.reply({ embeds: [embed.error('You cannot marry yourself.')], ephemeral: true });
    }

    const authorRec = client.db.user(gid, author.id);
    const partnerRec = client.db.user(gid, partner.id);

    if (authorRec.marriedTo) {
      return interaction.reply({ embeds: [embed.error('You are already married. Use `/divorce` first.')], ephemeral: true });
    }
    if (partnerRec.marriedTo) {
      return interaction.reply({ embeds: [embed.error(`**${partner.username}** is already married to someone else.`)], ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('marry:accept').setLabel('Accept 💍').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('marry:decline').setLabel('Decline 💔').setStyle(ButtonStyle.Danger),
    );

    const proposal = embed.brand(
      '💍 Marriage Proposal',
      `${partner}, **${author.username}** has proposed to you!\n\nDo you accept?`,
    );

    const message = await interaction.reply({
      content: `${partner}`,
      embeds: [proposal],
      components: [row],
      fetchReply: true,
    });

    let collector;
    try {
      collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === partner.id,
        time: 60_000,
        max: 1,
      });
    } catch {
      return;
    }

    collector.on('collect', async (i) => {
      // Re-check marital status at decision time.
      const aRec = client.db.user(gid, author.id);
      const pRec = client.db.user(gid, partner.id);

      if (i.customId === 'marry:accept') {
        if (aRec.marriedTo || pRec.marriedTo) {
          return i.update({
            embeds: [embed.error('One of you got married in the meantime. Proposal cancelled.')],
            components: [],
          });
        }
        aRec.marriedTo = partner.id;
        pRec.marriedTo = author.id;
        client.db.save(gid);
        return i.update({
          embeds: [embed.success(`**${author.username}** and **${partner.username}** are now married! 💖`, '💍 Congratulations!')],
          components: [],
        });
      }
      return i.update({
        embeds: [embed.warn(`**${partner.username}** declined the proposal. 💔`)],
        components: [],
      });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          embeds: [embed.warn('The proposal timed out with no response. ⏳')],
          components: [],
        }).catch(() => {});
      }
    });
  },
};
