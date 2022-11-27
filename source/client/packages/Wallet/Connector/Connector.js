import {Cryptography} from '../utilities/Cryptography';
import {SocketController} from '../utilities/SocketController';
import * as coding from '../utilities/coding';

import {pickRandomBridge} from './utilities.js';

const constants = {
  serializedConnectorKey: 'Algoranddotdev.connector',
  walletConnect: {
    version: '1',
    protocol: 'wc'
  }
};

let singleton = null;

class Connector {
  static get main() {
    if (!singleton) {
      singleton = new Connector();
    }
    return singleton;
  }

  store() {
    window.localStorage.setItem(constants.serializedConnectorKey, JSON.stringify({
      key: this.crypto.serializedKey,
      bridge: this.socket.serverUrl,
      chainId: this.chainId,
      peers: {
        app: this.peers.app,
        wallet: this.peers.wallet
      },
      account: this.account
    }));
  }
  clearStorage() {
    window.localStorage.removeItem(constants.serializedConnectorKey);
  }
  constructor() {
    this.crypto = null;
    this.socket = null;
    this.chainId = null;
    this.peers = {
      app: null,
      wallet: null
    };
    this.account = null;

    this.requests = [];
    this.listeners = [];
  }
  async open() {
    await this.socket.open();
    let isReady = await this.socket.isOpen;
    while (!isReady) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      isReady = await this.socket.isOpen;
    }
  }
  async close() {
    this.socket.close();
    let isReady = await this.socket.isOpen;
    while (isReady) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      isReady = await this.socket.isOpen;
    }
  }
  listen(event, receiver) {
    this.listeners.push({
      event,
      receiver
    });
  }
  transmit(event, payload) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        listener.receiver(payload);
      }
    }
  }
  createRequest(method, ...params) {
    // JSON-RPC specification can be found [here](1)
    // 1: https://www.jsonrpc.org/specification
    const id = Date.now() * 1000 + this.requests.length;
    const request = {
      jsonrpc: '2.0',
      method,
      params,
      id
    };

    this.requests.push({
      method,
      id
    });

    return request;
  }
  async hydrate() {
    // Look for a serialized connection in the LocalStorage.
    let serializedConnector = null;

    const storedConnector = window.localStorage.getItem(constants.serializedConnectorKey);
    if (storedConnector) {
      serializedConnector = JSON.parse(storedConnector);
    } else {
      serializedConnector = {
        key: null,
        bridge: await pickRandomBridge(),
        chainId: null,
        peers: {
          app: window.crypto.randomUUID(),
          wallet: null
        },
        account: null
      };
    }

    this.chainId = serializedConnector.chainId;
    this.peers.app = serializedConnector.peers.app;
    this.peers.wallet = serializedConnector.peers.wallet;
    this.account = serializedConnector.account;

    this.crypto = new Cryptography(serializedConnector.key);
    await this.crypto.hydrate();
    this.socket = new SocketController(serializedConnector.bridge);
    this.socket.onOpen = () => {
      // Subscribe to all future messages.
      this.socket.send({
        topic: this.peers.app,
        type: 'sub',
        payload: '',
        silent: true
      });
    };
    this.socket.onMessage = this.onMessage.bind(this);

    this.store();

    if (this.account) {
      // If we have an associated account after hydrating, transmit same event as when connecting from scratch.
      this.transmit('didConnect', {account: this.account});
    }
  }
  async onMessage(message) {
    // This is required to stop the other peer from sending repeat messages.
    // I found on Google that it's a part of the pub/sub/ack pattern, but there exists NO documentation on WalletConnect.
    // Also, I couldn't find "ack" anywhere in the codebase for the JavaScript client or the Swift client.
    this.socket.send({
      topic: message.topic,
      type: 'ack',
      payload: '',
      silent: true
    });

    if (message.topic === this.peers.app) {
      // A message sent to this app.
      const payload = JSON.parse(message.payload);
      if (payload.data && payload.hmac && payload.iv) {
        const encryptedData = coding.hex.decode(payload.data);
        const initializationVector = coding.hex.decode(payload.iv);
        const messageHmac = coding.hex.decode(payload.hmac);

        // 1. Create an HMAC (Keyed-Hash Message Authentication Code) for the encrypted data to compare against the HMAC received.
        const recomputedHmac = await this.crypto.sign(encryptedData, initializationVector);

        // 2. Compare both hmac values to see if they are equal.
        if (!coding.bytes.areEqual(messageHmac, recomputedHmac)) {
          return;
        }

        // 3. Decrypt data.
        const encodedData = await this.crypto.decrypt(encryptedData, initializationVector);
        const data = JSON.parse(
          new TextDecoder().decode(encodedData)
        );

        const request = this.requests.find((candidate) => candidate.id === data.id);
        if (request) {
          console.log('message start');
          console.log(data);
          console.log('message end');
          // this.close();
          
          if (request.method === 'wc_sessionRequest') {
            this.didConnect(data);
          } else if (request.method === 'algo_signTxn') {
            this.didSign(data);
          } else {
            console.log(data);
          }
        } else {
          console.log('not found request');
          console.log(data);
        }
      }
    }
  }
  async didConnect(response) {
    this.peers.wallet = response.result.peerId;
    this.chainId = response.result.chainId;
    this.account = response.result.accounts[0];

    this.store();

    this.transmit('didConnect', {
      account: this.account
    });
  }
  async didSign(response) {
    const decodedTransaction = response.result.map((part) => {
      if (part) {
        return coding.base64.decode(part);
      } else {
        return null;
      }
    });

    this.transmit('didSign', {
      requestId: response.id,
      decodedTransaction
    });
  }
  async connect() {
    // await this.open();

    const data = this.createRequest('wc_sessionRequest', {
      chaindId: null,
      peerId: this.peers.app,
      peerMeta: {
        name: 'Elementist',
        description: 'Elemental',
        url: 'https://elemental.com',
        icons: [
          'https://algorand-app.s3.amazonaws.com/app-icons/Pera-walletconnect-192.png'
        ]
      }
    });
    const handshakeTopic = window.crypto.randomUUID();
    const payload = await this.encrypt(data);

    if (await this.socket.isOpen) {
      this.socket.send({
        topic: handshakeTopic,
        type: 'pub',
        payload: JSON.stringify(payload)
      });
  
      const uri = (
        `${constants.walletConnect.protocol}` +
        `:${handshakeTopic}` +
        `@${constants.walletConnect.version}` +
        `?bridge=${encodeURIComponent(this.socket.serverUrl)}` +
        `&key=${this.crypto.serializedKey}`
      );
      const deepLink = (
        `algorand-wc://wc` +
        `?uri=${encodeURIComponent(uri)}`
      );
  
      return deepLink;
    }
  }
  async disconnect() {
    console.log('--> disconnect');
    // await this.open();

    const data = this.createRequest('wc_sessionUpdate', {
      approved: false,
      chaindId: null,
      accounts: null
    });
    const payload = await this.encrypt(data);
    if (await this.socket.isOpen) {
      this.socket.send({
        topic: this.peers.wallet,
        type: 'pub',
        payload: JSON.stringify(payload),
        silent: true
      });

      // this.close();

      // Remove local information about this connection.
      this.clearStorage();
      await this.hydrate();

      this.transmit('didDisconnect');
    }
  }
  async sign(transaction) {
    // await this.open();

    const encodedTransaction = coding.base64.encode(
      transaction.encode()
    );
    const data = this.createRequest('algo_signTxn', [
      {
        txn: encodedTransaction
      }
    ]);
    const payload = await this.encrypt(data);
    this.socket.send({
      topic: this.peers.wallet,
      type: 'pub',
      payload: JSON.stringify(payload),
      silent: true
    });

    return data.id;
  }
  async encrypt(data) {
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const encrypted = await this.crypto.encrypt(encoded);
    const signed = await this.crypto.sign(encrypted.cipher, encrypted.initializationVector);

    return {
      data: coding.hex.encode(encrypted.cipher),
      iv: coding.hex.encode(encrypted.initializationVector),
      hmac: coding.hex.encode(signed)
    };
  }
}

export {Connector};