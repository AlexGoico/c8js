import Chip8 from "./Chip8";
import PixiRenderer from "./PixiRenderer";
import ROMReader from "./ROMReader";

function setupROMSelector() {
  // Reset rom selection each time page loads.
  const rom_selector = document.getElementsByTagName("input")[0];
  if (rom_selector) {
    rom_selector.value = "";

    rom_selector.addEventListener("change", function handleROMSelection() {
      const rom_file = this.files[0];
      if (rom_file) {
        ROMReader.read(rom_file).then(rom => {
          console.log("Sequence of two byte instructions");
          console.log(rom.toString())
        });
      }
    });
  }
  else {
    console.error("Unable to find file selector field");
  }
}

function main() {
  setupROMSelector();

  const container = document.getElementById("emulator");
  const renderer = new PixiRenderer(container, 500, 500);

  new Chip8(renderer);
}

window.addEventListener("load", main);
