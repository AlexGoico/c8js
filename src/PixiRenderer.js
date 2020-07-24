import * as PIXI from "pixi.js";

class PixiRenderer {
  constructor(containerElement, width, height) {
    this.app = new PIXI.Application({
      "width": width,
      "height": height
    });

    this.container = containerElement;
  }

  init() {
    this.container.appendChild(this.app.view);
  }
}

export default PixiRenderer;