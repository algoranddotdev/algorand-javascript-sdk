import * as base64 from './base64.js';

describe('Base64 coding', () => {
  test('Base64 encoding', () => {
    expect(base64.encode('Man')).toBe('TWFu');
    expect(base64.encode('Many hands make light work.')).toBe('TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu');
  });
  test('Base64 encoding empty string', () => {
    expect(base64.encode('')).toBe('');
  });
  test('Base64 encoding invalid type', () => {
    expect(() => {
      base64.encode({});
    }).toThrowError(`Error: cannot encode data of type 'object'.`);
  });
  test('Base64 encoding longer string', () => {
    expect(base64.encode('Mannam')).toBe('TWFubmFt');
  });
  test('Base64 encoding with 1 padding', () => {
    expect(base64.encode('Ma')).toBe('TWE=');
    expect(base64.encode('light work.')).toBe('bGlnaHQgd29yay4=');
    expect(base64.encode('light wo')).toBe('bGlnaHQgd28=');
  });
  test('Base64 encoding with 2 padding', () => {
    expect(base64.encode('M')).toBe('TQ==');
    expect(base64.encode('light work')).toBe('bGlnaHQgd29yaw==');
    expect(base64.encode('light w')).toBe('bGlnaHQgdw==');
  });
  
  test('Base64 binary encoding', () => {
    expect(base64.encode(new Uint8Array([0, 0, 0, 0, 0, 0]))).toBe('AAAAAAAA');
    expect(base64.encode(new Uint8Array([0, 0, 0, 0, 0, 0]).buffer)).toBe('AAAAAAAA');
    expect(base64.encode(new Uint8Array([0, 1, 2, 3, 4, 5]))).toBe('AAECAwQF');
    expect(base64.encode(new Uint8Array([0, 1, 2, 3, 4, 5]).buffer)).toBe('AAECAwQF');
  });
  test('Base64 binary encoding with 1 padding', () => {
    expect(base64.encode(new Uint8Array([0]))).toBe('AA==');
    expect(base64.encode(new Uint8Array([0]).buffer)).toBe('AA==');
    expect(base64.encode(new Uint8Array([1]))).toBe('AQ==');
  });
  test('Base64 binary encoding with 2 padding', () => {
    expect(base64.encode(new Uint8Array([0, 0]))).toBe('AAA=');
    expect(base64.encode(new Uint8Array([0, 0]).buffer)).toBe('AAA=');
    expect(base64.encode(new Uint8Array([0, 1]))).toBe('AAE=');
  });
  test('Base64 binary encoding for empty array', () => {
    expect(base64.encode(new Uint8Array([]))).toBe('');
    expect(base64.encode(new Uint8Array([]).buffer)).toBe('');
  });
  
  test('Base64 decoding', () => {
    // "Man"
    expect(base64.decode('TWFu')).toStrictEqual(new Uint8Array([77, 97, 110]));
  });
  test('Base64 decoding longer string', () => {
    // "Mannam"
    expect(base64.decode('TWFubmFt')).toStrictEqual(new Uint8Array([77, 97, 110, 110, 97, 109]));
  });
  test('Base64 decoding with 1 padding', () => {
    // "light wo"
    expect(base64.decode('bGlnaHQgd28=')).toStrictEqual(new Uint8Array([108, 105, 103, 104, 116, 32, 119, 111]));
  });
  test('Base64 decoding with 2 padding', () => {
    // "light w"
    expect(base64.decode('bGlnaHQgdw==')).toStrictEqual(new Uint8Array([108, 105, 103, 104, 116, 32, 119]));
  });
});
