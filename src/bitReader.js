/**
 * Utility function for reading unaligned bit sequences from a Buffer
 */

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

module.exports = {
  getBits
};
