/**
 * Diablo II (.d2s) Save File Reader / Parser
 * Merges every gem across all save files (Horadric Cube 3-for-1 upgrade,
 * cascaded to the highest possible tier) and redistributes the result into
 * mule characters, in priority order: Mule-stones -> mule-stoness ->
 * mule-stonesss. Each mule is filled to capacity (Inventory + Stash + Cube)
 * before overflow moves to the next one in the list.
 *
 * Always backs up saves/ before writing anything.
 *
 * Usage:
 *   node src/merge-gems.js            (writes changes)
 *   node src/merge-gems.js --dry-run  (prints the plan, touches nothing)
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SAVES_DIR = path.join(PROJECT_ROOT, 'saves');
const { ITEM_DATABASE } = require('./constants');
const { getBits } = require('./bitReader');

const DRY_RUN = process.argv.includes('--dry-run');

// Destination mules, in fill priority order (first is filled to capacity before
// overflow moves to the next). Matched against saves/ case-sensitively, since
// that's how these files are actually named on disk.
const DESTINATIONS = ['Mule-stones.d2s', 'mule-stoness.d2s', 'mule-stonesss.d2s'];

// Container layout, discovered empirically from real save data (see below):
// id 1 = Inventory (10 wide x 4 tall), id 4 = Cube (3x4), id 5 = Stash (6x8).
const CONTAINERS = [
  { id: 1, name: 'Inventory', w: 10, h: 4 },
  { id: 5, name: 'Stash', w: 6, h: 8 },
  { id: 4, name: 'Cube', w: 3, h: 4 },
];

// ---- bit helpers ----
function setBits(buffer, bitOffset, numBits, value) {
  for (let i = 0; i < numBits; i++) {
    const byteIdx = Math.floor((bitOffset + i) / 8);
    const bitIdx = (bitOffset + i) % 8;
    const bit = (value >> i) & 1;
    if (bit) buffer[byteIdx] |= (1 << bitIdx);
    else buffer[byteIdx] &= (~(1 << bitIdx)) & 0xFF;
  }
}

function calcChecksum(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    let ch = buf[i];
    if (i >= 12 && i < 16) ch = 0;
    ch += (sum < 0) ? 1 : 0;
    sum = (sum << 1) + ch;
  }
  return sum >>> 0;
}

function finalize(buf) {
  buf.writeUInt32LE(buf.length, 8);
  buf.writeUInt32LE(0, 12);
  buf.writeUInt32LE(calcChecksum(buf), 12);
}

function findItemList(buf) {
  const jmPos = buf.indexOf(Buffer.from([0x4A, 0x4D]), 700);
  if (jmPos === -1) return null;
  const itemCount = buf.readUInt16LE(jmPos + 2);
  let currOffset = jmPos + 4;
  const ranges = [];
  for (let i = 0; i < itemCount; i++) {
    if (buf[currOffset] !== 0x4A || buf[currOffset + 1] !== 0x4D) break;
    const nextJm = buf.indexOf(Buffer.from([0x4A, 0x4D]), currOffset + 2);
    const end = nextJm === -1 ? buf.length : nextJm;
    ranges.push([currOffset, end]);
    if (nextJm === -1) { currOffset = buf.length; break; }
    currOffset = nextJm;
  }
  return { jmPos, itemCount, ranges, listEnd: currOffset };
}

function getItemCode(buf, start) {
  const startBit = (start + 2) * 8;
  let code = '';
  for (let c = 0; c < 4; c++) {
    const cc = getBits(buf, startBit + 60 + (c * 8), 8);
    if (cc >= 32 && cc <= 126) code += String.fromCharCode(cc);
  }
  return code.trim();
}

function isSimpleItem(buf, start) {
  return getBits(buf, (start + 2) * 8 + 21, 1) === 1;
}

function getLocation(buf, start) {
  const b = (start + 2) * 8;
  const location = getBits(buf, b + 42, 3);
  return {
    location,
    container: location === 0 ? getBits(buf, b + 57, 3) : null,
    x: location === 0 ? getBits(buf, b + 49, 4) : null,
    y: location === 0 ? getBits(buf, b + 53, 3) : null,
  };
}

function writeItemCode(buf, start, newCode) {
  const startBit = (start + 2) * 8;
  const padded = (newCode + '   ').slice(0, 4);
  for (let c = 0; c < 4; c++) {
    setBits(buf, startBit + 60 + (c * 8), 8, padded.charCodeAt(c));
  }
}

// Clone a real, valid simple-gem item and only touch the fields that need to
// change (location/container/position/code); every other bit (identified,
// ethereal, socketed, etc.) stays exactly as it was on the real donor item.
function buildGemItem(template, code, containerId, x, y) {
  const buf = Buffer.from(template);
  const startBit = 2 * 8;
  setBits(buf, startBit + 42, 3, 0); // location = stored
  setBits(buf, startBit + 49, 4, x);
  setBits(buf, startBit + 53, 3, y);
  setBits(buf, startBit + 57, 3, containerId);
  writeItemCode(buf, 0, code);
  return buf;
}

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

function run() {
  const files = fs.readdirSync(SAVES_DIR).filter(f => f.toLowerCase().endsWith('.d2s'));
  const buffers = {};
  files.forEach(f => { buffers[f] = fs.readFileSync(path.join(SAVES_DIR, f)); });

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

  const finalList = [];
  Object.entries(merged).forEach(([name, count]) => {
    for (let i = 0; i < count; i++) finalList.push(GEM_NAME_TO_CODE[name]);
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

  if (DRY_RUN) {
    console.log('\nDRY RUN — no files modified.');
    return;
  }

  // ---- 5. Backup ----
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(PROJECT_ROOT, `saves-backup-${stamp}`);
  fs.mkdirSync(backupDir, { recursive: true });
  files.forEach(f => fs.copyFileSync(path.join(SAVES_DIR, f), path.join(backupDir, f)));
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

    const newItems = insertions.map(p => buildGemItem(donorTemplate, p.code, p.containerId, p.x, p.y));
    const newItemSection = Buffer.concat([...keptChunks, ...newItems]);

    const newBuf = Buffer.concat([
      buf.subarray(0, list.jmPos + 4),
      newItemSection,
      buf.subarray(list.listEnd),
    ]);

    const newItemCount = list.itemCount - (gems ? gems.length : 0) + insertions.length;
    newBuf.writeUInt16LE(newItemCount, list.jmPos + 2);
    finalize(newBuf);
    fs.writeFileSync(path.join(SAVES_DIR, f), newBuf);
    console.log(
      `${f}: removed ${gems ? gems.length : 0} gem(s), inserted ${insertions.length} gem(s)`,
      `(item count ${list.itemCount} -> ${newItemCount}, size ${buf.length} -> ${newBuf.length})`
    );
  });

  console.log('\nDone.');
}

run();
