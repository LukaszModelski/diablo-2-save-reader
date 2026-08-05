/**
 * Parser for Skill Trees & Invested Skill Points ('if' section)
 */

const { CLASS_SKILLS } = require('./constants');

function parseSkills(buf, classId) {
  const ifOffset = 821;
  const skillBytes = buf.subarray(ifOffset + 2, ifOffset + 32);
  const skillList = CLASS_SKILLS[classId] || [];

  let pointsSpent = 0;
  let allocatedSkills = [];

  skillList.forEach((sk, idx) => {
    const lvl = skillBytes[idx] || 0;
    pointsSpent += lvl;
    if (lvl > 0) {
      allocatedSkills.push({
        name: sk.name,
        tree: sk.tree,
        level: lvl
      });
    }
  });

  return {
    pointsSpent,
    allocatedSkills
  };
}

module.exports = {
  parseSkills
};
