class Chip8 {
  /**
   * @param {Renderer} renderer Renderer used while running.
   * @see PixiRenderer
   */
  constructor(renderer) {
    this.renderer = renderer;
    this.renderer.init();
  }
}

export default Chip8;
