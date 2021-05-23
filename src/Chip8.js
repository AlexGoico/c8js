import sprites from './Sprites';

const FPS = 30;
const MS_PER_FRAME = 1000 / FPS;

class InvalidInstruction extends Error {
  constructor(message) {
    super(message);
    this.name = `InvalidInstruction`;
  }
}
/*
 * Filler method for quickly stubbing unimplemented opcodes
 */
function throwNotImplemented(opcode) {
  const code = opcode.toString(16);
  throw new InvalidInstruction(`Opcode ${code} not implemented.`);
}

function checkOffsetRange_(arr, start, len) {
  if (start > arr.length) {
    throw new Error(`View begins (${start}) past the ` +
      `length (${arr.length}) of the array.`);
  }
  else if (start + len > arr.length) {
    throw new Error(`Array length is ${arr.length} but view range ` +
      `extends ${start + len - arr.length} beyond that.`);
  }
}

class ArrayView {
  constructor(arrRef, start, len) {
    checkOffsetRange_(arrRef, start);

    this.arrRef = arrRef;
    this.offset = start;
    this.len = len;
  }

  get(i) {
    if (this.offset + i >= this.arrRef.length) {
      throw new Error(`Cannot index (${this.start + i}) past ` +
        `end of array length (${this.arrRef.length} referenced).`);
    }

    return this.arrRef[this.offset + i];
  }

  set(i, val) {
    if (this.offset + i >= this.arrRef.length) {
      throw new Error(`Cannot index (${this.start + i}) past ` +
          `end of array length (${this.arrRef.length} referenced.`);
    }

    this.arrRef[this.offset + i] = val;
  }
}

class Chip8 {
  /**
   * @param {Renderer} renderer Renderer used while running.
   * @see PixiRenderer
   */
  constructor(renderer) {
    this.renderLoopHandle = null;
    this.simLogicHandle = null;
    this.renderer = renderer;

    this.reset();
  }

  /**
   * Resets the state of the Chip8 by changing the I register to 0x200
   * and clearing the memory and registers.
   */
  reset() {
    cancelAnimationFrame(this.renderLoopHandle);
    clearInterval(this.simLogicHandle);
    // 0xF00-0xFFF - Reserved for display
    // 0xEA0-0xEFF - Reserved or stack. Used for return addresses of subroutines
    this.mem = new Array(4096).fill(0);
    this.registers = new Array(16).fill(0);
    this.PC = 0x200; // Assume no ROMS intended for a ETI 660 computer
    this.SP = 0xEA0;
    this.I = undefined;

    this.loadSprites();

    this.renderer.init();
  }

  /**
   * Loads the ROM into the chip8's memory.
   * @param {ROM} rom ROM object that has an iterator across it's bytes
   */
  loadROM(rom) {
    this.PC = 0x200;

    let i = 0;
    for (const byte of rom) {
      this.mem[this.PC + i++] = byte;
    }
  }

  /**
   * Loads sprites into memory from 0x0000 to 0x0200
   */
  loadSprites() {
    let iter = 0x0000;

    for (const sprite of sprites) {
      for (const byte of sprite) {
        this.mem[iter++] = byte;
      }
    }
  }

  /**
   * Renders the Chip8's display buffer.
   */
  render() {
    const view = new ArrayView(this.mem, 0xF00, 256);
    this.renderer.draw(view);
  }

