import * as MessagePack from 'algo-msgpack-with-bigint';

import {Algorand} from '../Algorand.js';
import {Account} from '../Account';

import * as coding from '../../utilities/coding';

const keys = {
  fee: 'fee',
  firstRound: 'fv',
  lastRound: 'lv',
  note: 'note',
  sender: 'snd',
  type: 'type',
  genesisId: 'gen',
  genesisHash: 'gh',
  appApprovalProgram: 'apap',
  appClearProgram: 'apsu',
  appGlobalAllocation: 'apgs',
  appLocalAllocation: 'apls',
  appBehavior: 'apan'
};

const constants = {
  duration: 10 // rounds
};

class Transaction {
  set sender(nextSender) {
    this.payload = {
      ...this.payload,
      sender: new Account(nextSender).decodedAddress.publicKey
    };
  }
  get sender() {
    return this.payload.sender || null;
  }
  set note(nextNote) {
    this.payload = {
      ...this.payload,
      note: nextNote ? new TextEncoder().encode(nextNote) : null
    };
  }
  set duration(nextDuration) {
    this.payload = {
      ...this.payload,
      lastRound: this.payload.firstRound + nextDuration
    };
  }
  constructor() {
    this.payload = {};
  }
  async initialize() {
    const url = (
      `${Algorand.main.node}` +
      `/v2` +
      `/transactions` +
      `/params`
    );
    const response = await fetch(url, {
      method: 'GET'
    });

    if (response.status === 200) {
      const responseJson = await response.json();

      const fee = responseJson['fee'];
      const minFee = responseJson['min-fee'];
      const firstRound = responseJson['last-round'];

      this.payload = {
        fee: fee < 1000 ? minFee : fee,
        firstRound,
        lastRound: firstRound + constants.duration,
        genesisId: responseJson['genesis-id'],
        genesisHash: coding.base64.decode(responseJson['genesis-hash']),
      };

      return this;
    }

    return null;
  }
  prepare(externalPayload) {
    this.payload = {
      ...this.payload,
      ...externalPayload
    };
  }
  translate() {
    const translatedPayload = {};
    for (const key in this.payload) {
      const value = this.payload[key];
      if (value !== null && value !== 0) {
        translatedPayload[keys[key]] = this.payload[key];
      }
    }

    return translatedPayload;
  }
  encode() {
    return MessagePack.encode(this.translate(), {sortKeys: true});
  }
}

export {Transaction};