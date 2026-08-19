/**
 * Diablo II (.d2s) Save File Reader / Parser
 * Merges every gem across all save files (Horadric Cube 3-for-1 upgrade,
 * cascaded to the highest possible tier) and redistributes the result into
 * mule characters, in priority order: Mule-stones -> mule-stoness ->
 * mule-stonesss. Each mule is filled to capacity (Inventory + Stash + Cube)
 * before overflow moves to the next one in the list.
 *
 * Always backs up the target saves folder before writing anything.
 *
 * Usage:
 *   node src/merge-gems.js [path-to-saves-folder]            (writes changes)
 *   node src/merge-gems.js [path-to-saves-folder] --dry-run  (prints the plan, touches nothing)
 *   (path defaults to this project's own saves/ folder when omitted)
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
const DESTINATIONS = ['Mule-stones.d2s', 'mule-stoness.d2s', 'mule-stonesss.d2s'];

// ---- gem tier tables ----
const GEM_NAME_TO_CODE = {};
const GEM_CODE_TO_NAME = {};
Object.entries(ITEM_DATABASE).forEach(([code, e]) => {
  if (e.type === 'Gem') { GEM_NAME_TO_CODE[e.name] = code; GEM_CODE_TO_NAME[code] = e.name; }
});

const FAMILIES = ['Amethyst', 'Topaz', 'Sapphire', 'Emerald', 'Ruby', 'Diamond', 'Skull'];
function tierName(fam, tier) {
  if (fam === 'Skull') return ['Chipped Skull', 'Flawed Skull', 'Skull', 'Flawless Skull', 'Perfect Skull'][tier];
  return ['Chipped ', 'Flawed ', '', 'Flawless ', 'Perfect '][tier] + fam;
}

function run(savesDir, { dryRun = false } = {}) {
  if (!fs.existsSync(savesDir)) throw new Error(`Saves directory not found at ${savesDir}`);

  const files = fs.readdirSync(savesDir).filter(f => f.toLowerCase().endsWith('.d2s'));
  if (files.length === 0) {
    throw new Error(`No Diablo II save files (.d2s) found in "${savesDir}".`);
  }
  const buffers = {};
  files.forEach(f => { buffers[f] = fs.readFileSync(path.join(savesDir, f)); });

  // ---- 1. Find every gem in every file, and grab a donor template ----
  const gemLocations = {};
  const gemCounts = {};
  let donorTemplate = null;
  files.forEach(f => {
    const buf = buffers[f];
    const list = findItemList(buf);
    if (!list) return;
    const gems = [];
    list.ranges.forEach(([s, e]) => {
      const code = getItemCode(buf, s);
      const name = GEM_CODE_TO_NAME[code];
      if (name) {
        if (!isSimpleItem(buf, s) || (e - s) !== 14) {
          throw new Error(`Unexpected gem item shape in ${f} at byte ${s}: simple=${isSimpleItem(buf, s)} len=${e - s}`);
        }
        const loc = getLocation(buf, s);
        if (loc.location === 6) {
          throw new Error(`Gem ${name} in ${f} is socketed into another item — this script doesn't support merging socketed gems.`);
        }
        gems.push({ start: s, end: e, code, name });
        gemCounts[name] = (gemCounts[name] || 0) + 1;
        if (!donorTemplate) donorTemplate = buf.subarray(s, e);
      }
    });
    if (gems.length) gemLocations[f] = gems;
  });

  if (!donorTemplate) throw new Error('No gems found in any save file — nothing to merge.');

  console.log('=== Current gem tally across all saves ===');
  console.log(gemCounts);
  const totalBefore = Object.values(gemCounts).reduce((a, b) => a + b, 0);
  console.log('Total gems:', totalBefore);

  // ---- 2. Cascade merge simulation ----
  let totalMerges = 0;
  const merged = {};
  FAMILIES.forEach(fam => {
    let carry = 0;
    for (let tier = 0; tier <= 4; tier++) {
      const name = tierName(fam, tier);
      const have = (gemCounts[name] || 0) + carry;
      if (tier < 4) {
        const promote = Math.floor(have / 3);
        merged[name] = have % 3;
        totalMerges += promote;
        carry = promote;
      } else {
        merged[name] = have;
      }
    }
  });
  console.log('\n=== After merge cascade ===');
  console.log('Total merge operations:', totalMerges);
  console.log(merged);

  // Best quality first (Perfect -> Chipped) within each family, so the
  // highest-tier gems are the ones placed first / prioritized into the
  // first destination mule.
  const finalList = [];
  FAMILIES.forEach(fam => {
    for (let tier = 4; tier >= 0; tier--) {
      const name = tierName(fam, tier);
      const count = merged[name] || 0;
      for (let i = 0; i < count; i++) finalList.push(GEM_NAME_TO_CODE[name]);
    }
  });
  console.log('Total gems after merge:', finalList.length);

  // ---- 3. Figure out each destination's current occupancy (after gems are removed) ----
  const destInfo = {};
  DESTINATIONS.forEach(f => {
    const buf = buffers[f];
    if (!buf) throw new Error(`Destination file ${f} not found in saves/`);
    const list = findItemList(buf);
    const gemStarts = new Set((gemLocations[f] || []).map(g => g.start));
    const occupied = { 1: new Set(), 4: new Set(), 5: new Set() };
    list.ranges.forEach(([s]) => {
      if (gemStarts.has(s)) return; // being removed, doesn't count as occupying a slot afterward
      const loc = getLocation(buf, s);
      if (loc.location === 0 && occupied[loc.container]) occupied[loc.container].add(`${loc.x},${loc.y}`);
    });
    let free = 0;
    CONTAINERS.forEach(c => { free += (c.w * c.h) - occupied[c.id].size; });
    destInfo[f] = { occupied, free };
  });

  const totalFree = DESTINATIONS.reduce((sum, f) => sum + destInfo[f].free, 0);
  console.log('\n=== Destination free capacity (after removing their own gems) ===');
  DESTINATIONS.forEach(f => console.log(' ', f, '-> free:', destInfo[f].free));
  console.log('Total free capacity:', totalFree, '| gems to place:', finalList.length);
  if (finalList.length > totalFree) {
    throw new Error(
      `Not enough room: ${finalList.length} merged gems but only ${totalFree} free slots across ` +
      DESTINATIONS.join(', ') + '. Free up space (or add another destination) and re-run.'
    );
  }

  // ---- 4. Allocate gems into destinations in priority order ----
  const plan = {}; // file -> [{code,name,containerId,x,y}]
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
          plan[f].push({ code, name: GEM_CODE_TO_NAME[code], containerId: c.id, x, y });
          info.occupied[c.id].add(key);
          cursor++;
        }
      }
    }
  }

  console.log('\n=== Placement plan ===');
  DESTINATIONS.forEach(f => {
    const counts = {};
    plan[f].forEach(p => { counts[p.name] = (counts[p.name] || 0) + 1; });
    console.log(' ', f, '->', plan[f].length, 'gems:', counts);
  });

  if (dryRun) {
    console.log('\nDRY RUN — no files modified.');
    return { finalList, plan };
  }

  // ---- 5. Backup ----
  const backupDir = backupSavesDir(savesDir, files);
  console.log('\nBacked up all', files.length, 'save files to', backupDir);

  // ---- 6. Write: remove gems from every file, insert the plan into destinations ----
  files.forEach(f => {
    const gems = gemLocations[f];
    const insertions = plan[f] || [];
    if (!gems && !insertions.length) return;

    const buf = buffers[f];
    const list = findItemList(buf);
    const removeSet = new Set((gems || []).map(g => g.start));
    const keptChunks = [];
    list.ranges.forEach(([s, e]) => { if (!removeSet.has(s)) keptChunks.push(buf.subarray(s, e)); });

    const newItems = insertions.map(p => buildSimpleItem(donorTemplate, p.code, p.containerId, p.x, p.y));
    const newItemSection = Buffer.concat([...keptChunks, ...newItems]);

    const newBuf = Buffer.concat([
      buf.subarray(0, list.jmPos + 4),
      newItemSection,
      buf.subarray(list.listEnd),
    ]);

    const newItemCount = list.itemCount - (gems ? gems.length : 0) + insertions.length;
    newBuf.writeUInt16LE(newItemCount, list.jmPos + 2);
    finalize(newBuf);
    fs.writeFileSync(path.join(savesDir, f), newBuf);
    console.log(
      `${f}: removed ${gems ? gems.length : 0} gem(s), inserted ${insertions.length} gem(s)`,
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
    console.error('Usage: node src/merge-gems.js <path-to-saves-folder> [--dry-run]');
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
