/**
 * Diablo II (.d2s) Save File Reader / Parser
 * Gathers every loose jewel across all save files, sorts them from rarest
 * quality to most common, and consolidates them into mule characters, in
 * priority order: mule-jewels -> mule-jewelss. Each mule is filled to
 * capacity (Inventory + Stash + Cube) before overflow moves to the next one.
 *
 * Unlike gems/runes, jewels can carry magic/rare/unique/crafted affixes and
 * so aren't a fixed simple shape — each jewel's exact bytes (including any
 * affix data) are moved intact rather than being recreated from a template;
 * only the common location/position header bits (shared by every item type)
 * are touched.
 *
 * Jewels socketed into gear are left untouched — only stashed/inventoried/
 * cubed jewels are collected and moved.
 *
 * Always backs up the target saves folder before writing anything.
 *
 * Usage:
 *   node src/sort-jewels.js <path-to-saves-folder>            (writes changes)
 *   node src/sort-jewels.js <path-to-saves-folder> --dry-run  (prints the plan, touches nothing)
 */

const fs = require('fs');
const path = require('path');

const { QUALITIES } = require('./constants');
const {
  CONTAINERS,
  finalize,
  findItemList,
  getItemCode,
  getLocation,
  getQuality,
  repositionItem,
  backupSavesDir,
} = require('./d2sBinary');

// Destination mules, in fill priority order (first is filled to capacity before
// overflow moves to the next). Matched against saves/ case-sensitively, since
// that's how these files are actually named on disk.
const DESTINATIONS = ['mule-jewels.d2s', 'mule-jewelss.d2s'];

const JEWEL_CODE = 'jew';

// Rarest first. Set/Superior/Inferior can't actually happen on a real jewel,
// but are ranked here too so nothing crashes on unusual/edited save data.
const RARITY_RANK = {
  Unique: 0,
  Set: 1,
  Rare: 2,
  Crafted: 3,
  Magic: 4,
  Superior: 5,
  Normal: 6,
  Inferior: 7,
};

