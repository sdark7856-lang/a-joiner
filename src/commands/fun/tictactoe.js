const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../lib/embed');

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWin(board, mark) {
  return WIN_LINES.some((line) => line.every((i) => board[i] === mark));
}

function buildRows(board, disabled) {
  const rows = [];
  for (let r = 0; r < 3; r += 1) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c += 1) {
      const i = r * 3 + c;
      const cell = board[i];
      const btn = new ButtonBuilder()
        .setCustomId(`ttt_${i}`)
        .setStyle(cell === 'X' ? ButtonStyle.Danger : cell === 'O' ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(disabled || cell !== null);
      btn.setLabel(cell || '​');
      row.addComponents(btn);
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Play Tic-Tac-Toe against another member.')
    .addUserOption((o) => o.setName('opponent').setDescription('Who to play against').setRequired(true))
    .setDMPermission(false),

  async execute(interaction) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('opponent');

    if (opponent.bot) {
      return interaction.reply({ embeds: [embed.error('You cannot play against a bot.')], ephemeral: true });
    }
    if (opponent.id === challenger.id) {
      return interaction.reply({ embeds: [embed.error('You cannot play against yourself.')], ephemeral: true });
    }

    const board = Array(9).fill(null);
    const players = { X: challenger, O: opponent };
    let current = 'X';

    const statusText = () => `${players.X} (❌) vs ${players.O} (⭕)\n\nTurn: ${players[current]} (${current === 'X' ? '❌' : '⭕'})`;

    const msg = await interaction.reply({
      embeds: [embed.brand('⭕ Tic-Tac-Toe', statusText())],
      components: buildRows(board, false),
      fetchReply: true,
    });

    const filter = (i) => i.user.id === challenger.id || i.user.id === opponent.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== players[current].id) {
        await i.reply({ embeds: [embed.warn('It is not your turn.')], ephemeral: true });
        return;
      }

      const idx = parseInt(i.customId.split('_')[1], 10);
      if (board[idx] !== null) {
        await i.deferUpdate();
        return;
      }

      board[idx] = current;

      if (checkWin(board, current)) {
        await i.update({
          embeds: [embed.success(`${players[current]} (${current === 'X' ? '❌' : '⭕'}) wins! 🎉`, '⭕ Tic-Tac-Toe')],
          components: buildRows(board, true),
        });
        collector.stop('done');
        return;
      }

      if (board.every((c) => c !== null)) {
        await i.update({
          embeds: [embed.warn("It's a draw!", '⭕ Tic-Tac-Toe')],
          components: buildRows(board, true),
        });
        collector.stop('done');
        return;
      }

      current = current === 'X' ? 'O' : 'X';
      await i.update({
        embeds: [embed.brand('⭕ Tic-Tac-Toe', statusText())],
        components: buildRows(board, false),
      });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason !== 'done') {
        await interaction.editReply({
          embeds: [embed.warn('Game timed out.', '⭕ Tic-Tac-Toe')],
          components: buildRows(board, true),
        }).catch(() => {});
      }
    });
  },
};
