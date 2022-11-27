import {Teal} from './Teal.js';

describe('Teal', () => {
  test('Initialize', () => {
    const basic = new Teal(`
      #pragma version 6
      int 1
      return
    `);

    expect(basic.source).toBe('#pragma version 6\nint 1\nreturn');

    const empty = new Teal();
    expect(empty.source).toBe('');

    const oneLiner = new Teal('#pragma version 6');
    expect(oneLiner.source).toBe('#pragma version 6');
  });
  describe('Compile', () => {
    test('minimum program', async () => {
      global.fetch = jest.fn((url, settings) => {
        if (url === 'https://node.testnet.algoexplorerapi.io/v2/teal/compile?sourcemap=true' && settings.method === 'POST') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              hash: 'OO7F7V6NG6BISF336ST4UVBTVMYNSG2BOOA3XKF5OBFP6LPMIJHRYWZRO4',
              result: 'BoEBQw==',
              sourcemap: {
                version: 3,
                sources: [],
                names: [],
                mapping: ';AACA;;AAEA'
              }
            })
          });
        }
      });

      const teal = new Teal(`
        #pragma version 6
        int 1
        return
      `);

      await expect(teal.compile()).resolves.toStrictEqual(new Uint8Array([
        6, 129, 1, 67
      ]));
    });
  });
});