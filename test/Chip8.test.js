import Chip8 from '../src/Chip8.js';

const noop = () => {};
console.log = noop;

const FakeRenderer = jest.fn().mockImplementation(function() {
  return {
    'init': noop,
    'draw': noop,
    'render': noop,
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
    c8.step = noop;
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
    test('1NNN - jmpAddr', function jmpAddrTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM([0x12, 0x08]));
      c8.step();

      expect(c8.PC).toEqual(0x208);
    });

    test('2NNN - callAddr', function callAddrTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM([0x20, 0x08]));
      c8.step();

      expect(c8.PC).toEqual(0x008);
      expect(c8.mem[c8.SP]).toEqual(0x200);
      expect(c8.mem[c8.SP+1]).toEqual(0);
      expect(c8.mem[c8.SP+2]).toEqual(0);
    });

    test('3XNN - ifRegXEqNum', function ifRegXEqNum() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM([0x30, 0x00, 0x00, 0x00, 0x30, 0x01]));
      c8.step();

      expect(c8.PC).toEqual(0x204);

      c8.step();
      expect(c8.PC).toEqual(0x206);
    });

    test('6XNN - setRegToNum', function setRegToNumTest() {
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

    test('DXYN - disp', function dispDrawTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM([
        0x6a, 0x00,
        0x6B, 0x00,
        0xA0, 0x00,
        0xDA, 0xB5,
      ]);

      for (let i = 0; i < 4; i++) {
        c8.step();
      }

      expect(c8.registers[0xA]).toEqual(0x0);
      expect(c8.registers[0xB]).toEqual(0x0);
      expect(c8.I).toEqual(0x0);
      expect(c8.mem[0]).toEqual(0xF0);
      expect(c8.mem[0xF00]).toEqual(0xF0);
      expect(c8.mem[0xF08]).toEqual(0x90);
      expect(c8.mem[0xF00+32]).toEqual(0xF0);
    });

    test('FX33 - setIToVxBCD', function setIToVxBCDTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.registers[0x0] = 256;
      c8.I = 0x500;

      c8.loadROM(getFakeROM([0xF0, 0x33]));
      c8.step();

      expect(c8.mem[c8.I]).toEqual(2);
      expect(c8.mem[c8.I+1]).toEqual(5);
      expect(c8.mem[c8.I+2]).toEqual(6);
    });

    test('Throws InvalidException on invalid opcodes',
      function invalidOpcodeTest() {
        let c8 = new Chip8(new FakeRenderer());
        c8.loadROM(getFakeROM([0xFF, 0x0A]));
        expect(c8.step.bind(c8)).toThrow('Opcode ff0a not implemented');

        c8 = new Chip8(new FakeRenderer());
        c8.loadROM(getFakeROM([-1, 0x00]));
        expect(c8.step.bind(c8)).toThrow('Opcode -100 not implemented');
      });
  });
});
