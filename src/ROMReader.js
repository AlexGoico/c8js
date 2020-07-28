function arrBufTo16BitNums(buf) {
  const dv = new DataView(buf);

  // Not a particularly elegant way of parsing out the last
  // trailing opcode that might not have an msb.
  // TODO: Revisit and refactor to make code clearer and less verbose
  let length = dv.byteLength;
  const odd = length % 2 === 1;
  if (odd) {
    length--;
  }

  const twoBytes = [];
  for (let i = 0; i < length; i += 2) {
    twoBytes.push(dv.getUint16(i));
  }

  if (odd) {
    twoBytes.push(dv.getUint8(length));
  }

  return twoBytes;
}

/**
 * This is a container class for holding the interface to accessing
 * a Chip8's ROM data. All data manipulation will be accessed through
 * methods of this class.
 */
class ROM {
  /**
   * @param {string} name The name of the ROM.
   * @param {ArrayBuffer} buffer A ROMs data as an ArrayBuffer.
   */
  constructor(name, buffer) {
    this.name = name;
    this.data = arrBufTo16BitNums(buffer);
    this.length = buffer.byteLength;
  }

  /**
   * Iterates through all the bytes in the rom in big endian order of each
   * of the two-byte opcode objects.
   * @returns {Generator<number|*, void, *>} The byte currently being
   *                                         iterated over.
   */
  * [Symbol.iterator]() {
    for (const twoByte of this.data) {
      const msb = twoByte >> 8;
      const lsb = twoByte & 0xFF;

      yield msb;
      yield lsb;
    }
  }

  /**
   * @returns {string} Returns the rom's two byte data separated by a space.
   */
  toString() {
    return this.data.map((tByte) => `0x${tByte.toString(16)}`).join(' ');
  }

  size() {
    return this.length;
  }
}

/**
 * ROMReaders interface method to kick off reading two byte big endian numbers.
 * @param {File} file The Chip8 ROM file
 * @returns {Promise<ROM>}
 */
async function read(file) {
  const arrBuf = await file.arrayBuffer();
  return new ROM(file.name, arrBuf);
}

export {
  read,
};
