const { EmbedBuilder } = require('discord.js');
const config = require('../config');

const COLORS = {
  brand: config.brandColor,
  success: 0x57f287,
  error: 0xed4245,
  warn: 0xfee75c,
  info: 0x5865f2,
};

function base(color = COLORS.brand) {
  return new EmbedBuilder().setColor(color).setTimestamp();
}

module.exports = {
  COLORS,
  base,
  brand: (title, desc) => base().setTitle(title ?? null).setDescription(desc ?? null),
  success: (desc, title) =>
    base(COLORS.success).setDescription(`✅ ${desc}`).setTitle(title ?? null),
  error: (desc, title) =>
    base(COLORS.error).setDescription(`❌ ${desc}`).setTitle(title ?? null),
  warn: (desc, title) =>
    base(COLORS.warn).setDescription(`⚠️ ${desc}`).setTitle(title ?? null),
  info: (desc, title) =>
    base(COLORS.info).setDescription(desc).setTitle(title ?? null),
};
