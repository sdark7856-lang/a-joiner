const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
} = require('discord.js');

const config = require('./config');
const logger = require('./lib/logger');
const DB = require('./lib/db');

if (!config.token || !config.clientId) {
  logger.error('Missing DISCORD_TOKEN or CLIENT_ID. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User,
  ],
});

client.commands = new Collection();
client.components = [];
client.db = new DB();
client.logger = logger;
client.config = config;

/** Recursively collect every .js file under a directory. */
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

function loadCommands() {
  const files = walk(path.join(__dirname, 'commands'));
  for (const file of files) {
    const cmd = require(file);
    if (!cmd?.data || !cmd?.execute) {
      logger.warn(`Skipping invalid command file: ${path.basename(file)}`);
      continue;
    }
    cmd.category = cmd.category || path.basename(path.dirname(file));
    client.commands.set(cmd.data.name, cmd);
  }
  logger.success(`Loaded ${client.commands.size} commands.`);
}

function loadComponents() {
  const files = walk(path.join(__dirname, 'components'));
  for (const file of files) {
    const comp = require(file);
    if (!comp?.id || !comp?.execute) continue;
    client.components.push(comp);
  }
  logger.success(`Loaded ${client.components.length} component handlers.`);
}

function loadEvents() {
  const files = walk(path.join(__dirname, 'events'));
  let count = 0;
  for (const file of files) {
    const exported = require(file);
    const events = Array.isArray(exported) ? exported : [exported];
    for (const evt of events) {
      if (!evt?.name || !evt?.execute) continue;
      const handler = (...args) => evt.execute(...args, client);
      if (evt.once) client.once(evt.name, handler);
      else client.on(evt.name, handler);
      count++;
    }
  }
  logger.success(`Loaded ${count} event handlers.`);
}

async function registerSlashCommands() {
  const body = client.commands.map((c) => c.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    if (config.guildId) {
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
      logger.success(`Registered ${body.length} guild commands to ${config.guildId}.`);
    } else {
      await rest.put(Routes.applicationCommands(config.clientId), { body });
      logger.success(`Registered ${body.length} global commands (may take up to 1h to appear).`);
    }
  } catch (err) {
    logger.error('Failed to register slash commands:', err.message);
  }
}

loadCommands();
loadComponents();
loadEvents();

client.once('ready', () => registerSlashCommands());

process.on('unhandledRejection', (err) => logger.error('Unhandled rejection:', err));
process.on('uncaughtException', (err) => logger.error('Uncaught exception:', err));

client.login(config.token);
