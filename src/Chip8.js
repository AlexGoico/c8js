class Chip8 {
  /**
   * @param {Renderer} renderer Renderer used while running.
   * @see PixiRenderer
   */
  constructor(renderer) {
    this.renderer = renderer;
    this.reset();
  }

  /**
   * Resets the state of the Chip8 by changing the I register to 0x200
   * and clearing the memory and registers.
   */
  reset() {
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
   * Move one step into running the Chip8, that is, execute a single opcode.
   */
  step() {
    const opcode = this.mem[this.PC] << 8 + this.mem[this.PC+1];
    const firstNibble = (opcode >> 12) & 0xF;

    if (firstNibble === 2) {
      // Set stack frame to
      this.mem[this.SP] = this.PC & 0xF00;
      this.mem[this.SP+1] = this.PC & 0xFF;
      this.PC = opcode & 0xFFF;
    }
  }
}

export default Chip8;