  /**
   * Draws sprite to display memory by xoring sprite bytes to display
   * bytes in memory. If any bits are flipped VF register is set to 1
   * otherwise 0.
   * @param {int} x The x coordinate from the beginning of memory where drawing
   *                will begin
   * @param {int} y The y coordinate from the beginning of memory where drawing
   *                will begin
   * @param {int} h How much of the height of the sprite will be utilized for
   *                this drawing
   */
  draw(x, y, h) {
    const view = new ArrayView(this.mem, 0xF00, 0xF00 + 256);

    this.registers[0xF] = 0;
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < 8; j++) {
        const spriteBitmask = 0x1 << (7-j);
        const spriteBit = (this.mem[this.I+i] & spriteBitmask) >> (7-j);

        let screenBit = x + (y+i)*64 + j;
        const screenByte = Math.floor(screenBit / 8);
        const screenBitOffset = screenBit % 8;
        screenBit = (view.get(screenByte) >> (7-screenBitOffset)) & 0x1;
        this.registers[0xF] |= (screenBit === 0x1) & (spriteBit === 0x1);
        view.set(screenByte,
          view.get(screenByte) ^ (spriteBit << (7-screenBitOffset)));
      }
    }
  }

  /**
   * @private
   */
  simLoop_() {
    try {
      this.step();
    }
    catch (err) {
      this.stop();
      console.error(err.message);
      console.trace();
    }
  }

  /**
   * @async Starts the render and simulation loop
   */
  async start() {
    const render = () => {
      this.render();
      this.renderLoopHandle = requestAnimationFrame(render);
    };
    this.renderLoopHandle = requestAnimationFrame(render);
    this.simLogicHandle = setInterval(this.simLoop_.bind(this), MS_PER_FRAME);
  }

  /**
   * @async Stops the render and simulation loop
   */
  async stop() {
    cancelAnimationFrame(this.renderLoopHandle);
    clearInterval(this.simLogicHandle);

    // clear handles
    this.renderLoopHandle = null;
    this.simLogicHandle = null;
  }


  /**
   * Move one step into running the Chip8, that is, execute a single opcode.
   * @throws InvalidInstruction Throw when an unimplemented opcode is
   *         encountered.
   */
  step() {
    const opcode = (this.mem[this.PC] << 8) + this.mem[this.PC + 1];
    console.log(`Executing ${opcode.toString(16)}.`);

    const firstNibble = (opcode >> 12) & 0xF;
    const secondNibble = (opcode >> 8) & 0xF;
    const thirdNibble = (opcode >> 4) & 0xF;
    const fourthNibble = opcode & 0xF;

    switch (firstNibble) {
      case 1: {
        const addr = (secondNibble << 8) + (thirdNibble << 4) + fourthNibble;
        this.PC = addr;
        return;
      }
      case 2: {
        // Set stack frame to
        this.mem[this.SP] = this.PC & 0xF00;
        this.mem[this.SP + 1] = this.PC & 0xFF;
        this.PC = opcode & 0xFFF;
        return;
      }
      case 3: {
        const num = (thirdNibble << 4) + fourthNibble;
        if (this.registers[secondNibble] === num) {
          this.PC += 2;
        }
      } break;
      case 6: {
        const num = (thirdNibble << 4) + fourthNibble;
        this.registers[secondNibble] = num;
      } break;
      case 7: {
        const num = (thirdNibble << 4) + fourthNibble;
        this.registers[secondNibble] += num;
        this.registers[secondNibble] &= 0xFF;
      } break;
      case 0xA: {
        const addr = (secondNibble << 8) + (thirdNibble << 4) + fourthNibble;
        this.I = addr;
      } break;
      case 0xD: {
        const x = this.registers[secondNibble];
        const y = this.registers[thirdNibble];
        const h = fourthNibble;

        this.draw(x, y, h);
      } break;
      case 0xF: {
        switch (thirdNibble) {
          case 1: throwNotImplemented(opcode); break;
          case 2: {
            this.I = this.registers[secondNibble]*5;
          } break;
          case 3: {
            let vx = this.registers[secondNibble];

            for (let i = 2; i >= 0; i--, vx /= 10) {
              this.mem[this.I+i] = Math.floor(vx % 10);
            }
          } break;
          case 5: throwNotImplemented(opcode); break;
          case 6: {
            for (let i = 0; i < secondNibble; i++) {
              this.registers[i] = this.mem[this.I+i];
            }
          } break;
          default: throwNotImplemented(opcode);
        }
      } break;
      default: throwNotImplemented(opcode);
    }

    this.PC += 2;
  }
}

export default Chip8;
