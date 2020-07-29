import Chip8 from '../src/Chip8.js';

const noop = () => {};

const FakeRenderer = jest.fn().mockImplementation(function() {
  return {'init': noop};
});

const FakeROM = jest.fn().mockImplementation(function() {
  const o = {};
  o[Symbol.iterator] = function* () {
    yield 0x2008;
  };
  return o;
});

describe('Chip8 Suite', function c8Suite() {
  test('smoke test', function smokeTest() {
    expect(2).toEqual(1+1);
  });

  describe.only('opcode tests', function opcodeSuite() {
    test('callAddr2NNN', function callAddrTest() {
      FakeRenderer.mockClear();
      const c8 = new Chip8(new FakeRenderer());

      c8.loadROM(new FakeROM());

      c8.step();
      expect(c8.PC).toEqual(0x8);
      expect(c8.mem[c8.SP]).toEqual(0x200);
      expect(c8.mem[c8.SP+1]).toEqual(0);
      expect(c8.mem[c8.SP+2]).toBeNil();
    });
  });
});
