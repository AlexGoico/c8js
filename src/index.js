import Chip8 from "./Chip8";
import PixiRenderer from "./PixiRenderer";

function main() {
  // Reset rom selection each time page loads.
  const rom_selector = document.getElementsByTagName("input")[0];
  rom_selector.value = "";

  const container = document.getElementById("emulator");
  const renderer = new PixiRenderer(container, 500, 500);

  new Chip8(renderer);
}

window.addEventListener("load", main);
