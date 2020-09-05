import {sprite} from './constants/Sprites.js';

const FPS = 30;
const MS_PER_FRAME = 1000 / FPS;
const ORDERED_SPRITES_ARRAY = [1, 2, 3, 4, 5, 6, 7, 8, 9,
  'A', 'B', 'C', 'D', 'E', 'F'];

class InvalidInstruction extends Error {
  constructor(message) {
    super(message);
    this.name = `InvalidInstruction`;
  }
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
        `end of array length (${this.arrRef.length} referenced.`);
    }

    return this.arrRef[this.offset + i];
  }
}

class MatrixView2D {
  constructor(arrView, xlen, ylen) {
    this.arrView = arrView;
    this.xlen = xlen;
    this.ylen = ylen;
  }

  get(x, y) {
    return this.arrView.get(x*this.ylen + y);
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

    this.renderer.init();
  }

  /**
   * Sets memory address to value
   * @param {Hex} startAddress initial memory address to start populating values
   * @param {Int} iteration counter holder
   * @param {Int} setValue assigned value of memory address
   * @returns {Int} this.mem resulting value assigned to memory address
   */
  loadIntoMemory(startAddress, iteration, setValue) {
    const memAddress = startAddress + iteration;
    this.mem[memAddress]= setValue;
    return this.mem[memAddress];
  }

  /**
   * Loads the ROM into the chip8's memory space in 0x000 0x1FF.
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
  * Loads the sprites into the chip8's memory.
  * @param {array} orderedSprites containing the order of sprites to be loaded into memory to avoid having to sort the hashmap containing sprite hexcodes.1
  * @param {hashmap} spriteHashmap sprite hashmap object containing standard hashmap functionality.
  */
  loadSprites(orderedSprites, spriteHashmap) {
    let iter = 0x000;
    for (let i = 0; i < spriteHashmap.size; i++) {
      const spriteHexValue = spriteHashmap.get(orderedSprites[i]);
      loadIntoMemory(iter, i, spriteHexValue);
      this.mem[iter++] = spriteHashmap.get(orderedSprites[i]) >> 8;
      this.mem[iter++] = spriteHashmap.get(orderedSprites[i]) & 0xFF;
    };
  };

  /**
   * Renders the Chip8's display buffer.
   */
  render() {
    const view = new ArrayView(this.mem, 0xF00, 256);
    this.renderer.draw(new MatrixView2D(view, 8, 32));
  }

  /**
   * Draws sprite to display memory by xoring sprite bytes to display
   * bytes in memory. If any bits are flipped VF register is set to 1
   * otherwise 0.
   * @param {int} x The x coordinate from the beginning of memory where drawing
   *                will begin
   * @param {int} y The x coordinate from the beginning of memory where drawing
   *                will begin
   * @param {int} h How much of the height of the sprite will be utilized for
   *                this drawing
   */
  draw(x, y, h) {
    const view = new ArrayView(this.mem, 0xF00, 0xF00 + 8*h);
    const buffer = new MatrixView2D(view, 8, h);

    let collided = false;
    for (let i = x; i < buffer.xlen; i++) {
      for (let j = y; j < buffer.ylen; j++) {
        const eightPixels = buffer.get(i, j);
        const spriteByte = this.mem[this.I + i*buffer.ylen + j];
        this.mem[this.I + i*buffer.ylen + j] = eightPixels ^ spriteByte;

        collided =
          collided ||
          (eightPixels & this.mem[this.I + i*buffer.ylen + j]) !== 0;
      }
    }
    this.registers[0xF] = collided ? 1 : 0;
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
      default:
        const code = opcode.toString(16);
        throw new InvalidInstruction(`Opcode ${code} not implemented.`);
    }

    this.PC += 2;
  }
}

export default Chip8;
