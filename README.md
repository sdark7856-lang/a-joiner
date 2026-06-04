# 🖤 Zah Hub

An all-in-one Discord bot with **120+ features** and **automatic server setup**. Built on [discord.js](https://discord.js.org) v14.

One command — `/setup` — builds your entire server: categories, channels (with decorative icons beside every name), roles, and wires up logging, welcome, tickets, starboard, suggestions and level-ups automatically.

---

## ✨ Highlights

- **🏗️ Auto server setup** — `/setup` creates a full, themed server in seconds. Pick the icon style placed beside each channel name (`➜`, `➤`, `⟫`, `•`, `・`, `┃`, `⊹`, `🖤`).
- **🛡️ Full moderation** — warn (with auto-escalation), mute, kick, ban (+ temp-ban), softban, purge, lock/unlock, lockdown, slowmode, nick, and a **case system** with mod-logs.
- **🤖 Auto-moderation** — anti-spam, anti-invite, anti-link, anti-caps, mention spam, profanity filter, account-age gate, raid detection.
- **📋 Audit logging** — message edits/deletes, joins/leaves, role/nick changes, channel changes, voice activity.
- **🎭 Roles** — button roles, dropdown roles, reaction roles, autorole, role persistence, level rewards, temp roles, mass role.
- **📈 Leveling** — XP per message, ranks, leaderboard, level-up announcements, role rewards.
- **💰 Economy** — coins, daily/work/crime, rob, coinflip/slots/dice, shop, inventory, bank, richest leaderboard.
- **🎮 Games** — trivia, hangman, tic-tac-toe, connect four, RPS, 8ball, would-you-rather, truth-or-dare, ship, guess-the-number.
- **🎵 Music** — queue, skip, loop, volume, shuffle, pause/resume (requires optional voice deps).
- **🎫 Tickets** — button-based ticket panel with private channels and transcripts.
- **🤝 Social** — rep, marriage, profiles, bios, birthdays, starboard, suggestions, confessions.
- **📊 Utility** — polls, embed builder, reminders, AFK, whois, server/role/channel info, avatar, color preview, bot stats.
- **🔔 Notifications** — YouTube / Twitch / Reddit / RSS alert subscriptions.

---

## 🚀 Setup

### 1. Create a bot application
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
2. **Bot** tab → **Add Bot**. Copy the **token**.
3. Enable all three **Privileged Gateway Intents** (Presence, Server Members, Message Content).
4. **OAuth2 → URL Generator**: scopes `bot` + `applications.commands`, then `Administrator` permission (or the granular set you prefer). Use the generated URL to invite the bot.

### 2. Configure
```bash
git clone <repo-url>
cd a-joiner
npm install
cp .env.example .env
# edit .env: DISCORD_TOKEN, CLIENT_ID, (optional) GUILD_ID
```

### 3. Run
```bash
npm start        # production
npm run dev      # auto-restart on file changes
```
Slash commands register automatically on startup. Set `GUILD_ID` in `.env` for **instant** registration while developing (global commands can take up to an hour to appear).

### 4. Build your server
In Discord, run **`/setup`** and pick an icon style. Then `/config view` to review everything that was wired up.

---

## ⚙️ Configuration

Everything is configured in-Discord — no editing files:

| Command | What it does |
|---|---|
| `/config view` | Show the full current configuration |
| `/config channel` | Point a feature (mod-log, welcome, starboard…) at a channel |
| `/config welcome` / `goodbye` | Set join/leave messages (`{user}`, `{server}`, `{count}`) |
| `/config autorole` | Role given automatically on join |
| `/config automod` | Toggle individual auto-mod filters |
| `/config levels` | Enable/disable the XP system |
| `/security antiraid` | Mass-join raid detection |
| `/security accountage` | Auto-kick accounts under N days old |

Run **`/help`** in Discord for the complete, always-up-to-date command list.

---

## 🎵 Optional: Music

Music needs extra native packages (already listed as `optionalDependencies`):
```bash
npm install @discordjs/voice play-dl libsodium-wrappers ffmpeg-static
```
Without them the bot runs fine — music commands simply reply that the feature isn't installed.

---

## 🗂️ Project structure

```
src/
├── index.js              # client + dynamic loaders
├── config.js             # env config
├── commands/             # one file per slash command, grouped by category
│   ├── setup/  moderation/  config/  leveling/  economy/
│   ├── fun/  music/  utility/  social/  roles/  notifications/  general/
├── events/               # gateway event handlers (automod, xp, welcome, logging…)
├── components/           # persistent buttons/menus (tickets, roles, suggestions)
└── lib/                  # db, embeds, cases, leveling, duration, automod helpers
data/                     # per-guild JSON storage (gitignored)
```

Persistence is a lightweight per-guild JSON store (`src/lib/db.js`) — no database required to get started. Swap it for Postgres/Redis later by reimplementing that one module.

---

## License

MIT
