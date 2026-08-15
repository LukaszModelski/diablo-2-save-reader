/**
 * Diablo II (.d2s) Save File Reader / Parser
 * Gathers every loose rune across all save files, sorts them from highest
 * level to lowest, and consolidates them into mule characters, in priority
 * order: Mule-runes -> mule-runess -> mule-runesss. Each mule is filled to
 * capacity (Inventory + Stash + Cube) before overflow moves to the next one.
 *
 * Runes socketed into gear are left untouched (they're deliberately placed
 * there for a runeword, not loose inventory) — only stashed/inventoried/
 * cubed runes are collected and moved.
 *
 * Always backs up the target saves folder before writing anything.
 *
 * Usage:
 *   node src/sort-runes.js <path-to-saves-folder>            (writes changes)
 *   node src/sort-runes.js <path-to-saves-folder> --dry-run  (prints the plan, touches nothing)
 */

const fs = require('fs');
const path = require('path');

const { ITEM_DATABASE } = require('./constants');
const {
  CONTAINERS,
  finalize,
  findItemList,
  getItemCode,
  isSimpleItem,
  getLocation,
  buildSimpleItem,
  backupSavesDir,
} = require('./d2sBinary');

// Destination mules, in fill priority order (first is filled to capacity before
// overflow moves to the next). Matched against saves/ case-sensitively, since
// that's how these files are actually named on disk.
const DESTINATIONS = ['Mule-runes.d2s', 'mule-runess.d2s', 'mule-runesss.d2s'];

const RUNE_CODE_TO_NAME = {};
const RUNE_CODE_TO_LEVEL = {};
Object.entries(ITEM_DATABASE).forEach(([code, e]) => {
  if (e.type === 'Rune') { RUNE_CODE_TO_NAME[code] = e.name; RUNE_CODE_TO_LEVEL[code] = e.level; }
});

