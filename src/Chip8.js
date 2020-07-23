import * as PIXI from "pixi.js";


class Chip8 {
  constructor(container) {
    const screen = new PIXI.Application({
      "width": 500,
      "height": 500
    });
    container.appendChild(screen.view);
  }
}

export default Chip8;
