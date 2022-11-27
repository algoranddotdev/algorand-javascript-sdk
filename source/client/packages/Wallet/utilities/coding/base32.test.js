import {encode, decode} from './base32.js';

describe('Base32', () => {
  describe('Encode', () => {
    test('Empty Algorand address', () => {
      const address = new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        12, 116, 229, 84
      ]);
      
      expect(encode(address)).toBe('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ======');
    });
    test('Existing Algorand address', () => {
      const address = new Uint8Array([
        16, 140, 159, 223, 200, 0, 123, 125,
        148, 114, 220, 175, 160, 139, 148, 112,
        28, 233, 174, 19, 199, 114, 174, 105,
        93, 13, 242, 245, 176, 190, 120, 246,
        2, 193, 95, 109
      ]);
      
      expect(encode(address)).toBe('CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU======');
    });
    test.concurrent.each([
      [[], ''],
      [[0], 'AA======'],
      [[0, 0], 'AAAA===='],
      [[21, 14], 'CUHA===='],
      [[0, 0, 0], 'AAAAA==='],
      [[21, 14, 21], 'CUHBK==='],
      [[0, 0, 0, 0], 'AAAAAAA='],
      [[21, 14, 21, 14], 'CUHBKDQ='],
      [[0, 0, 0, 0, 0], 'AAAAAAAA'],
      [[21, 14, 21, 14, 21], 'CUHBKDQV'],
    ])('Bytes = %o', async (bytes, expected) => {
      expect(encode(new Uint8Array(bytes))).toBe(expected);
    });
  });
  describe('Decode', () => {
    test('Empty Algorand address', () => {
      const address = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ======';

      expect(decode(address)).toStrictEqual(new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        12, 116, 229, 84
      ]));
    });
    test('Existing Algorand address', () => {
      const address = 'CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU======';

      expect(decode(address)).toStrictEqual(new Uint8Array([
        16, 140, 159, 223, 200, 0, 123, 125,
        148, 114, 220, 175, 160, 139, 148, 112,
        28, 233, 174, 19, 199, 114, 174, 105,
        93, 13, 242, 245, 176, 190, 120, 246,
        2, 193, 95, 109
      ]));
    });
    test.concurrent.each([
      ['', []],
      ['AA======', [0]],
      ['AAAA====', [0, 0]],
      ['CUHA====', [21, 14]],
      ['AAAAA===', [0, 0, 0]],
      ['CUHBK===', [21, 14, 21]],
      ['AAAAAAA=', [0, 0, 0, 0]],
      ['CUHBKDQ=', [21, 14, 21, 14]],
      ['AAAAAAAA', [0, 0, 0, 0, 0]],
      ['CUHBKDQV', [21, 14, 21, 14, 21]],
    ])('Text = %o', async (text, expected) => {
      expect(decode(text)).toStrictEqual(new Uint8Array(expected));
    });
    test('Invalid length', () => {
      const address = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ';

      expect(() => decode(address)).toThrow('Error: decode expects a valid Base32 encoded string, this one has invalid length.');
    });
  });
});