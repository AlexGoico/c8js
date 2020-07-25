/**
 * This is a container class for holding the interface to accessing
 * a Chip8's ROM data. All data manipulation will be accessed through
 * methods of this class.
 */
class ROM {
  /**
   * @param {num[]} twoByteArr A ROMs data as two bytes.
   */
  constructor(twoByteArr) {
    this.data = twoByteArr;
  }

  /**
   * @returns {string} Returns the rom's two byte data separated by a space.
   */
  toString() {
    return this.data.map((byte) => byte.toString(16)).join(' ');
  }
}

function arrBufTo16BitNums(buf) {
  const dv = new DataView(buf);

  const twoBytes = [];
  for (let i = 0; i < buf.byteLength; i += 16) {
    twoBytes.push(dv.getUint16(i));
  }
  return twoBytes;
}

/**
 * ROMReaders interface method to kick off reading two byte big endian numbers.
 * @param {File} file The Chip8 ROM file
 * @returns {Promise<ROM>}
 */
async function read(file) {
  const arrBuf = await file.arrayBuffer();
  return new ROM(arrBufTo16BitNums(arrBuf));
}

export {
  read,
};
