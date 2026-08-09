/**
 * Non-Ladder Runewords Reference (Diablo II LoD, classic v1.09-1.14b)
 * Source: https://diablo2.diablowiki.net/Runewords (Alphabetical List of All Runewords)
 * Ladder-only runewords are excluded -- they cannot be created in classic single-player LoD.
 */

const RUNEWORDS = [
  {
    name: "Ancient's Pledge",
    category: "All Shields",
    sockets: 3,
    clvlRequired: 21,
    runes: [{ name: "Ral", level: 8 }, { name: "Ort", level: 9 }, { name: "Tal", level: 7 }],
    stats: ["+50% Enhanced Defense", "Cold Resist +43%", "Lightning Resist +48%", "Fire Resist +48%", "Poison Resist +48%", "10% Damage Taken Goes to Mana"]
  },
  {
    name: "Beast",
    category: "Axes, Hammers & Scepters",
    sockets: 5,
    clvlRequired: 63,
    runes: [{ name: "Ber", level: 30 }, { name: "Tir", level: 3 }, { name: "Um", level: 22 }, { name: "Mal", level: 23 }, { name: "Lum", level: 17 }],
    stats: ["Level 9 Fanaticism Aura When Equipped", "+40% Increased Attack Speed", "+240-270% Enhanced Damage (varies)", "20% Chance of Crushing Blow", "25% Chance of Open Wounds", "+3 To Werebear", "+3 To Lycanthropy", "Prevent Monster Heal", "+25-40 To Strength (varies)", "+10 To Energy", "+2 To Mana After Each Kill", "Level 13 Summon Grizzly (5 Charges)"]
  },
  {
    name: "Black",
    category: "Clubs, Hammers, Maces",
    sockets: 3,
    clvlRequired: 35,
    runes: [{ name: "Thul", level: 10 }, { name: "Io", level: 16 }, { name: "Nef", level: 4 }],
    stats: ["+15% Increased Attack Speed", "+120% Enhanced Damage", "+200 to Attack Rating", "Adds 3-14 Cold Damage (3 sec)", "40% Chance of Crushing Blow", "Knockback", "+10 to Vitality", "Magic Damage Reduced By 2", "Level 4 Corpse Explosion (12 Charges)"]
  },
  {
    name: "Bone",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 47,
    runes: [{ name: "Sol", level: 12 }, { name: "Um", level: 22 }, { name: "Um", level: 22 }],
    stats: ["15% Chance To Cast level 10 Bone Armor When Struck", "15% Chance To Cast level 10 Bone Spear On Striking", "+2 To Necromancer Skill Levels", "+100-150 To Mana (varies)", "All Resistances +30", "Damage Reduced By 7"]
  },
  {
    name: "Bramble",
    category: "Body Armor",
    sockets: 4,
    clvlRequired: 61,
    runes: [{ name: "Ral", level: 8 }, { name: "Ohm", level: 27 }, { name: "Sur", level: 29 }, { name: "Eth", level: 5 }],
    stats: ["Level 15-21 Thorns Aura When Equipped (varies)", "+50% Faster Hit Recovery", "+25-50% To Poison Skill Damage (varies)", "+300 Defense", "Increase Maximum Mana 5%", "Regenerate Mana 15%", "+5% To Maximum Cold Resist", "Fire Resist +30%", "Poison Resist +100%", "+13 Life After Each Kill", "Level 13 Spirit of Barbs (33 Charges)"]
  },
  {
    name: "Breath of the Dying",
    category: "All Ranged & Melee Weapons",
    sockets: 6,
    clvlRequired: 69,
    runes: [{ name: "Vex", level: 26 }, { name: "Hel", level: 15 }, { name: "El", level: 1 }, { name: "Eld", level: 2 }, { name: "Zod", level: 33 }, { name: "Eth", level: 5 }],
    stats: ["50% Chance To Cast Level 20 Poison Nova When You Kill An Enemy", "Indestructible", "+60% Increased Attack Speed", "+350-400% Enhanced Damage (varies)", "-25% Target Defense", "+50 To Attack Rating", "+200% Damage To Undead", "+50 To Attack Rating Against Undead", "7% Mana Stolen Per Hit", "12-15% Life Stolen Per Hit (varies)", "Prevent Monster Heal", "+30 To All Attributes", "+1 To Light Radius", "Requirements -20%"]
  },
  {
    name: "Call to Arms",
    category: "All Ranged & Melee Weapons",
    sockets: 5,
    clvlRequired: 57,
    runes: [{ name: "Amn", level: 11 }, { name: "Ral", level: 8 }, { name: "Mal", level: 23 }, { name: "Ist", level: 24 }, { name: "Ohm", level: 27 }],
    stats: ["+1 To All Skills", "+40% Increased Attack Speed", "+240-290% Enhanced Damage (varies)", "Adds 5-30 Fire Damage", "7% Life Stolen Per Hit", "+2-6 To Battle Command (varies)", "+1-6 To Battle Orders (varies)", "+1-4 To Battle Cry (varies)", "Prevent Monster Heal", "Replenish Life +12", "30% Better Chance of Getting Magic Items"]
  },
  {
    name: "Chains of Honor",
    category: "Body Armor",
    sockets: 4,
    clvlRequired: 63,
    runes: [{ name: "Dol", level: 14 }, { name: "Um", level: 22 }, { name: "Ber", level: 30 }, { name: "Ist", level: 24 }],
    stats: ["+2 To All Skills", "+200% Damage To Demons", "+100% Damage To Undead", "8% Life Stolen Per Hit", "+70% Enhanced Defense", "+20 To Strength", "Replenish Life +7", "All Resistances +65", "Damage Reduced By 8%", "25% Better Chance of Getting Magic Items"]
  },
  {
    name: "Chaos",
    category: "Claws",
    sockets: 3,
    clvlRequired: 57,
    runes: [{ name: "Fal", level: 19 }, { name: "Ohm", level: 27 }, { name: "Um", level: 22 }],
    stats: ["9% Chance To Cast Level 11 Frozen Orb On Striking", "11% Chance To Cast Level 9 Charged Bolt On Striking", "+35% Increased Attacked Speed", "+240-290% Enhanced Damage (varies)", "Adds 216-471 Magic Damage", "25% Chance of Open Wounds", "+1 To Whirlwind", "+10 To Strength", "+15 Life After Each Demon Kill"]
  },
  {
    name: "Crescent Moon",
    category: "Axes, Polearms & Swords",
    sockets: 3,
    clvlRequired: 47,
    runes: [{ name: "Shael", level: 13 }, { name: "Um", level: 22 }, { name: "Tir", level: 3 }],
    stats: ["10% Chance To Cast Level 17 Chain Lightning On Striking", "7% Chance To Cast Level 13 Static Field On Striking", "+20% Increased Attack Speed", "+180-220% Enhanced Damage (varies)", "Ignore Target's Defense", "-35% To Enemy Lightning Resistance", "25% Chance of Open Wounds", "+9-11 Magic Absorb (varies)", "+2 To Mana After Each Kill", "Level 18 Summon Spirit Wolf (30 Charges)"]
  },
  {
    name: "Delirium",
    category: "All Headgear",
    sockets: 3,
    clvlRequired: 51,
    runes: [{ name: "Lem", level: 20 }, { name: "Ist", level: 24 }, { name: "Io", level: 16 }],
    stats: ["1% Chance To Cast lvl 50 Delirium When Struck", "6% Chance To Cast lvl 14 Mind Blast When Struck", "14% Chance To Cast lvl 13 Terror When Struck", "11% Chance To Cast lvl 18 Confuse On Striking", "+2 To All Skills", "+261 Defense", "+10 To Vitality", "50% Extra Gold From Monsters", "25% Better Chance of Getting Magic Items", "Level 17 Attract (60 Charges)"]
  },
  {
    name: "Doom",
    category: "Axes, Hammers & Polearms",
    sockets: 5,
    clvlRequired: 67,
    runes: [{ name: "Hel", level: 15 }, { name: "Ohm", level: 27 }, { name: "Um", level: 22 }, { name: "Lo", level: 28 }, { name: "Cham", level: 32 }],
    stats: ["5% Chance To Cast Level 18 Volcano On Striking", "Level 12 Holy Freeze Aura When Equipped", "+2 To All Skills", "+45% Increased Attack Speed", "+330-370% Enhanced Damage (varies)", "-40-60% To Enemy Cold Resistance (varies)", "20% Deadly Strike", "25% Chance of Open Wounds", "Prevent Monster Heal", "Freezes Target +3", "Requirements -20%"]
  },
  {
    name: "Duress",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 47,
    runes: [{ name: "Shael", level: 13 }, { name: "Um", level: 22 }, { name: "Thul", level: 10 }],
    stats: ["40% faster hit Recovery", "+10-20% Enhanced Damage (varies)", "Adds 37-133 Cold Damage", "15% Crushing Blow", "33% Open Wounds", "+150-200% Enhanced Defense (varies)", "-20% Slower Stamina Drain", "Cold Resist +45%", "Lightning Resist +15%", "Fire Resist +15%", "Poison Resist +15%"]
  },
  {
    name: "Enigma",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 65,
    runes: [{ name: "Jah", level: 31 }, { name: "Ith", level: 6 }, { name: "Ber", level: 30 }],
    stats: ["+2 To All Skills", "+45% Faster Run/Walk", "+1 To Teleport", "+750-775 Defense (Varies)", "+(0.75*Clvl) To Strength (Based On Character Level)", "Increase Maximum Life 5%", "Damage Reduced By 8%", "+14 Life After Each Kill", "15% Damage Taken Goes To Mana", "(1*Clvl)% Better Chance of Getting Magic Items (Based On Character Level)"]
  },
  {
    name: "Enlightenment",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 45,
    runes: [{ name: "Pul", level: 21 }, { name: "Ral", level: 8 }, { name: "Sol", level: 12 }],
    stats: ["5% Chance To Cast Level 15 Blaze When Struck", "5% Chance To Cast level 15 Fire Ball On Striking", "+2 To Sorceress Skill Levels", "+1 To Warmth", "+30% Enhanced Defense", "Fire Resist +30%", "Damage Reduced By 7"]
  },
  {
    name: "Eternity",
    category: "All Melee Weapons",
    sockets: 5,
    clvlRequired: 63,
    runes: [{ name: "Amn", level: 11 }, { name: "Ber", level: 30 }, { name: "Ist", level: 24 }, { name: "Sol", level: 12 }, { name: "Sur", level: 29 }],
    stats: ["Indestructible", "+260-310% Enhanced Damage (varies)", "+9 To Minimum Damage", "7% Life Stolen Per Hit", "20% Chance of Crushing Blow", "Hit Blinds Target", "Slows Target By 33%", "Replenish Mana 16%", "Cannot Be Frozen", "30% Better Chance Of Getting Magic Items", "Level 8 Revive (88 Charges)"]
  },
  {
    name: "Exile",
    category: "Paladin Shields",
    sockets: 4,
    clvlRequired: 57,
    runes: [{ name: "Vex", level: 26 }, { name: "Ohm", level: 27 }, { name: "Ist", level: 24 }, { name: "Dol", level: 14 }],
    stats: ["15% Chance To Cast Level 5 Life Tap On Striking", "Level 13-16 Defiance Aura When Equipped (varies)", "+2 To Offensive Auras (Paladin Only)", "+30% Faster Block Rate", "Freezes Target", "+220-260% Enhanced Defense (varies)", "Replenish Life +7", "+5% To Maximum Cold Resist", "+5% To Maximum Fire Resist", "25% Better Chance Of Getting Magic Items", "Repairs 1 Durability every 4 seconds"]
  },
  {
    name: "Famine",
    category: "Axes & Hammers",
    sockets: 4,
    clvlRequired: 65,
    runes: [{ name: "Fal", level: 19 }, { name: "Ohm", level: 27 }, { name: "Ort", level: 9 }, { name: "Jah", level: 31 }],
    stats: ["+30% Increased Attack Speed", "+320-370% Enhanced Damage (varies)", "Ignore Target's Defense", "Adds 180-200 Magic Damage", "Adds 50-200 Fire Damage", "Adds 51-250 Lightning Damage", "Adds 50-200 Cold Damage", "12% Life Stolen Per Hit", "Prevent Monster Heal", "+10 To Strength"]
  },
  {
    name: "Fury",
    category: "All Melee Weapons",
    sockets: 3,
    clvlRequired: 65,
    runes: [{ name: "Jah", level: 31 }, { name: "Gul", level: 25 }, { name: "Eth", level: 5 }],
    stats: ["40% Increased Attack Speed", "+209% Enhanced Damage", "Ignores Target Defense", "-25% Target Defense", "20% Bonus to Attack Rating", "6% Life Stolen Per Hit", "33% Chance Of Deadly Strike", "66% Chance Of Open Wounds", "+5 To Frenzy (Barbarian Only)", "Prevent Monster Heal"]
  },
  {
    name: "Gloom",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 47,
    runes: [{ name: "Fal", level: 19 }, { name: "Um", level: 22 }, { name: "Pul", level: 21 }],
    stats: ["15% Chance To Cast Level 3 Dim Vision When Struck", "+10% Faster Hit Recovery", "+200-260% Enhanced Defense (varies)", "+10 To Strength", "All Resistances +45", "Half Freeze Duration", "5% Damage Taken Goes To Mana", "-3 To Light Radius"]
  },
  {
    name: "Hand of Justice",
    category: "All Ranged & Melee Weapons",
    sockets: 4,
    clvlRequired: 67,
    runes: [{ name: "Sur", level: 29 }, { name: "Cham", level: 32 }, { name: "Amn", level: 11 }, { name: "Lo", level: 28 }],
    stats: ["100% Chance To Cast Level 36 Blaze When You Level-Up", "100% Chance To Cast Level 48 Meteor When You Die", "Level 16 Holy Fire Aura When Equipped", "+33% Increased Attack Speed", "+280-330% Enhanced Damage (varies)", "Ignore Target's Defense", "-20% To Enemy Fire Resistance", "7% Life Stolen Per Hit", "20% Deadly Strike", "Hit Blinds Target", "Freezes Target +3"]
  },
  {
    name: "Heart of the Oak",
    category: "Staves & Maces",
    sockets: 4,
    clvlRequired: 55,
    runes: [{ name: "Ko", level: 18 }, { name: "Vex", level: 26 }, { name: "Pul", level: 21 }, { name: "Thul", level: 10 }],
    stats: ["+3 To All Skills", "+40% Faster Cast Rate", "+75% Damage To Demons", "+100 To Attack Rating Against Demons", "Adds 3-14 Cold Damage", "7% Mana Stolen Per Hit", "+10 To Dexterity", "Replenish Life +20", "Increase Maximum Mana 15%", "All Resistances +30-40 (varies)", "Level 4 Oak Sage (25 Charges)", "Level 14 Raven (60 Charges)"]
  },
  {
    name: "Holy Thunder",
    category: "Scepters",
    sockets: 4,
    clvlRequired: 23,
    runes: [{ name: "Eth", level: 5 }, { name: "Ral", level: 8 }, { name: "Ort", level: 9 }, { name: "Tal", level: 7 }],
    stats: ["+60% Enhanced Damage", "+10 to Maximum Damage", "-25% Target Defense", "Adds 5-30 Fire Damage", "Adds 21-110 Lightning Damage", "+75 Poison Damage over 5 secs", "+3 to Holy Shock (Paladin Only)", "+5% to Maximum Lightning Resist", "Lightning Resist +60%", "Level 7 Chain Lightning (60 charges)"]
  },
  {
    name: "Honor",
    category: "All Melee Weapons",
    sockets: 5,
    clvlRequired: 27,
    runes: [{ name: "Amn", level: 11 }, { name: "El", level: 1 }, { name: "Ith", level: 6 }, { name: "Tir", level: 3 }, { name: "Sol", level: 12 }],
    stats: ["+1 to all skills", "+160% Enhanced Damage", "+9 to Minimum Damage", "+9 to Maximum Damage", "+250 Attack Rating", "7% Life Stolen per Hit", "25% Deadly Strike", "+10 to Strength", "Replenish life +10", "+2 to Mana after each Kill", "+1 to Light Radius"]
  },
  {
    name: "King's Grace",
    category: "Swords & Scepters",
    sockets: 3,
    clvlRequired: 25,
    runes: [{ name: "Amn", level: 11 }, { name: "Ral", level: 8 }, { name: "Thul", level: 10 }],
    stats: ["+100% Enhanced Damage", "+150 to Attack Rating", "+100% Damage to Demons", "+100 to Attack Rating against Demons", "+50% Damage to Undead", "+100 to Attack Rating against Undead", "Adds 5-30 Fire Damage", "Adds 3-14 Cold damage", "7% Life stolen per hit"]
  },
  {
    name: "Kingslayer",
    category: "Swords & Axes",
    sockets: 4,
    clvlRequired: 53,
    runes: [{ name: "Mal", level: 23 }, { name: "Um", level: 22 }, { name: "Gul", level: 25 }, { name: "Fal", level: 19 }],
    stats: ["+30% Increased Attack Speed", "+230-270% Enhanced Damage (varies)", "-25% Target Defense", "20% Bonus To Attack Rating", "33% Chance of Crushing Blow", "50% Chance of Open Wounds", "+1 To Vengeance", "Prevent Monster Heal", "+10 To Strength", "40% Extra Gold From Monsters"]
  },
  {
    name: "Leaf",
    category: "Staves",
    sockets: 2,
    clvlRequired: 19,
    runes: [{ name: "Tir", level: 3 }, { name: "Ral", level: 8 }],
    stats: ["+3 to Fire Skills", "Adds 5-30 Fire Damage", "+3 to Inferno (Sorceress Only)", "+3 to Warmth (Sorceress Only)", "+3 to Fire Bolt (Sorceress Only)", "+(2*Clvl) Defence (Based on Character Level)", "Cold Resist +33%", "+2 to Mana after each Kill"]
  },
  {
    name: "Lionheart",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 41,
    runes: [{ name: "Hel", level: 15 }, { name: "Lum", level: 17 }, { name: "Fal", level: 19 }],
    stats: ["+20% Enhanced Damage", "+25 To Strength", "+15 To Dexterity", "+20 To Vitality", "+10 To Energy", "+50 To Life", "All Resistances +30", "Requirements -15%"]
  },
  {
    name: "Lore",
    category: "All Headgear",
    sockets: 2,
    clvlRequired: 27,
    runes: [{ name: "Ort", level: 9 }, { name: "Sol", level: 12 }],
    stats: ["+1 to All Skills", "+10 to Energy", "Lightning Resist +30%", "Damage Reduced by 7", "+2 to Mana after each Kill", "+2 to Light Radius"]
  },
  {
    name: "Malice",
    category: "All Melee Weapons",
    sockets: 3,
    clvlRequired: 15,
    runes: [{ name: "Ith", level: 6 }, { name: "El", level: 1 }, { name: "Eth", level: 5 }],
    stats: ["+33% Enhanced Damage", "+9 to Maximum Damage", "-25% Target Defense", "+50 to Attack Rating", "100% Chance of Open wounds", "Prevent Monster Heal", "-100 to Monster Defense Per Hit", "Drain Life -5"]
  },
  {
    name: "Melody",
    category: "Bows & Crossbows",
    sockets: 3,
    clvlRequired: 39,
    runes: [{ name: "Shael", level: 13 }, { name: "Ko", level: 18 }, { name: "Nef", level: 4 }],
    stats: ["+3 To Bow and Crossbow Skills (Amazon Only)", "+20% Increased Attack Speed", "+50% Enhanced Damage", "+300% Damage To Undead", "+3 To Slow Missiles (Amazon Only)", "+3 To Dodge (Amazon Only)", "+3 To Critical Strike (Amazon Only)", "Knockback", "+10 To Dexterity"]
  },
  {
    name: "Memory",
    category: "Staves",
    sockets: 4,
    clvlRequired: 37,
    runes: [{ name: "Lum", level: 17 }, { name: "Io", level: 16 }, { name: "Sol", level: 12 }, { name: "Eth", level: 5 }],
    stats: ["+3 To Sorceress Skill Levels", "+33% Faster Cast Rate", "+9 To Minimum Damage", "-25% Target Defence", "+3 To Energy Shield (Sorceress Only)", "+2 To Static Field (Sorceress Only)", "+50% Enhanced Defense", "+10 Vitality", "+10 Energy", "Increase Maximum Mana 20%", "Magic Damage Reduced By 7"]
  },
  {
    name: "Myth",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 25,
    runes: [{ name: "Hel", level: 15 }, { name: "Amn", level: 11 }, { name: "Nef", level: 4 }],
    stats: ["3% Chance To Cast Level 1 Howl When Struck", "10% Chance To Cast Level 1 Taunt On Striking", "+2 To Barbarian Skill Levels", "+30 Defense Vs. Missile", "Replenish Life +10", "Attacker Takes Damage of 14", "Requirements -15%"]
  },
  {
    name: "Nadir",
    category: "All Headgear",
    sockets: 2,
    clvlRequired: 13,
    runes: [{ name: "Nef", level: 4 }, { name: "Tir", level: 3 }],
    stats: ["+50% Enhanced Defense", "+10 Defense", "+30 Defense vs. Missile", "+5 to Strength", "+2 to Mana after each Kill", "-33% Extra Gold from Monsters", "-3 to Light Radius", "Level 13 Cloak of Shadows (9 charges)"]
  },
  {
    name: "Passion",
    category: "All Ranged & Melee Weapons",
    sockets: 4,
    clvlRequired: 43,
    runes: [{ name: "Dol", level: 14 }, { name: "Ort", level: 9 }, { name: "Eld", level: 2 }, { name: "Lem", level: 20 }],
    stats: ["+25% Increased Attack Speed", "+160-210% Enhanced Damage (varies)", "50-80% Bonus To Attack Rating (varies)", "+75% Damage To Undead", "+50 To Attack Rating Against Undead", "Adds 1-50 Lightning Damage", "+1 To Berserk", "+1 To Zeal", "Hit Blinds Target +10", "Hit Causes Monster To Flee 25%", "75% Extra Gold From Monsters", "Level 3 Heart of Wolverine (12 Charges)"]
  },
  {
    name: "Peace",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 29,
    runes: [{ name: "Shael", level: 13 }, { name: "Thul", level: 10 }, { name: "Amn", level: 11 }],
    stats: ["4% Chance To Cast Level 5 Slow Missiles When Struck", "2% Chance To Cast level 15 Valkyrie On Striking", "+2 To Amazon Skill Levels", "+20% Faster Hit Recovery", "+2 To Critical Strike", "Cold Resist +30%", "Attacker Takes Damage of 14"]
  },
  {
    name: "Principle",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 55,
    runes: [{ name: "Ral", level: 8 }, { name: "Gul", level: 25 }, { name: "Eld", level: 2 }],
    stats: ["100% Chance To Cast Level 5 Holy Bolt On Striking", "+2 To Paladin Skill Levels", "+50% Damage to Undead", "+100-150 to Life (varies)", "15% Slower Stamina Drain", "+5% To Maximum Poison Resist", "Fire Resist +30%"]
  },
  {
    name: "Prudence",
    category: "Body Armor",
    sockets: 2,
    clvlRequired: 49,
    runes: [{ name: "Mal", level: 23 }, { name: "Tir", level: 3 }],
    stats: ["+25% Faster Hit Recovery", "+140-170% Enhanced Defense (varies)", "All Resistances +25-35 (varies)", "Damage Reduced by 3", "Magic Damage Reduced by 17", "+2 To Mana After Each Kill", "+1 To Light Radius", "Repairs Durability 1 In 4 Seconds"]
  },
  {
    name: "Radiance",
    category: "All Headgear",
    sockets: 3,
    clvlRequired: 27,
    runes: [{ name: "Nef", level: 4 }, { name: "Sol", level: 12 }, { name: "Ith", level: 6 }],
    stats: ["+75% Enhanced Defense", "+30 Defense vs. Missiles", "+10 to Vitality", "+10 to Energy", "+33 to Mana", "Damage Reduced by 7", "Magic Damage Reduced by 3", "15% Damage Taken Goes to Mana", "+5 to Light Radius"]
  },
  {
    name: "Rain",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 49,
    runes: [{ name: "Ort", level: 9 }, { name: "Mal", level: 23 }, { name: "Ith", level: 6 }],
    stats: ["5% Chance To Cast Level 15 Cyclone Armor When Struck", "5% Chance To Cast Level 15 Twister On Striking", "+2 To Druid Skills", "+100-150 To Mana (varies)", "Lightning Resist +30%", "Magic Damage Reduced By 7", "15% Damage Taken Goes to Mana"]
  },
  {
    name: "Rhyme",
    category: "All Shields",
    sockets: 2,
    clvlRequired: 29,
    runes: [{ name: "Shael", level: 13 }, { name: "Eth", level: 5 }],
    stats: ["+40% Faster Block Rate", "20% Increased Chance of Blocking", "Regenerate Mana 15%", "All Resistances +25", "Cannot be Frozen", "50% Extra Gold from Monsters", "25% Better Chance of Getting Magic Items"]
  },
  {
    name: "Sanctuary",
    category: "All Shields",
    sockets: 3,
    clvlRequired: 49,
    runes: [{ name: "Ko", level: 18 }, { name: "Ko", level: 18 }, { name: "Mal", level: 23 }],
    stats: ["+20% Faster Hit Recovery", "+20% Faster Block Rate", "20% Increased Chance of Blocking", "+130-160% Enhanced Defense (varies)", "+250 Defense vs. Missile", "+20 To Dexterity", "All Resistances +50-70 (varies)", "Magic Damage Reduced By 7", "Level 12 Slow Missiles (60 Charges)"]
  },
  {
    name: "Silence",
    category: "All Ranged & Melee Weapons",
    sockets: 6,
    clvlRequired: 55,
    runes: [{ name: "Dol", level: 14 }, { name: "Eld", level: 2 }, { name: "Hel", level: 15 }, { name: "Ist", level: 24 }, { name: "Tir", level: 3 }, { name: "Vex", level: 26 }],
    stats: ["+2 to All Skills", "+20% Increased Attack Speed", "+20% Faster Hit Recovery", "+200% Enhanced Damage", "+75% Damage To Undead", "+50 to Attack Rating Against Undead", "11% Mana Stolen Per Hit", "Hit Blinds Target +33", "Hit Causes Monster to Flee 25%", "All Resistances +75", "+2 to Mana After Each Kill", "30% Better Chance of Getting Magic Items", "Requirements -20%"]
  },
  {
    name: "Smoke",
    category: "Body Armor",
    sockets: 2,
    clvlRequired: 37,
    runes: [{ name: "Nef", level: 4 }, { name: "Lum", level: 17 }],
    stats: ["+20% Faster Hit Recovery", "+75% Enhanced Defense", "+280 Defense vs. Missiles", "+10 to Energy", "All Resistances +50", "-1 to Light Radius", "Level 6 Weaken (18 charges)"]
  },
  {
    name: "Splendor",
    category: "All Shields",
    sockets: 2,
    clvlRequired: 37,
    runes: [{ name: "Eth", level: 5 }, { name: "Lum", level: 17 }],
    stats: ["+1 To All Skills", "+10% Faster Cast Rate", "+20% Faster Block Rate", "+60-100% Enhanced Defense (varies)", "+10 To Energy", "Regenerate Mana 15%", "50% Extra Gold From Monsters", "20% Better Chance of Getting Magic Items", "+3 To Light Radius"]
  },
  {
    name: "Stealth",
    category: "Body Armor",
    sockets: 2,
    clvlRequired: 17,
    runes: [{ name: "Tal", level: 7 }, { name: "Eth", level: 5 }],
    stats: ["+25% Faster Run/Walk", "+25% Faster Casting Rate", "+25% Faster Hit Recovery", "+6 to Dexterity", "Regenerate Mana 15%", "+15 Maximum Stamina", "Poison Resist +30%", "Magic Damage Reduced by 3"]
  },
  {
    name: "Steel",
    category: "Swords, Axes, Maces",
    sockets: 2,
    clvlRequired: 13,
    runes: [{ name: "Tir", level: 3 }, { name: "El", level: 1 }],
    stats: ["+25% Increased Attack Speed", "+20% Enhanced Damage", "+3 to Minimum Damage", "+3 to Maximum Damage", "+50 to Attack Rating", "50% Chance of Open Wounds", "+2 to Mana after each Kill", "+1 to Light Radius"]
  },
  {
    name: "Stone",
    category: "Body Armor",
    sockets: 4,
    clvlRequired: 47,
    runes: [{ name: "Shael", level: 13 }, { name: "Um", level: 22 }, { name: "Pul", level: 21 }, { name: "Lum", level: 17 }],
    stats: ["+60% Faster Hit Recovery", "+250-290% Enhanced Defense (varies)", "+300 Defense Vs. Missile", "+16 To Strength", "+16 To Vitality", "+10 To Energy", "All Resistances +15", "Level 16 Molten Boulder (80 Charges)", "Level 16 Clay Golem (16 Charges)"]
  },
  {
    name: "Strength",
    category: "All Melee Weapons",
    sockets: 2,
    clvlRequired: 25,
    runes: [{ name: "Amn", level: 11 }, { name: "Tir", level: 3 }],
    stats: ["+35% Enhanced Damage", "7% Life stolen per hit", "25% Chance of Crushing Blow", "+20 to Strength", "+10 to Vitality", "+2 to Mana after each Kill"]
  },
  {
    name: "Treachery",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 43,
    runes: [{ name: "Shael", level: 13 }, { name: "Thul", level: 10 }, { name: "Lem", level: 20 }],
    stats: ["5% Chance To Cast Level 15 Fade When Struck", "25% Chance To Cast level 15 Venom On Striking", "+2 To Assassin Skills", "+45% Increased Attack Speed", "+20% Faster Hit Recovery", "Cold Resist +30%", "50% Extra Gold From Monsters"]
  },
  {
    name: "Venom",
    category: "All Ranged & Melee Weapons",
    sockets: 3,
    clvlRequired: 49,
    runes: [{ name: "Tal", level: 7 }, { name: "Dol", level: 14 }, { name: "Mal", level: 23 }],
    stats: ["Ignore Target's Defense", "+273 Poison Damage Over 6 Seconds", "7% Mana Stolen Per Hit", "Prevent Monster Heal", "Hit Causes Monster To Flee 25%", "Level 13 Poison Nova (11 Charges)", "Level 15 Poison Explosion (27 Charges)"]
  },
  {
    name: "Wealth",
    category: "Body Armor",
    sockets: 3,
    clvlRequired: 43,
    runes: [{ name: "Lem", level: 20 }, { name: "Ko", level: 18 }, { name: "Tir", level: 3 }],
    stats: ["+10 to Dexterity", "+2 to Mana After Each Kill", "300% Extra Gold From Monsters", "100% Better Chance of Getting Magic Items"]
  },
  {
    name: "White",
    category: "Wands",
    sockets: 2,
    clvlRequired: 35,
    runes: [{ name: "Dol", level: 14 }, { name: "Io", level: 16 }],
    stats: ["+3 to Poison and Bone Skills (Necromancer Only)", "+20% Faster Cast Rate", "+2 to Bone Spear (Necromancer Only)", "+4 to Skeleton Mastery (Necromancer Only)", "+3 to Bone Armor (Necromancer Only)", "Hit causes monster to flee 25%", "+10 to vitality", "+13 to mana", "Magic Damage Reduced by 4"]
  },
  {
    name: "Wind",
    category: "All Melee Weapons",
    sockets: 2,
    clvlRequired: 61,
    runes: [{ name: "Sur", level: 29 }, { name: "El", level: 1 }],
    stats: ["10% Chance To Cast Level 9 Tornado On Striking", "+20% Faster Run/Walk", "+40% Increased Attack Speed", "+15% Faster Hit Recovery", "+120-160% Enhanced Damage (varies)", "-50% Target Defense", "+50 To Attack Rating", "Hit Blinds Target", "+1 To Light Radius", "Level 13 Twister (127 Charges)"]
  },
  {
    name: "Zephyr",
    category: "Bows & Crossbows",
    sockets: 2,
    clvlRequired: 21,
    runes: [{ name: "Ort", level: 9 }, { name: "Eth", level: 5 }],
    stats: ["7% Chance to Cast Level 1 Twister When Struck", "+25% Faster Run/Walk", "+25% Increased Attack Speed", "+33% Enhanced Damage", "-25% Target Defense", "+66 to Attack Rating", "Adds 1-50 lightning damage", "+25 Defense"]
  },
];

module.exports = { RUNEWORDS };