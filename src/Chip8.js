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
    if (this.start + i > this.arrRef.length) {
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
    this.loopHandle = null;
    this.simHandle = null;
    this.renderer = renderer;

    this.reset();
  }

  /**
   * Resets the state of the Chip8 by changing the I register to 0x200
   * and clearing the memory and registers.
   */
  reset() {
    cancelAnimationFrame(this.loopHandle);
    clearInterval(this.simHandle);
    // 0xF00-0xFFF - Reserved for display
    // 0xEA0-0xEFF - Reserved or stack. Used for return addresses of subroutines
    this.mem = new Array(4096);
    this.registers = new Array(16);
    this.PC = 0x200; // Assume no ROMS intended for a ETI 660 computer
    this.SP = 0xEA0;

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
   * Renders the Chip8's display buffer.
   */
  draw() {
    const view = new ArrayView(this.mem, 0xF00, 256);
    this.renderer.draw(new MatrixView2D(view, 8, 32));
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
      this.draw();
      this.loopHandle = requestAnimationFrame(render);
    };
    this.loopHandle = requestAnimationFrame(render);
    this.simHandle = setInterval(this.simLoop_.bind(this), 1000 / 30);
  }

  /**
   * @async Stops the render and simulation loop
   */
  async stop() {
    cancelAnimationFrame(this.loopHandle);
    clearInterval(this.simHandle);
  }

  /**
   * Move one step into running the Chip8, that is, execute a single opcode.
   * @throws InvalidInstruction Throw when an unimplemented opcode is
   *         encountered.
   */
  step() {
    const opcode = (this.mem[this.PC] << 8) + this.mem[this.PC+1];
    console.log(this.PC);
    console.log(this.mem[this.PC].toString(16));
    console.log(`Executing ${opcode.toString(16)}.`);

    const firstNibble = (opcode >> 12) & 0xF;
    const secondNibble = (opcode >> 8) & 0xF;
    const thirdNibble = (opcode >> 4) & 0xF;
    const fourthNibble = opcode & 0xF;

    if (firstNibble === 2) {
      // Set stack frame to
      this.mem[this.SP] = this.PC & 0xF00;
      this.mem[this.SP+1] = this.PC & 0xFF;
      this.PC = opcode & 0xFFF;
    }
    else if (firstNibble === 6) {
      const num = (thirdNibble << 4) + fourthNibble;
      this.registers[secondNibble] = num;
      this.PC += 2;
    }
    else {
      const code = opcode.toString(16);
      throw new InvalidInstruction(`Opcode ${code} not implemented.`);
    }
  }
}

export default Chip8;
