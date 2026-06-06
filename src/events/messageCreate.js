const { runAutomod } = require('../lib/automod');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;
    await runAutomod(message, client);
  },
};
