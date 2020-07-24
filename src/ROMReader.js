class ROM {
  constructor(two_byte_arr) {
    this.rom = two_byte_arr;
  }

  toString() {
    return this.rom.map(byte => byte.toString(16)).join(" ");
  }
}

function arrBufTo16BitNums(buf) {
  const dv = new DataView(buf);

  const two_bytes = [];
  for (let i = 0; i < buf.byteLength; i += 16) {
    two_bytes.push(dv.getUint16(i));
  }
  return two_bytes;
}

async function read(file) {
  const arrBuf = await file.arrayBuffer();
  return new ROM(arrBufTo16BitNums(arrBuf));
}

export default { read };