/**
 * Diablo II Constants, Lookups & Item Database
 */

const CLASSES = ['Amazon', 'Sorceress', 'Necromancer', 'Paladin', 'Barbarian', 'Druid', 'Assassin'];

const CLASS_SKILLS = {
  // Amazon (Class ID 0)
  0: [
    { id: 6, name: 'Magic Arrow', tree: 'Bow and Crossbow' },
    { id: 7, name: 'Fire Arrow', tree: 'Bow and Crossbow' },
    { id: 11, name: 'Cold Arrow', tree: 'Bow and Crossbow' },
    { id: 12, name: 'Multiple Shot', tree: 'Bow and Crossbow' },
    { id: 16, name: 'Exploding Arrow', tree: 'Bow and Crossbow' },
    { id: 21, name: 'Ice Arrow', tree: 'Bow and Crossbow' },
    { id: 22, name: 'Guided Arrow', tree: 'Bow and Crossbow' },
    { id: 26, name: 'Strafe', tree: 'Bow and Crossbow' },
    { id: 27, name: 'Immolation Arrow', tree: 'Bow and Crossbow' },
    { id: 31, name: 'Freezing Arrow', tree: 'Bow and Crossbow' },

    { id: 8, name: 'Inner Sight', tree: 'Passive and Magic' },
    { id: 9, name: 'Critical Strike', tree: 'Passive and Magic' },
    { id: 13, name: 'Dodge', tree: 'Passive and Magic' },
    { id: 14, name: 'Slow Missiles', tree: 'Passive and Magic' },
    { id: 18, name: 'Avoid', tree: 'Passive and Magic' },
    { id: 19, name: 'Penetrate', tree: 'Passive and Magic' },
    { id: 23, name: 'Decoy', tree: 'Passive and Magic' },
    { id: 24, name: 'Evade', tree: 'Passive and Magic' },
    { id: 28, name: 'Valkyrie', tree: 'Passive and Magic' },
    { id: 29, name: 'Pierce', tree: 'Passive and Magic' },

    { id: 10, name: 'Jab', tree: 'Javelin and Spear' },
    { id: 15, name: 'Power Strike', tree: 'Javelin and Spear' },
    { id: 17, name: 'Poison Javelin', tree: 'Javelin and Spear' },
    { id: 20, name: 'Impale', tree: 'Javelin and Spear' },
    { id: 25, name: 'Lightning Bolt', tree: 'Javelin and Spear' },
    { id: 30, name: 'Charged Strike', tree: 'Javelin and Spear' },
    { id: 32, name: 'Plague Javelin', tree: 'Javelin and Spear' },
    { id: 33, name: 'Fend', tree: 'Javelin and Spear' },
    { id: 34, name: 'Lightning Strike', tree: 'Javelin and Spear' },
    { id: 35, name: 'Lightning Fury', tree: 'Javelin and Spear' }
  ]
};

const QUEST_NAMES = {
  0: 'Den of Evil', 1: 'Sisters\' Burial Grounds', 2: 'Tools of the Trade', 3: 'Search for Cain', 4: 'The Forgotten Tower', 5: 'Sisters to the Slaughter',
  6: 'Radament\'s Lair', 7: 'The Horadric Staff', 8: 'Tainted Sun', 9: 'Arcane Sanctuary', 10: 'The Summoner', 11: 'The Seven Tombs',
  12: 'Lam Esen\'s Tome', 13: 'Khalim\'s Will', 14: 'Blade of the Old Religion', 15: 'Golden Bird', 16: 'Gidbinn', 17: 'Mephisto',
  18: 'Izual', 19: 'Hell\'s Forge', 20: 'Diablo',
  21: 'Shenk the Overseer', 22: 'Rescue Barbarians', 23: 'Anya', 24: 'Nihlathak', 25: 'Ancients', 26: 'Baal'
};

