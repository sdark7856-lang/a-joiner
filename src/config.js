require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,
  prefix: process.env.PREFIX || '!',
  brandColor: parseInt(process.env.BRAND_COLOR || '2b2d31', 16),
  name: 'Zah Hub',
};
