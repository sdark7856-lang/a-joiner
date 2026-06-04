// Standard MEE6-style curve: xp required to advance FROM `level` to the next.
function xpForLevel(level) {
  return 5 * level * level + 50 * level + 100;
}

// Total cumulative xp needed to BE at `level`.
function totalXpForLevel(level) {
  let total = 0;
  for (let i = 0; i < level; i++) total += xpForLevel(i);
  return total;
}

// Which level a given total xp corresponds to.
function levelForXp(xp) {
  let level = 0;
  while (xp >= totalXpForLevel(level + 1)) level++;
  return level;
}

module.exports = { xpForLevel, totalXpForLevel, levelForXp };
