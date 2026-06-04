const { SlashCommandBuilder } = require('discord.js');
const embed = require('../../lib/embed');
const music = require('../../lib/music');

const NEED = '`@discordjs/voice`, `play-dl`, `libsodium-wrappers` and `ffmpeg-static`';

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set the loop mode.')
    .addStringOption((o) =>
      o.setName('mode').setDescription('Loop mode').setRequired(true)
        .addChoices(
          { name: 'off', value: 'off' },
          { name: 'track', value: 'track' },
          { name: 'queue', value: 'queue' },
        ))
    .setDMPermission(false),

  async execute(interaction) {
    if (!music.loadVoice().available) {
      return interaction.reply({
        embeds: [embed.error(`Music playback requires ${NEED} to be installed (these need network access to install). It is unavailable here.`, 'Music unavailable')],
        ephemeral: true,
      });
    }

    const state = music.getState(interaction.guild.id);
    if (!state || !state.playing) {
      return interaction.reply({ embeds: [embed.error('Nothing is currently playing.')], ephemeral: true });
    }

    const mode = interaction.options.getString('mode');
    state.loop = mode;
    return interaction.reply({ embeds: [embed.success(`Loop mode set to **${mode}**.`)] });
  },
};
