import Chip8 from './Chip8';
import PixiRenderer from './PixiRenderer';
import * as ROMReader from './ROMReader';

class AppDriver {
  static setupROMSelector() {
    // Reset rom selection each time page loads.
    const romSelector = document.getElementsByTagName('input')[0];
    if (romSelector) {
      romSelector.value = '';

      romSelector.addEventListener('change',
        function handleROMSelection(event) {
          const romFile = event.target.files[0];
          if (romFile) {
            ROMReader.read(romFile).then((rom) => {
              const romData = rom.toString();
              console.log(`${rom.name}'s Opcodes`);
              console.log(romData);

              AppDriver.c8.loadROM(rom);
              let memROMData = [];
              for (let i = 0; i < rom.size(); i += 2) {
                const msByte = AppDriver.c8.mem[0x200+i] << 8;
                const lsByte = AppDriver.c8.mem[0x200+i+1];

                const twoByte = msByte + lsByte;
                memROMData.push(twoByte.toString(16));
              }
              memROMData = memROMData.map((byte) => `0x${byte}`).join(' ');
              console.assert(memROMData === romData,
                `ROM not correctly loaded into Chip8 memory`);

              AppDriver.c8.start();
              setTimeout(() => AppDriver.c8.stop(), 3000);
            });
          }
        });
    }
    else {
      console.error('Unable to find file selector field');
    }
  }

  static main() {
    AppDriver.setupROMSelector();

    const container = document.getElementById('emulator');
    const renderer = new PixiRenderer(container, 640, 320);

    AppDriver.c8 = new Chip8(renderer);
    AppDriver.c8.mem[0xF00] = 0xAA;
    AppDriver.c8.mem[0xFCA] = 0xAA;
    AppDriver.c8.mem[0xFFF] = 0xAA;
    AppDriver.c8.draw();
  }
}

AppDriver.c8 = null;

window.addEventListener('load', AppDriver.main);