const WAYPOINT_NAMES = [
  'Rogue Encampment', 'Cold Plains', 'Stony Field', 'Dark Wood', 'Black Marsh', 'Outer Cloister', 'Jail Lvl 1', 'Inner Cloister', 'Catacombs Lvl 2',
  'Lut Gholein', 'Sewers Lvl 2', 'Dry Hills', 'Halls of the Dead Lvl 2', 'Far Oasis', 'Lost City', 'Palace Cellar Lvl 1', 'Arcane Sanctuary', 'Canyon of the Magi',
  'Kurast Docks', 'Spider Forest', 'Great Marsh', 'Flayer Jungle', 'Lower Kurast', 'Kurast Bazaar', 'Upper Kurast', 'Travincal', 'Durance of Hate Lvl 2',
  'Pandemonium Fortress', 'City of the Damned', 'River of Flame',
  'Harrogath', 'Frigid Highlands', 'Arreat Plateau', 'Crystalline Passage', 'Halls of Pain', 'Glacial Trail', 'Frozen Tundra', 'Ancients\' Way', 'Worldstone Keep Lvl 2'
];

const EQUIPPED_SLOTS = {
  1: 'Helm', 2: 'Amulet', 3: 'Armor',
  4: 'Right Hand Weapon', 5: 'Shield / Offhand',
  6: 'Right Ring', 7: 'Left Ring',
  8: 'Belt', 9: 'Boots', 10: 'Gloves',
  11: 'Swap Weapon Right', 12: 'Swap Weapon Left'
};

const STORED_LOCATIONS = {
  1: 'Inventory', 4: 'Cube', 5: 'Stash'
};

const QUALITIES = {
  1: 'Inferior', 2: 'Normal', 3: 'Superior', 4: 'Magic',
  5: 'Set', 6: 'Rare', 7: 'Unique', 8: 'Crafted'
};

