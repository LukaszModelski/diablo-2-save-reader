/**
 * Parser for D2S File Header & Basic Character Details
 */

const { CLASSES } = require('./constants');

function parseHeader(buf) {
  const magic = buf.readUInt32LE(0).toString(16);
  if (magic.toLowerCase() !== 'aa55aa55') {
    throw new Error(`Invalid file magic: 0x${magic} (Expected 0xAA55AA55)`);
  }

  const version = buf.readUInt32LE(4);
  const nameBuf = buf.subarray(0x14, 0x24);
  let name = '';
  for (let b of nameBuf) {
    if (b === 0) break;
    name += String.fromCharCode(b);
  }

  const status = buf[0x24];
  const isHardcore = Boolean(status & 0x04);
  const hasDied = Boolean(status & 0x08);
  const isExpansion = Boolean(status & 0x20);

  const progression = buf[0x25];
  const classId = buf[0x28];
  const className = CLASSES[classId] || `Class ${classId}`;
  const level = buf[0x2B];
  const lastPlayedSec = buf.readUInt32LE(0x30);
  const lastPlayedDate = new Date(lastPlayedSec * 1000).toLocaleString();

  let title = 'None';
  if (progression >= 7) title = 'Matriarch / Patriarch';
  else if (progression >= 5) title = 'Champion';
  else if (progression >= 3) title = 'Slayer';

  return {
    magic,
    version,
    name,
    classId,
    className,
    level,
    title,
    isHardcore,
    hasDied,
    isExpansion,
    lastPlayedDate
  };
}

module.exports = {
  parseHeader
};
