import * as coding from '../utilities/coding';

const constants = {
  nodes: {
    MainNet: 'https://node.algoexplorerapi.io',
    TestNet: 'https://node.testnet.algoexplorerapi.io',
  },
  indexers: {
    MainNet: 'https://algoindexer.algoexplorerapi.io',
    TestNet: 'https://algoindexer.testnet.algoexplorerapi.io'
  }
};

let singleton = null;

class Algorand {
  static get main() {
    if (!singleton) {
      singleton = new Algorand();
    }
    return singleton;
  }
  get node() {
    return constants.nodes[this.network];
  }
  get indexerNode() {
    return constants.indexers[this.network];
  }
  constructor(network = 'TestNet') {
    this.network = network;
  }
  switchNetwork(network) {
    if (this.network !== network) {
      this.network = network;
    }
  }
  async broadcastRawTransaction(transactions) {
    const endpoint = (
      `${this.node}` +
      `/v2` +
      `/transactions`
    );
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-binary'
      },
      body: transactions[0]
    });

    if (response.status === 200) {
      const responseJson = await response.json();
      return responseJson.txId;
    } else {
      return null;
    }
  }
}

export {Algorand};