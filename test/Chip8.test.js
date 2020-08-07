import Chip8 from '../src/Chip8.js';

const noop = () => {};

const FakeRenderer = jest.fn().mockImplementation(function() {
  return {
    'init': noop,
    'draw': noop,
  };
});

function getFakeROM(codes) {
  if (!(codes instanceof Array)) {
    codes = [codes];
  }

  const rom = {};
  rom[Symbol.iterator] = function* () {
    for (const code of codes) {
      yield code;
    }
  };
  return rom;
}

describe('Chip8 Suite', function c8Suite() {
  beforeEach(function() {
    FakeRenderer.mockClear();
  });

  test('smoke test', function smokeTest() {
    expect(2).toEqual(1+1);
  });

  function delay(func, t) {
    return new Promise((resolve) => {
      setTimeout(function() {
        resolve(func());
      }, t);
    });
  }

  test(`can stop sim loop`, function stop() {
    const c8 = new Chip8(new FakeRenderer());
    return c8.start()
      .then(function() {
        expect(c8.renderLoopHandle).not.toBeNil();
        expect(c8.simLogicHandle).not.toBeNil();
      })
      .then(delay.bind(null, c8.stop.bind(c8), 2000))
      .then(delay.bind(null, function() {
        expect(c8.renderLoopHandle).toBeNil();
        expect(c8.simLogicHandle).toBeNil();
      }, 2000));
  });

  describe('opcode tests', function opcodeSuite() {
    test('2NNN - callAddr', function callAddrTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM([0x20, 0x08]));
      c8.step();

      expect(c8.PC).toEqual(0x008);
      expect(c8.mem[c8.SP]).toEqual(0x200);
      expect(c8.mem[c8.SP+1]).toEqual(0);
      expect(c8.mem[c8.SP+2]).toEqual(0);
    });

    test('6XKNN - setRegToNum', function setRegToNumTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM([0x62, 0x0A]));
      c8.step();

      expect(c8.registers[0x2]).toEqual(0x0A);
    });

    test('7XNN - addByteToReg', function addByteToRegTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.registers[0x1] = 1;
      c8.loadROM(getFakeROM([0x70, 0x0A, 0x71, 0xFF]));
      c8.step();

      expect(c8.registers[0x0]).toEqual(0x0A);

      c8.step();
      expect(c8.registers[0x1]).toEqual(0);
      expect(c8.registers[0xF]).toEqual(0);
    });

    test('ANNN - setIToAddr', function setIToAddrTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM([0xA2, 0x56]));
      c8.step();

      expect(c8.I).toEqual(0x256);
    });

    test('Throws InvalidException on invalid opcodes',
      function invalidOpcodeTest() {
        let c8 = new Chip8(new FakeRenderer());
        c8.loadROM(getFakeROM([0xFFF, 0x0A]));
        expect(c8.step.bind(c8)).toThrow('Opcode fff0a not implemented');

        c8 = new Chip8(new FakeRenderer());
        c8.loadROM(getFakeROM([-1, 0x00]));
        expect(c8.step.bind(c8)).toThrow('Opcode -100 not implemented');
      });
  });
});
