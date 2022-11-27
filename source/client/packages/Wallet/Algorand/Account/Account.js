import * as coding from '../../utilities/coding';

const constants = {
  lengths: {
    string: 58,
    publicKey: 32,
    checksum: 4,
  }
};

class Account {
  get decodedAddress() {
    // Algorand uses truncated Base32 strings as the address, but you can't decode a truncated string.
    // For this reason I add the missing padding symbols '=' manually.
    const decoded = coding.base32.decode(`${this.address}======`);
    const publicKey = decoded.slice(0, constants.lengths.publicKey);
    const checksum = decoded.slice(constants.lengths.publicKey);

    const hashedPublicKey = coding.sha512.digest(publicKey);
    const computedChecksum = new Uint8Array(
      hashedPublicKey.slice(
        constants.lengths.publicKey - constants.lengths.checksum
      )
    );
    if (!coding.bytes.areEqual(checksum, computedChecksum)) {
      throw new Error(`Error: invalid Algorand address, checksum doesn't match.`);
    }

    return {
      publicKey,
      checksum
    };
  }
  constructor(address) {
    this.address = address;
  }
  
}

export {Account};