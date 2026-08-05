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

console.log(`Inspecting bitfields for ${itemCount} items:\n`);

let currOffset = jmPos + 4;

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

  // Read bit fields around 16 to 35
  const b16_18 = getBits(buf, startBit + 16, 3);
  const b19_21 = getBits(buf, startBit + 19, 3);
  const b22_25 = getBits(buf, startBit + 22, 4);
  const b26_29 = getBits(buf, startBit + 26, 4);

  // Also test bit 16..18 as location
  const locCandidateA = getBits(buf, startBit + 16, 3);
  const locCandidateB = getBits(buf, startBit + 19, 3);
  const locCandidateC = getBits(buf, startBit + 22, 3);

  console.log(`Item ${(i + 1).toString().padStart(2)}: Code='${code.padEnd(4)}' | b16-18=${b16_18} | b19-21=${b19_21} | b22-25=${b22_25} | b26-29=${b26_29}`);

  if (nextJm !== -1) currOffset = nextJm;
  else break;
}
