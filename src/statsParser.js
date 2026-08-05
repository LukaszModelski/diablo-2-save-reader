/**
 * Parser for Attributes & Character Stats ('gf' section)
 */

function parseStats(buf) {
  const gfOffset = 765;
  let attrBits = [];
  for (let i = gfOffset + 2; i < gfOffset + 60; i++) {
    for (let bit = 0; bit < 8; bit++) {
      attrBits.push((buf[i] >> bit) & 1);
    }
  }

  function getAttrBits(start, len) {
    let val = 0;
    for (let i = 0; i < len; i++) {
      val |= (attrBits[start + i] << i);
    }
    return val;
  }

  const strength = getAttrBits(9, 9);
  const dexterity = getAttrBits(27, 9);
  const energy = getAttrBits(67, 9);
  const freeStatPts = getAttrBits(85, 10);
  const freeSkillPts = getAttrBits(104, 8);

  const hpCurrent = (getAttrBits(121, 21) / 256).toFixed(1);
  const hpMax = (getAttrBits(151, 21) / 256).toFixed(1);
  const manaCurrent = (getAttrBits(181, 21) / 256).toFixed(1);
  const manaMax = (getAttrBits(211, 21) / 256).toFixed(1);
  const staminaCurrent = (getAttrBits(241, 21) / 256).toFixed(1);
  const staminaMax = (getAttrBits(271, 21) / 256).toFixed(1);
  const exp = getAttrBits(317, 32);
  const goldInventory = getAttrBits(358, 25);
  const goldStash = getAttrBits(392, 25);

  return {
    strength,
    dexterity,
    energy,
    freeStatPts,
    freeSkillPts,
    hpCurrent,
    hpMax,
    manaCurrent,
    manaMax,
    staminaCurrent,
    staminaMax,
    exp,
    goldInventory,
    goldStash,
    goldTotal: goldInventory + goldStash
  };
}

module.exports = {
  parseStats
};
