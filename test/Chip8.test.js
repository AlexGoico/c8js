import Chip8 from '../src/Chip8.js';

const noop = () => {};
console.log = noop;

const PONG = [0x6a, 0x02, 0x6b, 0x0c, 0x6c, 0x3f, 0x6d,
  0x0c, 0xa2, 0xea, 0xda, 0xb6, 0xdc, 0xd6,
  0x6e, 0x00, 0x22, 0xd4, 0x66, 0x03, 0x68,
  0x02, 0x60, 0x60, 0xf0, 0x15, 0xf0, 0x07,
  0x30, 0x00, 0x12, 0x1a, 0xc7, 0x17, 0x77,
  0x08, 0x69, 0xff, 0xa2, 0xf0, 0xd6, 0x71,
  0xa2, 0xea, 0xda, 0xb6, 0xdc, 0xd6, 0x60,
  0x01, 0xe0, 0xa1, 0x7b, 0xfe, 0x60, 0x04,
  0xe0, 0xa1, 0x7b, 0x02, 0x60, 0x1f, 0x8b,
  0x02, 0xda, 0xb6, 0x60, 0x0c, 0xe0, 0xa1,
  0x7d, 0xfe, 0x60, 0x0d, 0xe0, 0xa1, 0x7d,
  0x02, 0x60, 0x1f, 0x8d, 0x02, 0xdc, 0xd6,
  0xa2, 0xf0, 0xd6, 0x71, 0x86, 0x84, 0x87,
  0x94, 0x60, 0x3f, 0x86, 0x02, 0x61, 0x1f,
  0x87, 0x12, 0x46, 0x02, 0x12, 0x78, 0x46,
  0x3f, 0x12, 0x82, 0x47, 0x1f, 0x69, 0xff,
  0x47, 0x00, 0x69, 0x01, 0xd6, 0x71, 0x12,
  0x2a, 0x68, 0x02, 0x63, 0x01, 0x80, 0x70,
  0x80, 0xb5, 0x12, 0x8a, 0x68, 0xfe, 0x63,
  0x0a, 0x80, 0x70, 0x80, 0xd5, 0x3f, 0x01,
  0x12, 0xa2, 0x61, 0x02, 0x80, 0x15, 0x3f,
  0x01, 0x12, 0xba, 0x80, 0x15, 0x3f, 0x01,
  0x12, 0xc8, 0x80, 0x15, 0x3f, 0x01, 0x12,
  0xc2, 0x60, 0x20, 0xf0, 0x18, 0x22, 0xd4,
  0x8e, 0x34, 0x22, 0xd4, 0x66, 0x3e, 0x33,
  0x01, 0x66, 0x03, 0x68, 0xfe, 0x33, 0x01,
  0x68, 0x02, 0x12, 0x16, 0x79, 0xff, 0x49,
  0xfe, 0x69, 0xff, 0x12, 0xc8, 0x79, 0x01,
  0x49, 0x02, 0x69, 0x01, 0x60, 0x04, 0xf0,
  0x18, 0x76, 0x01, 0x46, 0x40, 0x76, 0xfe,
  0x12, 0x6c, 0xa2, 0xf2, 0xfe, 0x33, 0xf2,
  0x65, 0xf1, 0x29, 0x64, 0x14, 0x65, 0x00,
  0xd4, 0x55, 0x74, 0x15, 0xf2, 0x29, 0xd4,
  0x55, 0xee, 0x80, 0x80, 0x80, 0x80, 0x80,
  0x80, 0x80, 0x00, 0x0, 0x0];

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

    test.skip('DXYN - disp', function dispDrawTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM(PONG));

      for (let i = 0; i < 5; i++) {
        c8.step();
      }
      c8.step();

      expect(c8.I).toEqual(0x2EA);
      console.log(c8.mem[c8.I].toString(2));
      expect(c8.registers[0xA]).toEqual(0x02);
      expect(c8.registers[0xB]).toEqual(0x0C);
      expect(c8.mem[0xF11]).toEqual(0x10);
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
