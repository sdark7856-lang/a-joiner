const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * Tiny JSON-file persistence, one file per guild. Everything is held in memory
 * and flushed to disk on write. Good enough for a single-process bot without a
 * database dependency; swap this module out for Postgres/Redis later if needed.
 */
class DB {
  constructor() {
    this.cache = new Map();
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _file(guildId) {
    return path.join(DATA_DIR, `${guildId}.json`);
  }

  /** Returns the full mutable data object for a guild. Mutate it, then call save(). */
  data(guildId) {
    if (this.cache.has(guildId)) return this.cache.get(guildId);
    let data = { settings: {}, users: {}, cases: [], store: {} };
    const f = this._file(guildId);
    if (fs.existsSync(f)) {
      try {
        data = { ...data, ...JSON.parse(fs.readFileSync(f, 'utf8')) };
      } catch {
        /* corrupt file -> start fresh */
      }
    }
    this.cache.set(guildId, data);
    return data;
  }

  save(guildId) {
    const data = this.cache.get(guildId);
    if (!data) return;
    fs.writeFileSync(this._file(guildId), JSON.stringify(data, null, 2));
  }

  /** Guild-wide settings (config). */
  settings(guildId) {
    return this.data(guildId).settings;
  }

  getSetting(guildId, key, def = null) {
    const v = this.settings(guildId)[key];
    return v === undefined ? def : v;
  }

  setSetting(guildId, key, value) {
    this.settings(guildId)[key] = value;
    this.save(guildId);
  }

  /** Per-member record (xp, coins, warns, etc). */
  user(guildId, userId) {
    const data = this.data(guildId);
    if (!data.users[userId]) {
      data.users[userId] = { xp: 0, level: 0, coins: 0, bank: 0, warns: [], rep: 0 };
    }
    return data.users[userId];
  }

  allUsers(guildId) {
    return this.data(guildId).users;
  }

  /** Generic namespaced key/value store for misc feature state. */
  store(guildId, namespace) {
    const data = this.data(guildId);
    if (!data.store[namespace]) data.store[namespace] = {};
    return data.store[namespace];
  }
}

module.exports = DB;
