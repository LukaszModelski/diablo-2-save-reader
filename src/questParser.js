/**
 * Parser for Quests ('Woo!' section)
 */

function parseQuests(buf) {
  const wooOffset = 335;
  const diffs = ['Normal', 'Nightmare', 'Hell'];
  const results = {};

  diffs.forEach((diff, dIdx) => {
    const diffBase = wooOffset + 10 + (dIdx * 96);
    let completedCount = 0;
    for (let q = 0; q < 27; q++) {
      const val = buf.readUInt16LE(diffBase + (q * 2));
      if (val & 0x01) completedCount++;
    }
    results[diff] = { completed: completedCount, total: 27 };
  });

  return results;
}

module.exports = {
  parseQuests
};
