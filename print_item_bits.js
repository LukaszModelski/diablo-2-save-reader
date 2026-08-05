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

const jmPos = 853;
const itemCount = buf.readUInt16LE(jmPos + 2);

let currOffset = jmPos + 4;

for (let i = 0; i < itemCount; i++) {
  if (buf[currOffset] !== 0x4A || buf[currOffset + 1] !== 0x4D) break;

  const nextJm = buf.indexOf(Buffer.from([0x4A, 0x4D]), currOffset + 2);
  const startBit = (currOffset + 2) * 8;

  let code = '';
  for (let c = 0; c < 4; c++) {
    const charCode = getBits(buf, startBit + 60 + (c * 8), 8);
    if (charCode >= 32 && charCode <= 126) code += String.fromCharCode(charCode);
  }
  code = code.trim();

  // Print bits 0 to 60
  let bitsStr = '';
  for (let b = 0; b < 60; b++) {
    bitsStr += getBits(buf, startBit + b, 1).toString();
  }

  console.log(`Item ${(i + 1).toString().padStart(2)}: Code='${code.padEnd(4)}' | bits 0-59: ${bitsStr}`);

  if (nextJm !== -1) currOffset = nextJm;
  else break;
}
