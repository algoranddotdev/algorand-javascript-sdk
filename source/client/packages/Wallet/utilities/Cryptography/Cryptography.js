import * as coding from '../coding';

const constants = {
  keyLength: 32,
  initializationVectorLength: 16
};

class Cryptography {
  get serializedKey() {
    return coding.hex.encode(this.keys.bytes);
  }
  constructor(hexKey) {
    this.keys = {
      bytes: hexKey !== null ? coding.hex.decode(hexKey) : Cryptography.generateRandomBytes(constants.keyLength),
      aescbc: null,
      hmac: null
    };
  }
  async hydrate() {
    this.keys.aescbc = await window.crypto.subtle.importKey(
      'raw',
      this.keys.bytes,
      {
        name: 'AES-CBC'
      },
      false,
      ['encrypt', 'decrypt']
    );
    this.keys.hmac = await window.crypto.subtle.importKey(
      'raw',
      this.keys.bytes,
      {
        name: 'HMAC',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    );
  }
  async encrypt(data, testInitializationVector = null) {
    const initializationVector = testInitializationVector || Cryptography.generateRandomBytes(constants.initializationVectorLength);
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: initializationVector
      },
      this.keys.aescbc,
      data
    );

    return {
      cipher: new Uint8Array(encryptedData),
      initializationVector
    };
  }
  async decrypt(data, initializationVector) {
    const encodedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: initializationVector
      },
      this.keys.aescbc,
      data
    );

    return new Uint8Array(encodedData);
  }
  async sign(encryptedData, initializationVector) {
    const concatenation = new Uint8Array(
      encryptedData.byteLength +
      initializationVector.byteLength
    );
    concatenation.set(encryptedData);
    concatenation.set(initializationVector, encryptedData.byteLength);

    const signature = await window.crypto.subtle.sign(
      'HMAC',
      this.keys.hmac,
      concatenation
    );

    return new Uint8Array(signature);
  }
  static generateRandomBytes(length) {
    return window.crypto.getRandomValues(new Uint8Array(length));
  }
};

export {
  Cryptography
}