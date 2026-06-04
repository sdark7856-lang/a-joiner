const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function stamp() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function log(color, label, args) {
  console.log(`${COLORS.dim}${stamp()}${COLORS.reset} ${color}${label}${COLORS.reset}`, ...args);
}

module.exports = {
  info: (...a) => log(COLORS.cyan, '[INFO ]', a),
  warn: (...a) => log(COLORS.yellow, '[WARN ]', a),
  error: (...a) => log(COLORS.red, '[ERROR]', a),
  success: (...a) => log(COLORS.green, '[ OK  ]', a),
  debug: (...a) => log(COLORS.magenta, '[DEBUG]', a),
};
