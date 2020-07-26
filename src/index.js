import Chip8 from './Chip8';
import PixiRenderer from './PixiRenderer';
import * as ROMReader from './ROMReader';

function setupROMSelector() {
  // Reset rom selection each time page loads.
  const romSelector = document.getElementsByTagName('input')[0];
  if (romSelector) {
    romSelector.value = '';

    romSelector.addEventListener('change', function handleROMSelection(event) {
      const romFile = event.target.files[0];
      if (romFile) {
        ROMReader.read(romFile).then((rom) => {
          console.log('Sequence of two byte instructions');
          console.log(rom.toString());
        });
      }
    });
  } else {
    console.error('Unable to find file selector field');
  }
}

function main() {
  setupROMSelector();

  const container = document.getElementById('emulator');
  const renderer = new PixiRenderer(container, 500, 500);

  new Chip8(renderer);
}

window.addEventListener('load', main);