function run(savesDir, { dryRun = false } = {}) {
  if (!fs.existsSync(savesDir)) throw new Error(`Saves directory not found at ${savesDir}`);

  const files = fs.readdirSync(savesDir).filter(f => f.toLowerCase().endsWith('.d2s'));
  if (files.length === 0) {
    throw new Error(`No Diablo II save files (.d2s) found in "${savesDir}".`);
  }
  const buffers = {};
  files.forEach(f => { buffers[f] = fs.readFileSync(path.join(savesDir, f)); });

  // ---- 1. Find every LOOSE rune in every file (skip anything socketed into gear) ----
  const runeLocations = {};
  const runeCounts = {};
  let donorTemplate = null;
  let socketedSkipped = 0;
  files.forEach(f => {
    const buf = buffers[f];
    const list = findItemList(buf);
    if (!list) return;
    const runes = [];
    list.ranges.forEach(([s, e]) => {
      const code = getItemCode(buf, s);
      const name = RUNE_CODE_TO_NAME[code];
      if (!name) return;
      const loc = getLocation(buf, s);
      if (loc.location === 6) { socketedSkipped++; return; } // socketed into gear — leave it alone
      if (!isSimpleItem(buf, s) || (e - s) !== 14) {
        throw new Error(`Unexpected rune item shape in ${f} at byte ${s}: simple=${isSimpleItem(buf, s)} len=${e - s}`);
      }
      runes.push({ start: s, end: e, code, name, level: RUNE_CODE_TO_LEVEL[code] });
      runeCounts[name] = (runeCounts[name] || 0) + 1;
      if (!donorTemplate) donorTemplate = buf.subarray(s, e);
    });
    if (runes.length) runeLocations[f] = runes;
  });

  if (!donorTemplate) throw new Error('No loose runes found in any save file — nothing to sort.');

  console.log('=== Current loose rune tally across all saves ===');
  console.log(runeCounts);
  const totalBefore = Object.values(runeCounts).reduce((a, b) => a + b, 0);
  console.log('Total loose runes:', totalBefore, '| socketed runes left untouched:', socketedSkipped);

  // ---- 2. Sort highest level first (no merging — runes don't combine) ----
  const allRunes = Object.values(runeLocations).flat();
  allRunes.sort((a, b) => b.level - a.level);
  const finalList = allRunes.map(r => r.code);

  // ---- 3. Figure out each destination's current occupancy (after its own runes are removed) ----
  const destInfo = {};
  DESTINATIONS.forEach(f => {
    const buf = buffers[f];
    if (!buf) throw new Error(`Destination file ${f} not found in ${savesDir}`);
    const list = findItemList(buf);
    const runeStarts = new Set((runeLocations[f] || []).map(r => r.start));
    const occupied = { 1: new Set(), 4: new Set(), 5: new Set() };
    list.ranges.forEach(([s]) => {
      if (runeStarts.has(s)) return; // being removed, doesn't count as occupying a slot afterward
      const loc = getLocation(buf, s);
      if (loc.location === 0 && occupied[loc.container]) occupied[loc.container].add(`${loc.x},${loc.y}`);
    });
    let free = 0;
    CONTAINERS.forEach(c => { free += (c.w * c.h) - occupied[c.id].size; });
    destInfo[f] = { occupied, free };
  });

  const totalFree = DESTINATIONS.reduce((sum, f) => sum + destInfo[f].free, 0);
  console.log('\n=== Destination free capacity (after removing their own runes) ===');
  DESTINATIONS.forEach(f => console.log(' ', f, '-> free:', destInfo[f].free));
  console.log('Total free capacity:', totalFree, '| runes to place:', finalList.length);
  if (finalList.length > totalFree) {
    throw new Error(
      `Not enough room: ${finalList.length} runes but only ${totalFree} free slots across ` +
      DESTINATIONS.join(', ') + '. Free up space (or add another destination) and re-run.'
    );
  }

  // ---- 4. Allocate runes into destinations in priority order, highest level first ----
  const plan = {}; // file -> [{code,name,level,containerId,x,y}]
  DESTINATIONS.forEach(f => (plan[f] = []));
  let cursor = 0;
  for (const f of DESTINATIONS) {
    if (cursor >= finalList.length) break;
    const info = destInfo[f];
    for (const c of CONTAINERS) {
      if (cursor >= finalList.length) break;
      for (let y = 0; y < c.h && cursor < finalList.length; y++) {
        for (let x = 0; x < c.w && cursor < finalList.length; x++) {
          const key = `${x},${y}`;
          if (info.occupied[c.id].has(key)) continue;
          const code = finalList[cursor];
          plan[f].push({ code, name: RUNE_CODE_TO_NAME[code], level: RUNE_CODE_TO_LEVEL[code], containerId: c.id, x, y });
          info.occupied[c.id].add(key);
          cursor++;
        }
      }
    }
  }

  console.log('\n=== Placement plan (highest level first) ===');
  DESTINATIONS.forEach(f => {
    console.log(' ', f, '->', plan[f].length, 'runes:', plan[f].map(p => p.name).join(', ') || '(none)');
  });

  if (dryRun) {
    console.log('\nDRY RUN — no files modified.');
    return { finalList, plan };
  }

  // ---- 5. Backup ----
  const backupDir = backupSavesDir(savesDir, files);
  console.log('\nBacked up all', files.length, 'save files to', backupDir);

  // ---- 6. Write: remove loose runes from every file, insert the plan into destinations ----
  files.forEach(f => {
    const runes = runeLocations[f];
    const insertions = plan[f] || [];
    if (!runes && !insertions.length) return;

    const buf = buffers[f];
    const list = findItemList(buf);
    const removeSet = new Set((runes || []).map(r => r.start));
    const keptChunks = [];
    list.ranges.forEach(([s, e]) => { if (!removeSet.has(s)) keptChunks.push(buf.subarray(s, e)); });

    const newItems = insertions.map(p => buildSimpleItem(donorTemplate, p.code, p.containerId, p.x, p.y));
    const newItemSection = Buffer.concat([...keptChunks, ...newItems]);

    const newBuf = Buffer.concat([
      buf.subarray(0, list.jmPos + 4),
      newItemSection,
      buf.subarray(list.listEnd),
    ]);

    const newItemCount = list.itemCount - (runes ? runes.length : 0) + insertions.length;
    newBuf.writeUInt16LE(newItemCount, list.jmPos + 2);
    finalize(newBuf);
    fs.writeFileSync(path.join(savesDir, f), newBuf);
    console.log(
      `${f}: removed ${runes ? runes.length : 0} rune(s), inserted ${insertions.length} rune(s)`,
      `(item count ${list.itemCount} -> ${newItemCount}, size ${buf.length} -> ${newBuf.length})`
    );
  });

  console.log('\nDone.');
  return { finalList, plan, backupDir };
}

module.exports = { run };

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const pathArg = args.find(a => !a.startsWith('--'));
  if (!pathArg) {
    console.error('Usage: node src/sort-runes.js <path-to-saves-folder> [--dry-run]');
    process.exit(1);
  }
  const savesDir = path.resolve(pathArg);
  try {
    run(savesDir, { dryRun });
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
