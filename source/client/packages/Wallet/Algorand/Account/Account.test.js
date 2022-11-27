import {Account} from './Account.js';

describe('Account', () => {
  test('Initialize', () => {
    const address = 'CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU';
    const account = new Account(address);

    expect(account.address).toBe(address);
  });
  test('Decode', async () => {
    const address = 'CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU';
    const account = new Account(address);

    expect(account.decodedAddress).toStrictEqual({
      publicKey: new Uint8Array([
        16, 140, 159, 223, 200, 0, 123, 125,
        148, 114, 220, 175, 160, 139, 148, 112,
        28, 233, 174, 19, 199, 114, 174, 105,
        93, 13, 242, 245, 176, 190, 120, 246
      ]),
      checksum: new Uint8Array([
        2, 193, 95, 109
      ])
    });
  });
  test('Decode with incorrect checksum', async () => {
    const address = 'CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7AA';
    const account = new Account(address);

    expect(() => account.decodedAddress).toThrow(`Error: invalid Algorand address, checksum doesn't match.`);
  });
});