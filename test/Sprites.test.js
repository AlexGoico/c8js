import {sprite} from '../src/constants/Sprites.js';

describe('Constants - Sprites', function Sprites() {
  test('sprite constant size to equal 16 sprites', function() {
    expect(sprite.size).toEqual(16);
  });

  test('character 0 sprite matches hexademical', function() {
    const zeroHex = '0xF0, 0x90, 0x90, 0x90, 0xF0';
    expect(sprite.get(0)).toEqual(zeroHex);
  });

  test('character F sprite matches hexademical', function() {
    const fHex = '0xF0, 0x80, 0xF0, 0x80, 0x80';
    expect(sprite.get('F')).toEqual(fHex);
  });
});
