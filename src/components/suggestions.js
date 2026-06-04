const { EmbedBuilder } = require('discord.js');

// customId: "suggest:up" / "suggest:down". Vote state stored on the embed footer.
module.exports = {
  id: 'suggest:',
  async execute(interaction, client) {
    const dir = interaction.customId.split(':')[1];
    const gid = interaction.guild.id;
    const votes = client.db.store(gid, 'suggestionVotes');
    const key = interaction.message.id;
    if (!votes[key]) votes[key] = { up: [], down: [] };
    const v = votes[key];
    const uid = interaction.user.id;

    // Toggle: a user has at most one vote.
    v.up = v.up.filter((x) => x !== uid);
    v.down = v.down.filter((x) => x !== uid);
    if (dir === 'up') v.up.push(uid);
    else v.down.push(uid);
    client.db.save(gid);

    const old = interaction.message.embeds[0];
    const embed = EmbedBuilder.from(old).setFooter({ text: `👍 ${v.up.length}  •  👎 ${v.down.length}` });
    await interaction.update({ embeds: [embed] });
  },
};