function run(savesDir, { dryRun = false } = {}) {
  if (!fs.existsSync(savesDir)) throw new Error(`Saves directory not found at ${savesDir}`);

  const files = fs.readdirSync(savesDir).filter(f => f.toLowerCase().endsWith('.d2s'));
  if (files.length === 0) {
    throw new Error(`No Diablo II save files (.d2s) found in "${savesDir}".`);
  }
  const buffers = {};
  files.forEach(f => { buffers[f] = fs.readFileSync(path.join(savesDir, f)); });

  // ---- 1. Find every LOOSE jewel in every file (skip anything socketed into gear) ----
  const jewelLocations = {};
  const rarityCounts = {};
  let socketedSkipped = 0;
  files.forEach(f => {
    const buf = buffers[f];
    const list = findItemList(buf);
    if (!list) return;
    const jewels = [];
    list.ranges.forEach(([s, e]) => {
      const code = getItemCode(buf, s);
      if (code !== JEWEL_CODE) return;
      const loc = getLocation(buf, s);
      if (loc.location === 6) { socketedSkipped++; return; } // socketed into gear — leave it alone
      const qualityId = getQuality(buf, s);
      const qualityName = QUALITIES[qualityId] || `Quality ${qualityId}`;
      jewels.push({ start: s, end: e, bytes: buf.subarray(s, e), qualityName });
      rarityCounts[qualityName] = (rarityCounts[qualityName] || 0) + 1;
    });
    if (jewels.length) jewelLocations[f] = jewels;
  });

  const totalBefore = Object.values(rarityCounts).reduce((a, b) => a + b, 0);
  if (totalBefore === 0) throw new Error('No loose jewels found in any save file — nothing to sort.');

  console.log('=== Current loose jewel tally across all saves (by rarity) ===');
  console.log(rarityCounts);
  console.log('Total loose jewels:', totalBefore, '| socketed jewels left untouched:', socketedSkipped);

  // ---- 2. Sort rarest first (no merging — jewels don't combine) ----
  const allJewels = Object.values(jewelLocations).flat();
  allJewels.sort((a, b) => (RARITY_RANK[a.qualityName] ?? 99) - (RARITY_RANK[b.qualityName] ?? 99));

  // ---- 3. Figure out each destination's current occupancy (after its own jewels are removed) ----
  const destInfo = {};
  DESTINATIONS.forEach(f => {
    const buf = buffers[f];
    if (!buf) throw new Error(`Destination file ${f} not found in ${savesDir}`);
    const list = findItemList(buf);
    const jewelStarts = new Set((jewelLocations[f] || []).map(j => j.start));
    const occupied = { 1: new Set(), 4: new Set(), 5: new Set() };
    list.ranges.forEach(([s]) => {
      if (jewelStarts.has(s)) return; // being removed, doesn't count as occupying a slot afterward
      const loc = getLocation(buf, s);
      if (loc.location === 0 && occupied[loc.container]) occupied[loc.container].add(`${loc.x},${loc.y}`);
    });
    let free = 0;
    CONTAINERS.forEach(c => { free += (c.w * c.h) - occupied[c.id].size; });
    destInfo[f] = { occupied, free };
  });

  const totalFree = DESTINATIONS.reduce((sum, f) => sum + destInfo[f].free, 0);
  console.log('\n=== Destination free capacity (after removing their own jewels) ===');
  DESTINATIONS.forEach(f => console.log(' ', f, '-> free:', destInfo[f].free));
  console.log('Total free capacity:', totalFree, '| jewels to place:', allJewels.length);
  if (allJewels.length > totalFree) {
    throw new Error(
      `Not enough room: ${allJewels.length} jewels but only ${totalFree} free slots across ` +
      DESTINATIONS.join(', ') + '. Free up space (or add another destination) and re-run.'
    );
  }

  // ---- 4. Allocate jewels into destinations in priority order, rarest first ----
  const plan = {}; // file -> [{jewel, containerId, x, y}]
  DESTINATIONS.forEach(f => (plan[f] = []));
  let cursor = 0;
  for (const f of DESTINATIONS) {
    if (cursor >= allJewels.length) break;
    const info = destInfo[f];
    for (const c of CONTAINERS) {
      if (cursor >= allJewels.length) break;
      for (let y = 0; y < c.h && cursor < allJewels.length; y++) {
        for (let x = 0; x < c.w && cursor < allJewels.length; x++) {
          const key = `${x},${y}`;
          if (info.occupied[c.id].has(key)) continue;
          const jewel = allJewels[cursor];
          plan[f].push({ jewel, containerId: c.id, x, y });
          info.occupied[c.id].add(key);
          cursor++;
        }
      }
    }
  }

  console.log('\n=== Placement plan (rarest first) ===');
  DESTINATIONS.forEach(f => {
    const counts = {};
    plan[f].forEach(p => { counts[p.jewel.qualityName] = (counts[p.jewel.qualityName] || 0) + 1; });
    console.log(' ', f, '->', plan[f].length, 'jewels:', counts);
  });

  if (dryRun) {
    console.log('\nDRY RUN — no files modified.');
    return { plan };
  }

  // ---- 5. Backup ----
  const backupDir = backupSavesDir(savesDir, files);
  console.log('\nBacked up all', files.length, 'save files to', backupDir);

  // ---- 6. Write: remove loose jewels from every file, insert the plan into destinations ----
  files.forEach(f => {
    const jewels = jewelLocations[f];
    const insertions = plan[f] || [];
    if (!jewels && !insertions.length) return;

    const buf = buffers[f];
    const list = findItemList(buf);
    const removeSet = new Set((jewels || []).map(j => j.start));
    const keptChunks = [];
    list.ranges.forEach(([s, e]) => { if (!removeSet.has(s)) keptChunks.push(buf.subarray(s, e)); });

    const newItems = insertions.map(p => repositionItem(p.jewel.bytes, p.containerId, p.x, p.y));
    const newItemSection = Buffer.concat([...keptChunks, ...newItems]);

    const newBuf = Buffer.concat([
      buf.subarray(0, list.jmPos + 4),
      newItemSection,
      buf.subarray(list.listEnd),
    ]);

    const newItemCount = list.itemCount - (jewels ? jewels.length : 0) + insertions.length;
    newBuf.writeUInt16LE(newItemCount, list.jmPos + 2);
    finalize(newBuf);
    fs.writeFileSync(path.join(savesDir, f), newBuf);
    console.log(
      `${f}: removed ${jewels ? jewels.length : 0} jewel(s), inserted ${insertions.length} jewel(s)`,
      `(item count ${list.itemCount} -> ${newItemCount}, size ${buf.length} -> ${newBuf.length})`
    );
  });

  console.log('\nDone.');
  return { plan, backupDir };
}

module.exports = { run };

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const pathArg = args.find(a => !a.startsWith('--'));
  if (!pathArg) {
    console.error('Usage: node src/sort-jewels.js <path-to-saves-folder> [--dry-run]');
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
