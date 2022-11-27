import {Connector} from './Connector.js';
import {Account, Algorand, Application, Transaction} from '../Algorand';
import * as coding from '../utilities/coding';

describe('Connector', () => {
  beforeEach(() => {
    const storage = {};
    global.localStorage = {
      setItem: (key, value) => storage[key] = value,
      getItem: (key) => storage[key] === undefined ? null : storage[key]
    };
    global.localStorage.setItem('Algoranddotdev.connector', JSON.stringify({
      key: 'b73c069448986270154ae7f2310e33613219e08cfcc5549d7c7336258d9c30d8',
      bridge: 'https://wallet-connect-b.perawallet.app/',
      chainId: null,
      peers: {
        app: '3b06c0f2-0d0d-4d23-bbf5-e03358a5d342',
        wallet: null
      },
      account: null
    }));
  });
  test('Connector initialization', async () => {
    // Mock WebSocket to trigger the desired callbacks.
    const mockEvents = async (socket) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onopen();
    };
    class MockWebSocket {
      constructor() {
        mockEvents(this);
      }
      send() {}
    }
    global.WebSocket = MockWebSocket;

    const connector = new Connector();

    expect(connector.crypto).toBeNull();
    expect(connector.socket).toBeNull();
    expect(connector.chainId).toBeNull();
    expect(connector.peers.app).toBeNull();
    expect(connector.peers.wallet).toBeNull();
    expect(connector.account).toBeNull();

    await connector.hydrate();

    expect(connector.chainId).toBeNull();
    expect(connector.crypto.keys.bytes).toStrictEqual(coding.hex.decode('b73c069448986270154ae7f2310e33613219e08cfcc5549d7c7336258d9c30d8'));
    expect(connector.account).toBeNull();

    await expect(connector.socket.isOpen).resolves.toBe(true);
  });
  test('Connector connected message', async () => {
    // Mock WebSocket to trigger the desired callbacks.
    const mockEvents = async (socket) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onopen();
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onmessage(new MessageEvent('message', {
        data: JSON.stringify({
          silent: false,
          topic: '3b06c0f2-0d0d-4d23-bbf5-e03358a5d342',
          type: 'pub',
          payload: JSON.stringify({
            data: 'f5cb5b608d1ff769d22c58dbfc46eeb476ca415d6cdd7907e22391e8be12260abdef3d42a23d1c1aef2aa7b1b6f91f75072d2900e7e2397e95d552baf0a414ab8c24d1b282c76a7eaf3c1193dbe23d99bdec3c71f800618d0f853da7e91a2668af35ad14f7a024ce1f04d668654148ffb15e592529c8b5122e9754fe26520dc7d4dba3f577485db5a0e1be359b3981b1d72d9303ffe43e7feb35b6abfac523e04d31b61f969bd7c15ba36ffa72f44d52018be10b409ea2e0ab3790fdb3f4ed3fdba331f9c6a3ff3d2d7a7ba521e6de322003a61218c1f71c6f17abc35cdd9afd34b631cb82dd0044a4f5d213dbc57a4cddfe96b91a58881b91562c6de381ae9cc70ed7d0c44a0536b2a199c4c5d383758851813aa0e8517f0807c8ee4d4f64a07c3b8a1798bb6add68655b8fe00c8d3b5c1ba8cd54bce1918e0c254fc7d5d7936899ac4121c86c379be709723a32b086e656a5d6099d4a43d146cc029b1da1215594cffd69246b0c917c80d80b5e07da3faad663cc67c3561966b8eac5c028542f7c39bdc964246f07b8cee7f545903d2ee92ce568490186bb33a6a94b7449bdc49ed91b8ecb85024951dfcae7286c80638a7580f5768cc357f03c9462904779b7870f1f3f108d702cc673a707d606a6ae9943bfad518b8e3fbf2db2696d522ba81be49fdbbe6db349158d7539ceb7636383b8f849686fe3b9155a9dbb53d0a115d80fcc79b24d55d5b2452f6dd59f656a0ae152d069e9f9140353f469cbbe7c6c0a1f0a3c21af4ee1e38f50116d39b1c97941d98aac460263efe7f9982cf1ca411582d8c0ea935da0c119405fccb179',
            hmac: '763265815fb5480e219daeb8cf421f52be0586efbb3bb0bc246a4aee42c57642',
            iv: '29472d89800f1e3241c44259c6885290'
          })
        })
      }));
    };
    class MockWebSocket {
      constructor() {
        mockEvents(this);
      }
      send() {}
    }
    global.WebSocket = MockWebSocket;

    const connector = new Connector();
    connector.requests = [
      {method: 'wc_sessionRequest', id: 1657469370636000}
    ];
    await connector.hydrate();
    
    await expect(connector.socket.isOpen).resolves.toBe(true);
    await new Promise((resolve) => connector.listen('didConnect', resolve));

    await expect(connector.peers.wallet).toBe('1A62233C-9241-46BB-B3CE-5C27EEEBEEE0');
    await expect(connector.chainId).toBe(4160);
    await expect(connector.account).toBe('CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU');
    
    const serialized = JSON.parse(localStorage.getItem('Algoranddotdev.connector'));

    expect(serialized.chainId).toBe(4160);
    expect(serialized.peers.wallet).toBe('1A62233C-9241-46BB-B3CE-5C27EEEBEEE0');
    expect(serialized.account).toBe('CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU');
  });
  test('Connector disconnect', async () => {
    // Mock WebSocket to trigger the desired callbacks.
    const mockEvents = async (socket) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onopen();
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onmessage(new MessageEvent('message', {
        data: JSON.stringify({
          silent: false,
          topic: '3b06c0f2-0d0d-4d23-bbf5-e03358a5d342',
          type: 'pub',
          payload: JSON.stringify({
            data: 'f5cb5b608d1ff769d22c58dbfc46eeb476ca415d6cdd7907e22391e8be12260abdef3d42a23d1c1aef2aa7b1b6f91f75072d2900e7e2397e95d552baf0a414ab8c24d1b282c76a7eaf3c1193dbe23d99bdec3c71f800618d0f853da7e91a2668af35ad14f7a024ce1f04d668654148ffb15e592529c8b5122e9754fe26520dc7d4dba3f577485db5a0e1be359b3981b1d72d9303ffe43e7feb35b6abfac523e04d31b61f969bd7c15ba36ffa72f44d52018be10b409ea2e0ab3790fdb3f4ed3fdba331f9c6a3ff3d2d7a7ba521e6de322003a61218c1f71c6f17abc35cdd9afd34b631cb82dd0044a4f5d213dbc57a4cddfe96b91a58881b91562c6de381ae9cc70ed7d0c44a0536b2a199c4c5d383758851813aa0e8517f0807c8ee4d4f64a07c3b8a1798bb6add68655b8fe00c8d3b5c1ba8cd54bce1918e0c254fc7d5d7936899ac4121c86c379be709723a32b086e656a5d6099d4a43d146cc029b1da1215594cffd69246b0c917c80d80b5e07da3faad663cc67c3561966b8eac5c028542f7c39bdc964246f07b8cee7f545903d2ee92ce568490186bb33a6a94b7449bdc49ed91b8ecb85024951dfcae7286c80638a7580f5768cc357f03c9462904779b7870f1f3f108d702cc673a707d606a6ae9943bfad518b8e3fbf2db2696d522ba81be49fdbbe6db349158d7539ceb7636383b8f849686fe3b9155a9dbb53d0a115d80fcc79b24d55d5b2452f6dd59f656a0ae152d069e9f9140353f469cbbe7c6c0a1f0a3c21af4ee1e38f50116d39b1c97941d98aac460263efe7f9982cf1ca411582d8c0ea935da0c119405fccb179',
            hmac: '763265815fb5480e219daeb8cf421f52be0586efbb3bb0bc246a4aee42c57642',
            iv: '29472d89800f1e3241c44259c6885290'
          })
        })
      }));
    };
    class MockWebSocket {
      constructor() {
        mockEvents(this);
      }
      send() {}
    }

    global.WebSocket = MockWebSocket;
    global.fetch = () => {
      return {
        ok: true,
        json: () => ({
          servers: [
            'https://wallet-connect-a.perawallet.app/',
            'https://wallet-connect-b.perawallet.app/',
            'https://wallet-connect-c.perawallet.app/',
            'https://wallet-connect-d.perawallet.app/',
          ]
        })
      };
    };

    const connector = new Connector();
    connector.requests = [
      {method: 'wc_sessionRequest', id: 1657469370636000}
    ];
    await connector.hydrate();

    const oldKey = connector.crypto.keys.bytes;
    const oldPeerId = connector.peers.app;

    const mockSend = jest.spyOn(connector.socket, 'send').mockImplementation(() => {});
    
    await expect(connector.socket.isOpen).resolves.toBe(true);
    await new Promise((resolve) => connector.listen('didConnect', resolve));

    await connector.disconnect();

    await expect(mockSend).toHaveBeenCalled();
    expect(connector.account).toBeNull();
    expect(connector.peers.app).not.toBeNull();
    expect(connector.peers.app).not.toBe(oldPeerId);
    expect(connector.crypto.keys.bytes).not.toStrictEqual(oldKey);

    const localStorage = JSON.parse(
      global.localStorage.getItem('Algoranddotdev.connector')
    );

    expect(localStorage.account).toBeNull();
    expect(localStorage.peers.app).not.toBeNull();
    expect(localStorage.peers.app).not.toBe(oldPeerId);
    expect(localStorage.key).not.toBe(coding.hex.encode(oldKey));
  });
});

