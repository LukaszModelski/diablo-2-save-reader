/**
 * Diablo II (.d2s) Save File Reader / Parser
 * Entry point importing modular parsers from ./src/
 *
 * Usage:
 *   node index.js
 *   node index.js saves/Amazonka.d2s
 */

const fs = require('fs');
const path = require('path');

const { parseHeader } = require('./src/headerParser');
const { parseStats } = require('./src/statsParser');
const { parseSkills } = require('./src/skillParser');
const { parseQuests } = require('./src/questParser');
const { parseWaypoints } = require('./src/waypointParser');
const { parseItems } = require('./src/itemParser');

function parseSaveFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`\x1b[31mError: Save file not found at ${filePath}\x1b[0m`);
    process.exit(1);
  }

  const buf = fs.readFileSync(filePath);
  console.log(`\n\x1b[36m==================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[33m  DIABLO II SAVE FILE PARSER (v1.09d)\x1b[0m`);
  console.log(`\x1b[36m==================================================\x1b[0m`);
  console.log(`Reading File: \x1b[32m${path.basename(filePath)}\x1b[0m (${buf.length} bytes)\n`);

  // 1. Header
  const header = parseHeader(buf);
  console.log(`\x1b[1m--- Character Summary ---\x1b[0m`);
  console.log(`Name            : \x1b[1m\x1b[32m${header.name}\x1b[0m`);
  console.log(`Class           : \x1b[33m${header.className}\x1b[0m`);
  console.log(`Level           : \x1b[1m${header.level}\x1b[0m`);
  console.log(`Title           : \x1b[35m${header.title}\x1b[0m`);
  console.log(`Expansion (LoD) : ${header.isExpansion ? 'Yes' : 'No'}`);
  console.log(`Mode            : ${header.isHardcore ? '\x1b[31mHardcore\x1b[0m' : 'Softcore'}`);
  console.log(`Has Died        : ${header.hasDied ? 'Yes' : 'No'}`);
  console.log(`Version ID      : ${header.version} (0x${header.version.toString(16)})`);
  console.log(`Last Played     : ${header.lastPlayedDate}\n`);

  // 2. Stats
  const stats = parseStats(buf);
  console.log(`\x1b[1m--- Base & Total Attributes ---\x1b[0m`);
  console.log(`Strength        : ${stats.strength}`);
  console.log(`Dexterity       : ${stats.dexterity}`);
  console.log(`Energy          : ${stats.energy}`);
  console.log(`Hit Points      : \x1b[32m${stats.hpCurrent}\x1b[0m / \x1b[32m${stats.hpMax}\x1b[0m HP`);
  console.log(`Mana            : \x1b[34m${stats.manaCurrent}\x1b[0m / \x1b[34m${stats.manaMax}\x1b[0m MP`);
  console.log(`Stamina         : ${stats.staminaCurrent} / ${stats.staminaMax}`);
  console.log(`Experience      : ${stats.exp.toLocaleString()} XP`);
  console.log(`Gold            : ${stats.goldInventory.toLocaleString()} (Inventory) + ${stats.goldStash.toLocaleString()} (Stash) = \x1b[33m${stats.goldTotal.toLocaleString()} Total\x1b[0m`);
  console.log(`\x1b[1m\x1b[33mUnassigned Stats: ${stats.freeStatPts} Stat Points | ${stats.freeSkillPts} Skill Points\x1b[0m\n`);

  // 3. Skills
  const skills = parseSkills(buf, header.classId);
  console.log(`\x1b[1m--- Skill Allocation ---\x1b[0m`);
  skills.allocatedSkills.forEach(sk => {
    console.log(`  - \x1b[36m${sk.name.padEnd(20)}\x1b[0m (${sk.tree}): \x1b[1mLevel ${sk.level}\x1b[0m`);
  });
  console.log(`Total Invested Skill Points: \x1b[1m${skills.pointsSpent}\x1b[0m\n`);

  // 4. Quests
  const quests = parseQuests(buf);
  console.log(`\x1b[1m--- Difficulty & Quest Progress ---\x1b[0m`);
  Object.entries(quests).forEach(([diff, q]) => {
    console.log(`  - \x1b[1m${diff.padEnd(10)}\x1b[0m: ${q.completed} / ${q.total} Quests Completed`);
  });
  console.log();

  // 5. Waypoints
  const waypoints = parseWaypoints(buf);
  console.log(`\x1b[1m--- Waypoints Unlocked ---\x1b[0m`);
  Object.entries(waypoints).forEach(([diff, wp]) => {
    console.log(`  - \x1b[1m${diff.padEnd(10)}\x1b[0m: ${wp.unlocked} / ${wp.total} Waypoints Unlocked`);
  });
  console.log();

  // 6. Items Detailed Breakdown
  const itemData = parseItems(buf);
  console.log(`\x1b[1m--- Inventory & Equipped Items ---\x1b[0m`);
  console.log(`Total Item Count: \x1b[1m${itemData.totalItems}\x1b[0m\n`);

  console.log(`\x1b[1m\x1b[33m🛡️ Equipped Gear:\x1b[0m`);
  if (itemData.equippedItems.length > 0) {
    itemData.equippedItems.forEach(it => {
      console.log(`  - \x1b[36m${it.slotName.padEnd(20)}\x1b[0m: \x1b[1m${it.name}\x1b[0m (${it.quality} ${it.type})`);
    });
  } else {
    console.log(`  (No gear equipped in active slots)`);
  }
  console.log();

  console.log(`\x1b[1m\x1b[33m🎒 Item Inventory Overview:\x1b[0m`);
  const categories = Object.keys(itemData.groupedByCategory).sort();
  categories.forEach(category => {
    console.log(`  \x1b[1m${category}\x1b[0m`);
    const entries = Object.entries(itemData.groupedByCategory[category]).sort(([nameA, a], [nameB, b]) => {
      if (a.level != null && b.level != null) return b.level - a.level;
      return nameA.localeCompare(nameB);
    });
    entries.forEach(([name, { count, level }]) => {
      const levelTag = level != null ? ` \x1b[2m(Lvl ${level})\x1b[0m` : '';
      console.log(`    - \x1b[32m${name}\x1b[0m${levelTag} x${count}`);
    });
  });

  console.log(`\x1b[36m==================================================\x1b[0m\n`);
}

// CLI Execution
const args = process.argv.slice(2);
const targetFile = args[0] || path.join(__dirname, 'saves', 'Amazonka.d2s');

parseSaveFile(targetFile);
