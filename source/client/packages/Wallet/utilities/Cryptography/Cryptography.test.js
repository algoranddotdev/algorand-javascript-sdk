import {Cryptography} from './Cryptography.js';
import * as coding from '../coding';

describe('Cryptography', () => {
  test('Cryptography encrypting', async () => {
    const crypto = new Cryptography('abfb6380b70315d92651430e09565f4bc5ac4e627cd6ba929f599583c9ef4535');
    await crypto.hydrate();
    const result = await crypto.encrypt(
      new TextEncoder().encode('Man'),
      coding.hex.decode('6995b5a03791aaa11bb573f6ec7d4818')
    );
    expect(result.cipher).toStrictEqual(
      coding.hex.decode('7f84dc282e4a7e17e8f6a485695e6693')
    );
    expect(result.initializationVector).toStrictEqual(
      coding.hex.decode('6995b5a03791aaa11bb573f6ec7d4818')
    );
  });
  test('Cryptography decrypting', async () => {
    const crypto = new Cryptography('abfb6380b70315d92651430e09565f4bc5ac4e627cd6ba929f599583c9ef4535');
    await crypto.hydrate();
    const result = await crypto.decrypt(
      coding.hex.decode('7f84dc282e4a7e17e8f6a485695e6693'),
      coding.hex.decode('6995b5a03791aaa11bb573f6ec7d4818')
    );
    expect(result).toStrictEqual(new Uint8Array([77, 97, 110]));
  });
  test('Cryptography signing', async () => {
    const crypto = new Cryptography('abfb6380b70315d92651430e09565f4bc5ac4e627cd6ba929f599583c9ef4535');
    await crypto.hydrate();
    const result = await crypto.sign(
      coding.hex.decode('7f84dc282e4a7e17e8f6a485695e6693'),
      coding.hex.decode('6995b5a03791aaa11bb573f6ec7d4818')
    );
    expect(result).toStrictEqual(coding.hex.decode('3a1e3d77cb4f9a7de6b6cecc6f3e40111513b282fa92c20f7745d54a52fa0741'));
  });
  test('Cryptography generate random bytes', async () => {
    const random = Cryptography.generateRandomBytes(16);
    expect(random).toBeInstanceOf(Uint8Array);
    expect(random.byteLength).toBe(16);
    
    let sum = 0;
    for (const byte of random) {
      sum += byte;
    }
    expect(sum).not.toBe(0);
  });
});