import * as PIXI from 'pixi.js';

class PixiRenderer {
  /**
   * @param {Node} containerElement The element that will hold
   *                                the canvas/webgl screen
   * @param {num} width The width of the canvas/webgl screen
   * @param {num} height The height of the canvas/webgl screen
   */
  constructor(containerElement, width, height) {
    this.app = new PIXI.Application({
      'width': width,
      'height': height,
    });
    this.pixels = new PIXI.Container();
    this.app.stage.addChild(this.pixels);

    this.container = containerElement;
  }

  /**
   * The initialize method to the renderer interface which
   * will initially setup/reset the state of the renderer
   * that must be called before drawing.
   */
  init() {
    this.container.appendChild(this.app.view);
  }

  /**
   * Renders a view of bytes x rows where each byte represents 8 pixels.
   * @param {MatrixView2D} buffer A 2d array view of bytes x rows.
   */
  draw(buffer) {
    this.pixels.removeChildren();

    const blkRect = new PIXI.Graphics();
    const whiteRect = new PIXI.Graphics();

    // this assumption should be designed better than a magic number
    const pixWidth = this.app.width / (buffer.xlen * 8);
    const pixHeight = this.app.height / buffer.ylen;

    blkRect.beginFill(0x000000);
    whiteRect.beginFill(0xFFFFFF);
    for (let x = 0; x < buffer.xlen; x++) {
      for (let y = 0; y < buffer.ylen; y++) {
        const eightPixels = buffer.get(x, y);
        for (let i = 0; i < 8; i++) {
          const leftPixel = (eightPixels << i) & 0b10000000;
          const rect = leftPixel ? whiteRect : blkRect;
          rect.drawRect(x * pixWidth, y * pixHeight, pixWidth, pixHeight);
        }
      }
    }
    whiteRect.endFill();
    blkRect.endFill();

    this.pixels.addChild(whiteRect);
    this.pixels.addChild(blkRect);
  }
}

export default PixiRenderer;