describe('Connector callbacks', () => {
  beforeEach(() => {
    const storage = {};
    global.localStorage = {
      setItem: (key, value) => storage[key] = value,
      getItem: (key) => storage[key] === undefined ? null : storage[key]
    };
  });
  test('Connector didConnect', async () => {
    global.localStorage.setItem('Algoranddotdev.connector', JSON.stringify({
      key: 'b73c069448986270154ae7f2310e33613219e08cfcc5549d7c7336258d9c30d8',
      bridge: 'https://wallet-connect-b.perawallet.app/',
      chainId: null,
      peers: {
        app: '3b06c0f2-0d0d-4d23-bbf5-e03358a5d342',
        wallet: null
      },
      account: null
    }));

    // Mock WebSocket to trigger the desired callbacks.
    const mockEvents = async (socket) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onopen();
    };
    class MockWebSocket {
      constructor() {
        mockEvents(this);
      }
      send() {}
    }

    global.WebSocket = MockWebSocket;

    const connector = new Connector();
    connector.requests = [
      {method: 'wc_sessionRequest', id: 1657469370636000}
    ];
    await connector.hydrate();
    const mockSend = jest.spyOn(connector.socket, 'send').mockImplementation((payload) => {
      if (payload.type === 'pub') {
        connector.socket.didReceive(new MessageEvent('message', {
          data: JSON.stringify({
            silent: false,
            topic: '3b06c0f2-0d0d-4d23-bbf5-e03358a5d342',
            type: 'pub',
            payload: JSON.stringify({
              data: 'f5cb5b608d1ff769d22c58dbfc46eeb476ca415d6cdd7907e22391e8be12260abdef3d42a23d1c1aef2aa7b1b6f91f75072d2900e7e2397e95d552baf0a414ab8c24d1b282c76a7eaf3c1193dbe23d99bdec3c71f800618d0f853da7e91a2668af35ad14f7a024ce1f04d668654148ffb15e592529c8b5122e9754fe26520dc7d4dba3f577485db5a0e1be359b3981b1d72d9303ffe43e7feb35b6abfac523e04d31b61f969bd7c15ba36ffa72f44d52018be10b409ea2e0ab3790fdb3f4ed3fdba331f9c6a3ff3d2d7a7ba521e6de322003a61218c1f71c6f17abc35cdd9afd34b631cb82dd0044a4f5d213dbc57a4cddfe96b91a58881b91562c6de381ae9cc70ed7d0c44a0536b2a199c4c5d383758851813aa0e8517f0807c8ee4d4f64a07c3b8a1798bb6add68655b8fe00c8d3b5c1ba8cd54bce1918e0c254fc7d5d7936899ac4121c86c379be709723a32b086e656a5d6099d4a43d146cc029b1da1215594cffd69246b0c917c80d80b5e07da3faad663cc67c3561966b8eac5c028542f7c39bdc964246f07b8cee7f545903d2ee92ce568490186bb33a6a94b7449bdc49ed91b8ecb85024951dfcae7286c80638a7580f5768cc357f03c9462904779b7870f1f3f108d702cc673a707d606a6ae9943bfad518b8e3fbf2db2696d522ba81be49fdbbe6db349158d7539ceb7636383b8f849686fe3b9155a9dbb53d0a115d80fcc79b24d55d5b2452f6dd59f656a0ae152d069e9f9140353f469cbbe7c6c0a1f0a3c21af4ee1e38f50116d39b1c97941d98aac460263efe7f9982cf1ca411582d8c0ea935da0c119405fccb179',
              hmac: '763265815fb5480e219daeb8cf421f52be0586efbb3bb0bc246a4aee42c57642',
              iv: '29472d89800f1e3241c44259c6885290'
            })
          })
        }));
      }
    });
    const mockTransmit = jest.spyOn(connector, 'transmit');

    await expect(connector.socket.isOpen).resolves.toBe(true);

    await expect(connector.connect()).resolves.toContain('algorand-wc://wc?uri=');
    await expect(new Promise((resolve) => connector.listen('didConnect', resolve))).resolves.toStrictEqual({
      account: 'CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU'
    });
    expect(mockTransmit).toHaveBeenCalledTimes(1);
  });
  test('Connector didConnect from hydration', async () => {
    global.localStorage.setItem('Algoranddotdev.connector', JSON.stringify({
      key: 'b73c069448986270154ae7f2310e33613219e08cfcc5549d7c7336258d9c30d8',
      bridge: 'https://wallet-connect-b.perawallet.app/',
      chainId: 4160,
      peers: {
        app: '3b06c0f2-0d0d-4d23-bbf5-e03358a5d342',
        wallet: '1A62233C-9241-46BB-B3CE-5C27EEEBEEE0'
      },
      account: 'CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU'
    }));

    // Mock WebSocket to trigger the desired callbacks.
    const mockEvents = async (socket) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onopen();
    };
    class MockWebSocket {
      constructor() {
        mockEvents(this);
      }
      send() {}
    }
    global.WebSocket = MockWebSocket;

    const connector = new Connector();
    const mockTransmit = jest.spyOn(connector, 'transmit');
    await connector.hydrate();

    await expect(connector.socket.isOpen).resolves.toBe(true);

    expect(mockTransmit).toHaveBeenCalledTimes(1);
    expect(mockTransmit).toHaveBeenCalledWith(
      'didConnect',
      {account: 'CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU'}
    );
  });
  test('Connector didDisconnect', async () => {
    global.localStorage.setItem('Algoranddotdev.connector', JSON.stringify({
      key: 'b73c069448986270154ae7f2310e33613219e08cfcc5549d7c7336258d9c30d8',
      bridge: 'https://wallet-connect-b.perawallet.app/',
      chainId: 4160,
      peers: {
        app: '3b06c0f2-0d0d-4d23-bbf5-e03358a5d342',
        wallet: '1A62233C-9241-46BB-B3CE-5C27EEEBEEE0'
      },
      account: 'CCGJ7X6IAB5X3FDS3SX2BC4UOAOOTLQTY5ZK42K5BXZPLMF6PD3AFQK7NU'
    }));

    // Mock WebSocket to trigger the desired callbacks.
    const mockEvents = async (socket) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      socket.onopen();
    };
    class MockWebSocket {
      constructor() {
        mockEvents(this);
      }
      send() {}
    }
    global.WebSocket = MockWebSocket;

    const connector = new Connector();
    const mockTransmit = jest.spyOn(connector, 'transmit');
    await connector.hydrate();

    await expect(connector.socket.isOpen).resolves.toBe(true);

    await connector.disconnect();

    expect(mockTransmit).toHaveBeenCalledTimes(2);
    expect(mockTransmit).toHaveBeenLastCalledWith(
      'didDisconnect'
    );
  });
  // test('Connector didSign', async () => {});
});