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
}

export default PixiRenderer;
