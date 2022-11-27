import {Transaction} from './Transaction.js';
import {Account} from '../Account';
import {Application} from '../Application';

describe('Transaction', () => {
  describe('REST API', () => {
    test('initialize', async () => {
      global.fetch = jest.fn((url, settings) => {
        if (url === 'https://node.testnet.algoexplorerapi.io/v2/transactions/params' && settings.method === 'GET') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              'consensus-version': 'https://github.com/algorandfoundation/specs/tree/d5ac876d7ede07367dbaa26e149aa42589aac1f7',
              'fee': 0,
              'genesis-hash': 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
              'genesis-id': 'testnet-v1.0',
              'last-round': 22907448,
              'min-fee': 1000
            })
          });
        }
      });

      const sender = new Account('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ');
      const transaction = await new Transaction(sender, 10).initialize();

      expect(transaction.sender.address).toBe('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ');
      expect(transaction.duration).toBe(10);
      expect(transaction.note).toBeNull();

      transaction.note = 'Testing...';

      expect(transaction.note).toBe('Testing...');

      expect(transaction.consensusVersion).toBe('https://github.com/algorandfoundation/specs/tree/d5ac876d7ede07367dbaa26e149aa42589aac1f7');
      expect(transaction.fee).toBe(0);
      expect(transaction.genesisHash).toBe('SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=');
      expect(transaction.genesisId).toBe('testnet-v1.0');
      expect(transaction.firstRound).toBe(22907448);
      expect(transaction.minFee).toBe(1000);

      expect(transaction.lastRound).toBe(22907458);
    });
  });
  describe('Application', () => {
    describe('Create', () => {
      beforeEach(() => {
        global.fetch = jest.fn((url, settings) => {
          if (url === 'https://node.testnet.algoexplorerapi.io/v2/transactions/params' && settings.method === 'GET') {
            return Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                'consensus-version': 'https://github.com/algorandfoundation/specs/tree/d5ac876d7ede07367dbaa26e149aa42589aac1f7',
                'fee': 0,
                'genesis-hash': 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
                'genesis-id': 'testnet-v1.0',
                'last-round': 22953769,
                'min-fee': 1000
              })
            });
          } else if (url === 'https://node.testnet.algoexplorerapi.io/v2/teal/compile?sourcemap=true' && settings.method === 'POST') {
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
      });
      test('without note', async () => {
        const author = new Account('DU4BX4SUQZHK2SLAWKCL3O7O4DPVVBWILX47ZLPHQ4I6NX2L4YKE4MM7UE');
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
        
        const transaction = await new Transaction(author, 10).initialize();
        
        expect(transaction.duration).toBe(10);
  
        await transaction.createApplication(application);
        const payload = transaction.translate();
  
        expect(payload.fee).toBe(1000);
        expect(payload.fv).toBe(22953769),
        expect(payload.lv).toBe(22953779),
        expect(payload.note).toBeUndefined();
        expect(payload.snd).toStrictEqual(new Uint8Array([
          29, 56, 27, 242, 84, 134, 78, 173,
          73, 96, 178, 132, 189, 187, 238, 224,
          223, 90, 134, 200, 93, 249, 252, 173,
          231, 135, 17, 230, 223, 75, 230, 20
        ]));
        expect(payload.type).toBe('appl');
        expect(payload.gen).toStrictEqual('testnet-v1.0');
        expect(payload.gh).toStrictEqual(new Uint8Array([
          72, 99, 181, 24, 164, 179, 200, 78,
          200, 16, 242, 45, 79, 16, 129, 203,
          15, 113, 240, 89, 167, 172, 32, 222,
          198, 47, 127, 112, 229, 9, 58, 34
        ]));
        expect(payload.apap).toStrictEqual(new Uint8Array([
          6, 129, 1, 67
        ]));
        expect(payload.apsu).toStrictEqual(new Uint8Array([
          6, 129, 1, 67
        ]));
  
        const encoded = transaction.encode();
  
        expect(encoded).toStrictEqual(new Uint8Array([
          137, 164, 97, 112, 97, 112, 196, 4,
          6, 129, 1, 67, 164, 97, 112, 115,
          117, 196, 4, 6, 129, 1, 67, 163,
          102, 101, 101, 205, 3, 232, 162, 102,
          118, 206, 1, 94, 63, 41, 163, 103,
          101, 110, 172, 116, 101, 115, 116, 110,
          101, 116, 45, 118, 49, 46, 48, 162,
          103, 104, 196, 32, 72, 99, 181, 24,
          164, 179, 200, 78, 200, 16, 242, 45,
          79, 16, 129, 203, 15, 113, 240, 89,
          167, 172, 32, 222, 198, 47, 127, 112,
          229, 9, 58, 34, 162, 108, 118, 206,
          1, 94, 63, 51, 163, 115, 110, 100,
          196, 32, 29, 56, 27, 242, 84, 134,
          78, 173, 73, 96, 178, 132, 189, 187,
          238, 224, 223, 90, 134, 200, 93, 249,
          252, 173, 231, 135, 17, 230, 223, 75,
          230, 20, 164, 116, 121, 112, 101, 164,
          97, 112, 112, 108
        ]));
      });
      test('with note', async () => {
        const author = new Account('DU4BX4SUQZHK2SLAWKCL3O7O4DPVVBWILX47ZLPHQ4I6NX2L4YKE4MM7UE');
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
        
        const transaction = await new Transaction(author, 10).initialize();
        transaction.firstRound = 22970728;
        transaction.note = 'Testing...';

        await transaction.createApplication(application);
        const encoded = transaction.encode();

        expect(encoded).toStrictEqual(new Uint8Array([
          138, 164, 97, 112, 97, 112, 196, 4,
          6, 129, 1, 67, 164, 97, 112, 115,
          117, 196, 4, 6, 129, 1, 67, 163,
          102, 101, 101, 205, 3, 232, 162, 102,
          118, 206, 1, 94, 129, 104, 163, 103,
          101, 110, 172, 116, 101, 115, 116, 110,
          101, 116, 45, 118, 49, 46, 48, 162,
          103, 104, 196, 32, 72, 99, 181, 24,
          164, 179, 200, 78, 200, 16, 242, 45,
          79, 16, 129, 203, 15, 113, 240, 89,
          167, 172, 32, 222, 198, 47, 127, 112,
          229, 9, 58, 34, 162, 108, 118, 206,
          1, 94, 129, 114, 164, 110, 111, 116,
          101, 196, 10, 84, 101, 115, 116, 105,
          110, 103, 46, 46, 46, 163, 115, 110,
          100, 196, 32, 29, 56, 27, 242, 84,
          134, 78, 173, 73, 96, 178, 132, 189,
          187, 238, 224, 223, 90, 134, 200, 93,
          249, 252, 173, 231, 135, 17, 230, 223,
          75, 230, 20, 164, 116, 121, 112, 101,
          164, 97, 112, 112, 108
        ]));
      });
      test('with state allocation', async () => {
        const author = new Account('DU4BX4SUQZHK2SLAWKCL3O7O4DPVVBWILX47ZLPHQ4I6NX2L4YKE4MM7UE');
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
          {
            global: {
              bytes: 1,
              integers: 2
            },
            local: {
              bytes: 3,
              integers: 4
            }
          }
        );
        
        const transaction = await new Transaction(author, 10).initialize();
        transaction.firstRound = 22970773;
        transaction.note = 'Testing...';

        await transaction.createApplication(application);
        const payload = transaction.translate();

        expect(payload.apgs).toStrictEqual({nbs: 1, nui: 2});
        expect(payload.apls).toStrictEqual({nbs: 3, nui: 4});

        const encoded = transaction.encode();

        expect(encoded).toStrictEqual(new Uint8Array([
          140, 164, 97, 112, 97, 112, 196, 4,
          6, 129, 1, 67, 164, 97, 112, 103,
          115, 130, 163, 110, 98, 115, 1, 163,
          110, 117, 105, 2, 164, 97, 112, 108,
          115, 130, 163, 110, 98, 115, 3, 163,
          110, 117, 105, 4, 164, 97, 112, 115,
          117, 196, 4, 6, 129, 1, 67, 163,
          102, 101, 101, 205, 3, 232, 162, 102,
          118, 206, 1, 94, 129, 149, 163, 103,
          101, 110, 172, 116, 101, 115, 116, 110,
          101, 116, 45, 118, 49, 46, 48, 162,
          103, 104, 196, 32, 72, 99, 181, 24,
          164, 179, 200, 78, 200, 16, 242, 45,
          79, 16, 129, 203, 15, 113, 240, 89,
          167, 172, 32, 222, 198, 47, 127, 112,
          229, 9, 58, 34, 162, 108, 118, 206,
          1, 94, 129, 159, 164, 110, 111, 116,
          101, 196, 10, 84, 101, 115, 116, 105,
          110, 103, 46, 46, 46, 163, 115, 110,
          100, 196, 32, 29, 56, 27, 242, 84,
          134, 78, 173, 73, 96, 178, 132, 189,
          187, 238, 224, 223, 90, 134, 200, 93,
          249, 252, 173, 231, 135, 17, 230, 223,
          75, 230, 20, 164, 116, 121, 112, 101,
          164, 97, 112, 112, 108,
        ]));
      });
      test('with behavior', async () => {
        const author = new Account('DU4BX4SUQZHK2SLAWKCL3O7O4DPVVBWILX47ZLPHQ4I6NX2L4YKE4MM7UE');
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
          {
            global: {
              bytes: 1,
              integers: 2
            },
            local: {
              bytes: 3,
              integers: 4
            }
          }
        );
        
        const transaction = await new Transaction(author, 10).initialize();
        transaction.firstRound = 22971048;
        transaction.note = 'Testing...';

        await transaction.createApplication(application, Transaction.behavior.OptInOC);
        const payload = transaction.translate();

        expect(payload.apan).toBe(1);

        const encoded = transaction.encode();

        expect(encoded).toStrictEqual(new Uint8Array([
          141, 164, 97, 112, 97, 110, 1, 164,
          97, 112, 97, 112, 196, 4, 6, 129,
          1, 67, 164, 97, 112, 103, 115, 130,
          163, 110, 98, 115, 1, 163, 110, 117,
          105, 2, 164, 97, 112, 108, 115, 130,
          163, 110, 98, 115, 3, 163, 110, 117,
          105, 4, 164, 97, 112, 115, 117, 196,
          4, 6, 129, 1, 67, 163, 102, 101,
          101, 205, 3, 232, 162, 102, 118, 206,
          1, 94, 130, 168, 163, 103, 101, 110,
          172, 116, 101, 115, 116, 110, 101, 116,
          45, 118, 49, 46, 48, 162, 103, 104,
          196, 32, 72, 99, 181, 24, 164, 179,
          200, 78, 200, 16, 242, 45, 79, 16,
          129, 203, 15, 113, 240, 89, 167, 172,
          32, 222, 198, 47, 127, 112, 229, 9,
          58, 34, 162, 108, 118, 206, 1, 94,
          130, 178, 164, 110, 111, 116, 101, 196,
          10, 84, 101, 115, 116, 105, 110, 103,
          46, 46, 46, 163, 115, 110, 100, 196,
          32, 29, 56, 27, 242, 84, 134, 78,
          173, 73, 96, 178, 132, 189, 187, 238,
          224, 223, 90, 134, 200, 93, 249, 252,
          173, 231, 135, 17, 230, 223, 75, 230,
          20, 164, 116, 121, 112, 101, 164, 97,
          112, 112, 108,
        ]));
      });
    });
  });
});