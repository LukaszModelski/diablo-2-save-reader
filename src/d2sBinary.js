/**
 * Shared low-level .d2s binary helpers, used by any feature that needs to
 * read AND rewrite item data (merge-gems, sort-runes, ...).
 *
 * Item grid position encoding (X: bit offset +49, width 4; Y: bit offset +53,
 * width 3 — relative to right after each item's "JM" tag) and the checksum
 * algorithm were both empirically reverse-engineered and cross-validated
 * against every save file in this project (zero out-of-bounds / duplicate
 * positions, 100% checksum match) before being trusted here.
 */

const fs = require('fs');
const path = require('path');
const { getBits } = require('./bitReader');

// Container layout, discovered empirically from real save data:
// id 1 = Inventory (10 wide x 4 tall), id 4 = Cube (3x4), id 5 = Stash (6x8).
const CONTAINERS = [
  { id: 1, name: 'Inventory', w: 10, h: 4 },
  { id: 5, name: 'Stash', w: 6, h: 8 },
  { id: 4, name: 'Cube', w: 3, h: 4 },
];

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

// Quality/rarity (Normal, Magic, Rare, Unique, Crafted, ...) only exists as
// explicit bits on non-simple items (magic/rare/unique/crafted gear carries
// affix data); simple items (plain gems, runes, unenchanted jewels, ...) have
// no such bits and are always plain "Normal" quality.
function getQuality(buf, start) {
  if (isSimpleItem(buf, start)) return 2; // Normal
  const b = (start + 2) * 8;
  return getBits(buf, b + 134, 4);
}

// Resolves a Unique-quality item's specific name (e.g. "Duskdeep") by reading
// the unique-ID field and cross-checking it against UNIQUE_ITEMS. Empirically
// verified against real save data — only reliable for Normal/Exceptional tier
// armor, weapons, and shields; Elite-tier items (armor codes starting with
// "x", weapon codes starting with "8"/"9") and jewelry (rings/amulets) use a
// different, not-yet-decoded layout, so the base-code check below makes those
// safely return null instead of a wrong name.
function getUniqueName(buf, start, code, uniqueItems) {
  if (getQuality(buf, start) !== 7) return null; // 7 = Unique
  const b = (start + 2) * 8;
  const id = getBits(buf, b + 140, 9);
  const row = uniqueItems[id];
  return row && row.code === code ? row.name : null;
}

function writeItemCode(buf, start, newCode) {
  const startBit = (start + 2) * 8;
  const padded = (newCode + '   ').slice(0, 4);
  for (let c = 0; c < 4; c++) {
    setBits(buf, startBit + 60 + (c * 8), 8, padded.charCodeAt(c));
  }
}

// Clone a real, valid simple item and only touch the fields that need to
// change (location/container/position/code); every other bit (identified,
// ethereal, socketed, etc.) stays exactly as it was on the real donor item.
function buildSimpleItem(template, code, containerId, x, y) {
  const buf = Buffer.from(template);
  const startBit = 2 * 8;
  setBits(buf, startBit + 42, 3, 0); // location = stored
  setBits(buf, startBit + 49, 4, x);
  setBits(buf, startBit + 53, 3, y);
  setBits(buf, startBit + 57, 3, containerId);
  writeItemCode(buf, 0, code);
  return buf;
}

// Move a real item's exact bytes to a new stored location, whatever its
// length or complexity — unlike buildSimpleItem, this doesn't require the
// item to be a fixed-shape simple item. Only the common item-header bits
// (shared by every item type, before any quality-specific affix data begins)
// are touched; everything else — including magic/rare/unique affixes — is
// preserved byte-for-byte.
function repositionItem(itemBytes, containerId, x, y) {
  const buf = Buffer.from(itemBytes);
  const startBit = 2 * 8;
  setBits(buf, startBit + 42, 3, 0); // location = stored
  setBits(buf, startBit + 49, 4, x);
  setBits(buf, startBit + 53, 3, y);
  setBits(buf, startBit + 57, 3, containerId);
  return buf;
}

function backupSavesDir(savesDir, files) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(path.dirname(savesDir), `saves-backup-${stamp}`);
  fs.mkdirSync(backupDir, { recursive: true });
  files.forEach(f => fs.copyFileSync(path.join(savesDir, f), path.join(backupDir, f)));
  return backupDir;
}

module.exports = {
  CONTAINERS,
  setBits,
  calcChecksum,
  finalize,
  findItemList,
  getItemCode,
  isSimpleItem,
  getLocation,
  getQuality,
  getUniqueName,
  writeItemCode,
  buildSimpleItem,
  repositionItem,
  backupSavesDir,
};
