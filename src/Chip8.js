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
    this.I = 0x200; // Assume no ROMS intended for a ETI 660 computer

    this.renderer.init();
  }

  /**
   * Loads the ROM into the chip8's memory.
   * @param {ROM} rom ROM object that has an iterator across it's bytes
   */
  loadROM(rom) {
    this.I = 0x200;

    let i = 0;
    for (const byte of rom) {
      this.mem[this.I + i++] = byte;
    }
  }
}

export default Chip8;
