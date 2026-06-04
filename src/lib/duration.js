const UNITS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
};

/** Parse strings like "10m", "2h", "1d30m" into milliseconds. Returns null if invalid. */
function parseDuration(input) {
  if (!input) return null;
  const matches = String(input).toLowerCase().match(/(\d+)\s*(w|d|h|m|s)/g);
  if (!matches) return null;
  let ms = 0;
  for (const part of matches) {
    const [, num, unit] = part.match(/(\d+)\s*(w|d|h|m|s)/);
    ms += parseInt(num, 10) * UNITS[unit];
  }
  return ms || null;
}

/** Human-readable duration from milliseconds, e.g. 90000 -> "1m 30s". */
function formatDuration(ms) {
  if (ms < 1000) return '0s';
  const parts = [];
  const units = [
    ['d', UNITS.d],
    ['h', UNITS.h],
    ['m', UNITS.m],
    ['s', UNITS.s],
  ];
  let rem = ms;
  for (const [label, size] of units) {
    const v = Math.floor(rem / size);
    if (v > 0) {
      parts.push(`${v}${label}`);
      rem -= v * size;
    }
  }
  return parts.slice(0, 3).join(' ');
}

module.exports = { parseDuration, formatDuration, UNITS };
