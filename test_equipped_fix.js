const fs = require('fs');
const path = require('path');

const buf = fs.readFileSync(path.join(__dirname, 'saves', 'Amazonka.d2s'));

function getBits(buffer, bitOffset, numBits) {
  let val = 0;
  for (let i = 0; i < numBits; i++) {
    const byteIdx = Math.floor((bitOffset + i) / 8);
    const bitIdx = (bitOffset + i) % 8;
    const bit = (buffer[byteIdx] >> bitIdx) & 1;
    val |= (bit << i);
  }
  return val;
}

const EQUIPPED_SLOTS = {
  1: 'Helm', 2: 'Amulet', 3: 'Armor',
  4: 'Right Hand Weapon', 5: 'Shield / Offhand',
  6: 'Right Ring', 7: 'Left Ring',
  8: 'Belt', 9: 'Boots', 10: 'Gloves',
  11: 'Swap Weapon Right', 12: 'Swap Weapon Left'
};

const ITEM_NAMES = {
  'fhl': 'Full Helm',
  'mbl': 'Mesh Boots',
  'vgl': 'Venom Grip / Heavy Gloves',
  'rin': 'Ring',
  'amu': 'Amulet',
  'xrs': 'Guilded Shield / Dragon Shield',
  '8s8': 'Gothic Bow (Exceptional)',
  'hbw': 'Hunter\'s Bow',
  'aqv': 'Quiver of Arrows'
};

const jmPos = 853;
const itemCount = buf.readUInt16LE(jmPos + 2);

let currOffset = jmPos + 4;
let equipped = [];

for (let i = 0; i < itemCount; i++) {
  if (buf[currOffset] !== 0x4A || buf[currOffset + 1] !== 0x4D) break;

  const nextJm = buf.indexOf(Buffer.from([0x4A, 0x4D]), currOffset + 2);
  const startBit = (currOffset + 2) * 8;

  // Read item code at bit 60
  let code = '';
  for (let c = 0; c < 4; c++) {
    const charCode = getBits(buf, startBit + 60 + (c * 8), 8);
    if (charCode >= 32 && charCode <= 126) code += String.fromCharCode(charCode);
  }
  code = code.trim();

  // Location is at bit 40 (3 bits)
  const location = getBits(buf, startBit + 40, 3);
  if (location === 1) { // Equipped
    const slotId = getBits(buf, startBit + 43, 4);
    const slotName = EQUIPPED_SLOTS[slotId] || `Slot ${slotId}`;
    const itemName = ITEM_NAMES[code] || code;
    equipped.push({ index: i + 1, slotId, slotName, code, itemName });
  }

  if (nextJm !== -1) currOffset = nextJm;
  else break;
}

console.log(`Found ${equipped.length} Equipped Items:\n`);
equipped.forEach(eq => {
  console.log(`- Item #${eq.index}: Slot '${eq.slotName.padEnd(20)}' -> ${eq.itemName} [${eq.code}]`);
});
