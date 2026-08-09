/**
 * Parser for Equipment, Inventory, Stash, and Cube Items ('JM' sections)
 */

const { EQUIPPED_SLOTS, STORED_LOCATIONS, QUALITIES, ITEM_DATABASE } = require('./constants');
const { getBits } = require('./bitReader');

function parseItems(buf) {
  // Item list header ("JM" + 16-bit item count) is not at a fixed offset — its
  // position shifts with the size of the preceding quest/waypoint/attribute data.
  const jmPos = buf.indexOf(Buffer.from([0x4A, 0x4D]), 700);
  if (jmPos === -1) {
    return { totalItems: 0, items: [], equippedItems: [], storedItems: [], groupedSummary: {}, groupedByCategory: {} };
  }
  const itemCount = buf.readUInt16LE(jmPos + 2);

  let currOffset = jmPos + 4;
  let items = [];

  for (let i = 0; i < itemCount; i++) {
    if (buf[currOffset] !== 0x4A || buf[currOffset + 1] !== 0x4D) break;

    const nextJm = buf.indexOf(Buffer.from([0x4A, 0x4D]), currOffset + 2);
    const startBit = (currOffset + 2) * 8;

    const location = getBits(buf, startBit + 42, 3);
    const isSimple = getBits(buf, startBit + 21, 1);

    let isEquipped = false;
    let locStr = '';
    let slotName = '';

    if (location === 1) {
      isEquipped = true;
      const slotId = getBits(buf, startBit + 45, 4);
      slotName = EQUIPPED_SLOTS[slotId] || `Slot ${slotId}`;
      locStr = `Equipped (${slotName})`;
    } else if (location === 0) {
      const containerId = getBits(buf, startBit + 57, 3);
      locStr = `${STORED_LOCATIONS[containerId] || 'Stored'}`;
    } else if (location === 2) {
      locStr = 'Belt';
    } else if (location === 6) {
      locStr = 'Socketed';
    }

    let code = '';
    for (let c = 0; c < 4; c++) {
      const charCode = getBits(buf, startBit + 60 + (c * 8), 8);
      if (charCode >= 32 && charCode <= 126) code += String.fromCharCode(charCode);
    }
    code = code.trim();

    let qualityName = 'Normal';
    if (!isSimple) {
      // Extended data after the code: 32-bit GUID (+95..126), 7-bit item level (+127..133), then quality
      const quality = getBits(buf, startBit + 134, 4);
      qualityName = QUALITIES[quality] || `Quality ${quality}`;
    }

    if (code) {
      const dbEntry = ITEM_DATABASE[code.toLowerCase()] || { name: `Unknown (${code})`, type: 'Item' };

      items.push({
        rawCode: code,
        name: dbEntry.name,
        type: dbEntry.type,
        level: dbEntry.level,
        quality: qualityName,
        location: locStr,
        isEquipped,
        slotName
      });
    }

    if (nextJm !== -1) currOffset = nextJm;
    else break;
  }

  // Items with location "Socketed" live inside the item that immediately precedes
  // them in file order (a socketed item's contents are written right after it).
  // Attach them to their host instead of treating them as items in their own right.
  let hostItem = null;
  items.forEach(it => {
    if (it.location === 'Socketed') {
      it.isSocketedContent = true;
      if (hostItem) {
        hostItem.socketedItems = hostItem.socketedItems || [];
        hostItem.socketedItems.push({ name: it.name, level: it.level, rawCode: it.rawCode });
      }
    } else {
      hostItem = it;
    }
  });

  const topLevelItems = items.filter(it => !it.isSocketedContent);

  // Group equipped items
  const equippedItems = topLevelItems.filter(it => it.isEquipped);

  // Group stored items by type
  const storedItems = topLevelItems.filter(it => !it.isEquipped);

  const groupedSummary = {};
  topLevelItems.forEach(it => {
    const key = `${it.name} [${it.type}]`;
    groupedSummary[key] = (groupedSummary[key] || 0) + 1;
  });

  // Grouped by category (item type), then by name within each category.
  // Items with something socketed into them are unique instances, so they're kept
  // out of the aggregate count and reported separately in socketedInstances.
  const groupedByCategory = {};
  const socketedInstances = [];
  topLevelItems.forEach(it => {
    if (it.socketedItems && it.socketedItems.length) {
      socketedInstances.push({ category: it.type, name: it.name, level: it.level, socketedItems: it.socketedItems });
      return;
    }
    if (!groupedByCategory[it.type]) groupedByCategory[it.type] = {};
    if (!groupedByCategory[it.type][it.name]) {
      groupedByCategory[it.type][it.name] = { count: 0, level: it.level };
    }
    groupedByCategory[it.type][it.name].count += 1;
  });

  return {
    totalItems: items.length,
    items,
    equippedItems,
    storedItems,
    groupedSummary,
    groupedByCategory,
    socketedInstances
  };
}

module.exports = {
  parseItems
};
