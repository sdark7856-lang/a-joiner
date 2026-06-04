# 🌐 Hosting Zah Hub 24/7

Your bot only runs while the process is running. To keep it online when your PC
is off, host it somewhere that's always on. Pick **one** option below.

Before you start, have these three values ready (from the
[Discord Developer Portal](https://discord.com/developers/applications)):

- `DISCORD_TOKEN` — Bot tab → Reset/Copy token
- `CLIENT_ID` — General Information → Application ID
- `GUILD_ID` *(optional)* — your server ID (Discord → Developer Mode → right-click server → Copy ID). Setting it makes slash commands appear instantly.

> ⚠️ Never commit your token or paste it in chat/screenshots. Always put it in
> the host's **Environment Variables**, never in the code.

---

## Option A — Railway (easiest, recommended)

1. Push this repo to your own GitHub account (or fork it).
2. Go to **https://railway.app** → sign in with GitHub.
3. **New Project → Deploy from GitHub repo** → pick the repo.
4. Railway auto-detects Node and runs `npm install` + `npm start`.
5. Open the service → **Variables** tab → add:
   - `DISCORD_TOKEN` = your token
   - `CLIENT_ID` = your application id
   - `GUILD_ID` = your server id (optional)
6. **Deploy**. Open the **Logs** tab — you should see `Logged in as Zah Hub#...`.
7. In Discord, run `/setup`. Done. 🖤

Railway gives a small monthly free credit; this bot is light enough to run on it.

---

## Option B — Render (Blueprint included)

This repo ships a `render.yaml` worker blueprint.

1. Push the repo to GitHub.
2. Go to **https://render.com** → **New → Blueprint** → select the repo.
3. Render reads `render.yaml` and creates a **worker** service.
4. Fill in the environment variables it asks for (`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`).
5. **Apply** → watch the logs for the login message.

> Render background **workers** are on a paid plan. If you want the free tier,
> use Railway (Option A) or Fly.io (Option D) instead.

---

## Option C — Docker (any VPS or your own machine)

A `Dockerfile` is included.

```bash
# build the image
docker build -t zah-hub .

# run it (replace the values; -d = run in background, --restart keeps it alive)
docker run -d --name zah-hub --restart unless-stopped \
  -e DISCORD_TOKEN=your-token \
  -e CLIENT_ID=your-application-id \
  -e GUILD_ID=your-server-id \
  -v zah-data:/app/data \
  zah-hub
```

- `-v zah-data:/app/data` saves all server settings/economy/levels across restarts.
- View logs: `docker logs -f zah-hub`
- Update after code changes: `docker build -t zah-hub . && docker rm -f zah-hub` then run again.

---

## Option D — Plain VPS with PM2 (Ubuntu/Debian)

```bash
# install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# get the code
git clone https://github.com/sdark7856-lang/a-joiner
cd a-joiner
npm install
cp .env.example .env
nano .env            # paste your token, client id, guild id

# run it forever with PM2
sudo npm install -g pm2
pm2 start src/index.js --name zah-hub
pm2 save
pm2 startup          # follow the printed command so it survives reboots
```

Useful PM2 commands: `pm2 logs zah-hub`, `pm2 restart zah-hub`, `pm2 stop zah-hub`.

---

## Enabling Music on a host

Music is off by default to keep deploys small. To turn it on, install the
optional voice packages on your host (they need network + build tools):

```bash
npm install @discordjs/voice play-dl libsodium-wrappers ffmpeg-static
```

For Docker, remove `--omit=optional` from the `Dockerfile`'s `npm install` line
and add `RUN apk add --no-cache python3 make g++ ffmpeg` above it, then rebuild.

---

## Keeping data safe

All persistent data lives in the `data/` folder (per-guild JSON). On Docker use a
named volume (shown above); on Railway/Render the disk persists between deploys
of the same service. Back it up if it matters to you.
