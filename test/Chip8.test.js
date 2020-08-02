import Chip8 from '../src/Chip8.js';

const noop = () => {};

const FakeRenderer = jest.fn().mockImplementation(function() {
  return {'init': noop};
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
  test('smoke test', function smokeTest() {
    expect(2).toEqual(1+1);
  });

  describe('opcode tests', function opcodeSuite() {
    beforeEach(function() {
      FakeRenderer.mockClear();
    });

    test('2NNN - callAddr', function callAddrTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM([0x20, 0x08]));
      c8.step();

      expect(c8.PC).toEqual(0x008);
      expect(c8.mem[c8.SP]).toEqual(0x200);
      expect(c8.mem[c8.SP+1]).toEqual(0);
      expect(c8.mem[c8.SP+2]).toBeNil();
    });

    test('6XKNN - setRegToNum', function setRegToNumTest() {
      const c8 = new Chip8(new FakeRenderer());
      c8.loadROM(getFakeROM([0x62, 0x0A]));
      c8.step();

      expect(c8.registers[0x2]).toEqual(0x0A);
    });
  });
});
