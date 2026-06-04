// Periodic background jobs: lift expired temp-bans.
module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    const checkTempBans = async () => {
      const now = Date.now();
      for (const guild of client.guilds.cache.values()) {
        const tempBans = client.db.store(guild.id, 'tempBans');
        let changed = false;
        for (const [userId, expiresAt] of Object.entries(tempBans)) {
          if (expiresAt <= now) {
            await guild.bans.remove(userId, 'Temp-ban expired').catch(() => {});
            delete tempBans[userId];
            changed = true;
          }
        }
        if (changed) client.db.save(guild.id);
      }
    };
    setInterval(checkTempBans, 60_000);
    client.logger.info('Scheduler started (temp-ban expiry).');
  },
};
