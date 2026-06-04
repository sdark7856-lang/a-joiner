// Manually (re)deploy or clear slash commands without starting the bot.
//   node scripts/deploy-commands.js          -> register all commands
//   node scripts/deploy-commands.js --clear  -> remove all commands
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../src/config');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const clear = process.argv.includes('--clear');
const body = clear
  ? []
  : walk(path.join(__dirname, '..', 'src', 'commands'))
      .map((f) => require(f))
      .filter((c) => c?.data)
      .map((c) => c.data.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  const route = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);
  await rest.put(route, { body });
  console.log(clear ? 'Cleared all commands.' : `Deployed ${body.length} commands.`);
})().catch(console.error);
