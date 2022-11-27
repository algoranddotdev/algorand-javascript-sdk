import {Application} from './Application.js';

describe('Application', () => {
  describe('Initialization', () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        result: 'BoEBQw=='
      })
    }));
    const algorand = {
      node: 'https://localhost:1234',
      client: {
        getTransactionParams: () => ({
          do: () => ({
            flatFee: false,
            fee: 0,
            firstRound: 22889141,
            lastRound: 22890141,
            genesisId: 'testnet-v1.0',
            genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          })
        })
      }
    };

    test('basic', async () => {
      const application = new Application(
        `
          #pragma version 6
          int 1
          return
        `,
        `
          #pragma version 6
          int 1
          return
        `
      );
  
      expect(application.allocation).toStrictEqual({});
  
      expect(application.globalAllocation).toBeNull();
      expect(application.localAllocation).toBeNull();
    });
    test.concurrent.each([
      [undefined, {global: null, local: null}],
      [{}, {global: null, local: null}],
      [{global: {bytes: 1}}, {global: {nbs: 1, nui: 0}, local: null}],
      [{global: {integers: 1}}, {global: {nbs: 0, nui: 1}, local: null}],
      [{global: {bytes: 1, integers: 2}}, {global: {nbs: 1, nui: 2}, local: null}],
      [{local: {bytes: 1}}, {global: null, local: {nbs: 1, nui: 0}}],
      [{local: {integers: 1}}, {global: null, local: {nbs: 0, nui: 1}}],
      [{local: {bytes: 1, integers: 2}}, {global: null, local: {nbs: 1, nui: 2}}],
      [{global: {bytes: 1}, local: {integers: 1}}, {global: {nbs: 1, nui: 0}, local: {nbs: 0, nui: 1}}],
      [{global: {bytes: 1, integers: 2}, local: {bytes: 1, integers: 2}}, {global: {nbs: 1, nui: 2}, local: {nbs: 1, nui: 2}}],
    ])('with allocation = %o', async (allocation, expected) => {
      const application = new Application(
        `
          #pragma version 6
          int 1
          return
        `,
        `
          #pragma version 6
          int 1
          return
        `,
        allocation
      );
  
      expect(application.globalAllocation).toStrictEqual(expected.global);
      expect(application.localAllocation).toStrictEqual(expected.local);
    });
  });
});