// Item Database (Code -> Name & Type)
const ITEM_DATABASE = {
  // Books & Containers & Utility
  'tbk': { name: 'Tome of Town Portal', type: 'Utility' },
  'ibk': { name: 'Tome of Identify', type: 'Utility' },
  'tsc': { name: 'Scroll of Town Portal', type: 'Consumable' },
  'isc': { name: 'Scroll of Identify', type: 'Consumable' },
  'box': { name: 'Horadric Cube', type: 'Quest / Container' },
  'key': { name: 'Key', type: 'Utility' },
  'aqv': { name: 'Quiver of Arrows', type: 'Ammunition' },
  'cqv': { name: 'Quiver of Bolts', type: 'Ammunition' },

  // Quest Items
  'qey': { name: 'Khalim\'s Eye', type: 'Quest Item' },
  'qbr': { name: 'Khalim\'s Brain', type: 'Quest Item' },
  'qhr': { name: 'Khalim\'s Heart', type: 'Quest Item' },
  'qfl': { name: 'Khalim\'s Flail', type: 'Quest Item' },
  'hst': { name: 'Horadric Staff', type: 'Quest Item' },

  // Charms
  'cm1': { name: 'Small Charm', type: 'Charm' },
  'cm2': { name: 'Large Charm', type: 'Charm' },
  'cm3': { name: 'Grand Charm', type: 'Charm' },

  // Jewelry
  'rin': { name: 'Ring', type: 'Ring' },
  'amu': { name: 'Amulet', type: 'Amulet' },

  // Armor & Clothing
  'cap': { name: 'Cap', type: 'Helm' },
  'fhl': { name: 'Full Helm', type: 'Helm' },
  'skp': { name: 'Skull Cap', type: 'Helm' },
  'hlm': { name: 'Helm', type: 'Helm' },
  'ghm': { name: 'Great Helm', type: 'Helm' },
  'bhm': { name: 'Bone Helm', type: 'Helm' },
  'xhl': { name: 'Basinet', type: 'Helm' },
  'dr3': { name: 'Antlers', type: 'Helm' },
  'lea': { name: 'Leather Armor', type: 'Body Armor' },
  'gth': { name: 'Gothic Plate', type: 'Body Armor' },
  'rng': { name: 'Ring Mail', type: 'Body Armor' },
  'spl': { name: 'Splint Mail', type: 'Body Armor' },
  'xcl': { name: 'Tigulated Mail', type: 'Body Armor' },
  'mbl': { name: 'Belt', type: 'Belt' },
  'tbl': { name: 'Heavy Belt', type: 'Belt' },
  'vbl': { name: 'Light Belt', type: 'Belt' },
  'vbt': { name: 'Heavy Boots', type: 'Boots' },
  'tbt': { name: 'Light Plate Boots', type: 'Boots' },
  'lbt': { name: 'Leather Boots', type: 'Boots' },
  'mbt': { name: 'Chain Boots', type: 'Boots' },
  'xlb': { name: 'Demonhide Boots', type: 'Boots' },
  'vgl': { name: 'Heavy Gloves', type: 'Gloves' },
  'lgl': { name: 'Leather Gloves', type: 'Gloves' },
  'hbl': { name: 'Girdle', type: 'Belt' },
  'lbl': { name: 'Sash', type: 'Belt' },
  'xrs': { name: 'Cuirass', type: 'Body Armor' },
  'bsh': { name: 'Bone Shield', type: 'Shield' },
  'pa1': { name: 'Targe', type: 'Shield' },

  // Weapons & Bows
  'hbw': { name: 'Hunter\'s Bow', type: 'Bow' },
  'sbw': { name: 'Short Bow', type: 'Bow' },
  'lbw': { name: 'Long Bow', type: 'Bow' },
  'swb': { name: 'Short War Bow', type: 'Bow' },
  'lwb': { name: 'Long War Bow', type: 'Bow' },
  'cbw': { name: 'Composite Bow', type: 'Bow' },
  'sbb': { name: 'Short Battle Bow', type: 'Bow' },
  'lbb': { name: 'Long Battle Bow', type: 'Bow' },
  '8lw': { name: 'Gothic Bow', type: 'Bow' },
  '8s8': { name: 'Short Siege Bow', type: 'Bow' },
  'am1': { name: 'Stag Bow', type: 'Amazon Bow' },
  'am2': { name: 'Reflex Bow', type: 'Amazon Bow' },
  'am3': { name: 'Maiden Spear', type: 'Amazon Spear' },
  'am6': { name: 'Ashwood Bow', type: 'Amazon Bow' },
  'am7': { name: 'Ceremonial Bow', type: 'Amazon Bow' },
  'crs': { name: 'Crystal Sword', type: 'Sword' },
  'lsd': { name: 'Long Sword', type: 'Sword' },
  'wsd': { name: 'War Sword', type: 'Sword' },
  'bwn': { name: 'Bone Wand', type: 'Wand' },

  // Runes (level = rune number, El lowest to Zod highest)
  'r01': { name: 'El Rune', type: 'Rune', level: 1 },
  'r02': { name: 'Eld Rune', type: 'Rune', level: 2 },
  'r03': { name: 'Tir Rune', type: 'Rune', level: 3 },
  'r04': { name: 'Nef Rune', type: 'Rune', level: 4 },
  'r05': { name: 'Eth Rune', type: 'Rune', level: 5 },
  'r06': { name: 'Ith Rune', type: 'Rune', level: 6 },
  'r07': { name: 'Tal Rune', type: 'Rune', level: 7 },
  'r08': { name: 'Ral Rune', type: 'Rune', level: 8 },
  'r09': { name: 'Ort Rune', type: 'Rune', level: 9 },
  'r10': { name: 'Thul Rune', type: 'Rune', level: 10 },
  'r11': { name: 'Amn Rune', type: 'Rune', level: 11 },
  'r12': { name: 'Sol Rune', type: 'Rune', level: 12 },
  'r13': { name: 'Shael Rune', type: 'Rune', level: 13 },
  'r14': { name: 'Dol Rune', type: 'Rune', level: 14 },
  'r15': { name: 'Hel Rune', type: 'Rune', level: 15 },
  'r16': { name: 'Io Rune', type: 'Rune', level: 16 },
  'r17': { name: 'Lum Rune', type: 'Rune', level: 17 },
  'r18': { name: 'Ko Rune', type: 'Rune', level: 18 },
  'r19': { name: 'Fal Rune', type: 'Rune', level: 19 },
  'r20': { name: 'Lem Rune', type: 'Rune', level: 20 },
  'r21': { name: 'Pul Rune', type: 'Rune', level: 21 },
  'r22': { name: 'Um Rune', type: 'Rune', level: 22 },
  'r23': { name: 'Mal Rune', type: 'Rune', level: 23 },
  'r24': { name: 'Ist Rune', type: 'Rune', level: 24 },
  'r25': { name: 'Gul Rune', type: 'Rune', level: 25 },
  'r26': { name: 'Vex Rune', type: 'Rune', level: 26 },
  'r27': { name: 'Ohm Rune', type: 'Rune', level: 27 },
  'r28': { name: 'Lo Rune', type: 'Rune', level: 28 },
  'r29': { name: 'Sur Rune', type: 'Rune', level: 29 },
  'r30': { name: 'Ber Rune', type: 'Rune', level: 30 },
  'r31': { name: 'Jah Rune', type: 'Rune', level: 31 },
  'r32': { name: 'Cham Rune', type: 'Rune', level: 32 },
  'r33': { name: 'Zod Rune', type: 'Rune', level: 33 },

  // Gems (g + quality[c=chipped,f=flawed,s=normal,l=flawless,p=perfect] + color)
  'gcv': { name: 'Chipped Amethyst', type: 'Gem' },
  'gfv': { name: 'Flawed Amethyst', type: 'Gem' },
  'gsv': { name: 'Amethyst', type: 'Gem' },
  'gzv': { name: 'Flawless Amethyst', type: 'Gem' },
  'gpv': { name: 'Perfect Amethyst', type: 'Gem' },
  'gcy': { name: 'Chipped Topaz', type: 'Gem' },
  'gfy': { name: 'Flawed Topaz', type: 'Gem' },
  'gsy': { name: 'Topaz', type: 'Gem' },
  'gly': { name: 'Flawless Topaz', type: 'Gem' },
  'gpy': { name: 'Perfect Topaz', type: 'Gem' },
  'gcb': { name: 'Chipped Sapphire', type: 'Gem' },
  'gfb': { name: 'Flawed Sapphire', type: 'Gem' },
  'gsb': { name: 'Sapphire', type: 'Gem' },
  'glb': { name: 'Flawless Sapphire', type: 'Gem' },
  'gpb': { name: 'Perfect Sapphire', type: 'Gem' },
  'gcg': { name: 'Chipped Emerald', type: 'Gem' },
  'gfg': { name: 'Flawed Emerald', type: 'Gem' },
  'gsg': { name: 'Emerald', type: 'Gem' },
  'glg': { name: 'Flawless Emerald', type: 'Gem' },
  'gpg': { name: 'Perfect Emerald', type: 'Gem' },
  'gcr': { name: 'Chipped Ruby', type: 'Gem' },
  'gfr': { name: 'Flawed Ruby', type: 'Gem' },
  'gsr': { name: 'Ruby', type: 'Gem' },
  'glr': { name: 'Flawless Ruby', type: 'Gem' },
  'gpr': { name: 'Perfect Ruby', type: 'Gem' },
  'gcw': { name: 'Chipped Diamond', type: 'Gem' },
  'gfw': { name: 'Flawed Diamond', type: 'Gem' },
  'gsw': { name: 'Diamond', type: 'Gem' },
  'glw': { name: 'Flawless Diamond', type: 'Gem' },
  'gpw': { name: 'Perfect Diamond', type: 'Gem' },
  'skc': { name: 'Chipped Skull', type: 'Gem' },
  'skf': { name: 'Flawed Skull', type: 'Gem' },
  'sku': { name: 'Skull', type: 'Gem' },
  'skl': { name: 'Flawless Skull', type: 'Gem' },
  'skz': { name: 'Perfect Skull', type: 'Gem' },
  'jew': { name: 'Jewel', type: 'Jewel' },

  // Potions
  'hp1': { name: 'Minor Healing Potion', type: 'Potion' },
  'hp2': { name: 'Light Healing Potion', type: 'Potion' },
  'hp3': { name: 'Healing Potion', type: 'Potion' },
  'hp4': { name: 'Greater Healing Potion', type: 'Potion' },
  'hp5': { name: 'Super Healing Potion', type: 'Potion' },
  'mp1': { name: 'Minor Mana Potion', type: 'Potion' },
  'mp2': { name: 'Light Mana Potion', type: 'Potion' },
  'mp3': { name: 'Mana Potion', type: 'Potion' },
  'mp4': { name: 'Greater Mana Potion', type: 'Potion' },
  'mp5': { name: 'Super Mana Potion', type: 'Potion' },
  'rvs': { name: 'Rejuvenation Potion', type: 'Potion' },
  'rvl': { name: 'Full Rejuvenation Potion', type: 'Potion' }
};

module.exports = {
  CLASSES,
  CLASS_SKILLS,
  QUEST_NAMES,
  WAYPOINT_NAMES,
  EQUIPPED_SLOTS,
  STORED_LOCATIONS,
  QUALITIES,
  ITEM_DATABASE
};
