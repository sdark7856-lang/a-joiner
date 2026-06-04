const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../lib/embed');

const COLS = 7;
const ROWS = 6;
const EMPTY = '⚪';
const TOKENS = { R: '🔴', Y: '🟡' };
const COL_EMOJI = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function render(board) {
  let out = '';
  for (let r = 0; r < ROWS; r += 1) {
    out += board[r].map((c) => (c ? TOKENS[c] : EMPTY)).join('') + '\n';
  }
  out += COL_EMOJI.join('');
  return out;
}

function drop(board, col, mark) {
  for (let r = ROWS - 1; r >= 0; r -= 1) {
    if (board[r][col] === null) {
      board[r][col] = mark;
      return r;
    }
  }
  return -1;
}

function checkWin(board, mark) {
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (board[r][c] !== mark) continue;
      const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (const [dr, dc] of dirs) {
        let count = 0;
        for (let k = 0; k < 4; k += 1) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === mark) count += 1;
          else break;
        }
        if (count === 4) return true;
      }
    }
  }
  return false;
}

function buildRows(board, disabled) {
  const rows = [];
  for (let group = 0; group < 2; group += 1) {
    const row = new ActionRowBuilder();
    for (let c = group * 4; c < Math.min(group * 4 + 4, COLS); c += 1) {
      const full = board[0][c] !== null;
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`c4_${c}`)
          .setLabel(`${c + 1}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(disabled || full),
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('connect4')
    .setDescription('Play Connect Four against another member.')
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

    const board = emptyBoard();
    const players = { R: challenger, Y: opponent };
    let current = 'R';

    const statusText = () => `${players.R} (🔴) vs ${players.Y} (🟡)\n\n${render(board)}\n\nTurn: ${players[current]} (${TOKENS[current]})`;

    const msg = await interaction.reply({
      embeds: [embed.brand('🔵 Connect Four', statusText())],
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

      const col = parseInt(i.customId.split('_')[1], 10);
      const placed = drop(board, col, current);
      if (placed === -1) {
        await i.deferUpdate();
        return;
      }

      if (checkWin(board, current)) {
        await i.update({
          embeds: [embed.success(`${players[current]} (${TOKENS[current]}) wins! 🎉\n\n${render(board)}`, '🔵 Connect Four')],
          components: buildRows(board, true),
        });
        collector.stop('done');
        return;
      }

      if (board[0].every((c) => c !== null)) {
        await i.update({
          embeds: [embed.warn(`It's a draw!\n\n${render(board)}`, '🔵 Connect Four')],
          components: buildRows(board, true),
        });
        collector.stop('done');
        return;
      }

      current = current === 'R' ? 'Y' : 'R';
      await i.update({
        embeds: [embed.brand('🔵 Connect Four', statusText())],
        components: buildRows(board, false),
      });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason !== 'done') {
        await interaction.editReply({
          embeds: [embed.warn(`Game timed out.\n\n${render(board)}`, '🔵 Connect Four')],
          components: buildRows(board, true),
        }).catch(() => {});
      }
    });
  },
};
