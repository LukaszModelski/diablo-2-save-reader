/**
 * Parser for Waypoints ('WS' section)
 */

function parseWaypoints(buf) {
  const wsOffset = 633;
  const diffs = ['Normal', 'Nightmare', 'Hell'];
  const results = {};

  diffs.forEach((diff, dIdx) => {
    const wpBase = wsOffset + 8 + (dIdx * 24) + 2;
    let unlocked = 0;
    for (let i = 0; i < 39; i++) {
      const byteIdx = Math.floor(i / 8);
      const bitIdx = i % 8;
      if ((buf[wpBase + byteIdx] >> bitIdx) & 1) unlocked++;
    }
    results[diff] = { unlocked, total: 39 };
  });

  return results;
}

module.exports = {
  parseWaypoints
};
