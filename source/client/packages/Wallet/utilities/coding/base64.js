const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const symbols = '+/';
const padding = '=';

const characterSet = [
  ...upperCaseLetters.split(''),
  ...lowerCaseLetters.split(''),
  ...numbers.split(''),
  ...symbols.split(''),
];
const encoding = {};
for (let i = 0; i < characterSet.length; i += 1) {
  encoding[characterSet[i]] = i;
}

function encode(data) {
  let bytes = null;

  // Convert any valid incoming data to Uint8Array.
  if (data instanceof Uint8Array) {
    bytes = data;
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data);
  }

  if (bytes === null) {
    throw `Error: cannot encode data of type '${typeof data}'.`;
  }

  let encodedData = '';
  const paddedBytes = bytes.byteLength % 3
  const unpaddedLength = bytes.byteLength - paddedBytes;

  if (unpaddedLength > 0) {
    for (let i = 0; i < unpaddedLength; i += 3) {
      // Assemble 3 bytes together using bit shifting.
      const bits = (
        (bytes[i + 0] << 16) +
        (bytes[i + 1] << 8) +
        (bytes[i + 2] << 0)
      );

      // Extract 4 sextets using bit masking.
      // Map each sextet to Base64 character set and append to result.
      encodedData += (
        characterSet[(bits >> 18) & 0b111111] +
        characterSet[(bits >> 12) & 0b111111] +
        characterSet[(bits >> 6) & 0b111111] +
        characterSet[(bits >> 0) & 0b111111]
      );
    }
  }
  if (paddedBytes > 0) {
    let bits = 0;

    if (paddedBytes === 1) {
      // With 1 byte and 8 bits, we need to add 4 bits to have 2 sextets.
      bits = (
        (bytes[unpaddedLength + 0] << 4)
      );

      // Extract 2 sextets using bit masking.
      // Add 2 padding characters.
      encodedData += (
        characterSet[(bits >> 6) & 0b111111] +
        characterSet[(bits >> 0) & 0b111111] +
        padding +
        padding
      );
    } else if (paddedBytes === 2) {
      // with 2 bytes and 16 bits, we need to add 2 bits to have 3 sextets.
      bits = (
        (bytes[unpaddedLength + 0] << 10) +
        (bytes[unpaddedLength + 1] << 2)
      );

      // Extract 3 sextets using bit masking.
      // Add 1 padding character.
      encodedData += (
        characterSet[(bits >> 12) & 0b111111] +
        characterSet[(bits >> 6) & 0b111111] +
        characterSet[(bits >> 0) & 0b111111] +
        padding
      );
    }
  }

  return encodedData;
}

function decode(data) {
  let decodedData = [];
  for (let i = 0; i < data.length; i += 4) {
    // Assemble 4 sextets into one 24 bit long number.
    const bits = (
      (encoding[data[i + 0]] << 18) +
      (encoding[data[i + 1]] << 12) +
      (encoding[data[i + 2]] << 6) +
      (encoding[data[i + 3]] << 0)
    );

    // Using bit mapping extract 3, 2, or 1 bytes from the number, depending on padding.
    if (data[i + 2] !== padding && data[i + 3] !== padding) {
      // Section doesn't contain any padding.
      decodedData.push(
        (bits >> 16) & 0b11111111,
        (bits >> 8) & 0b11111111,
        (bits >> 0) & 0b11111111
      );
    } else if (data[i + 2] !== padding && data[i + 3] === padding) {
      // Section contains 1 padding character.
      decodedData.push(
        (bits >> 16) & 0b11111111,
        (bits >> 8) & 0b11111111
      );
    } else if (data[i + 2] === padding && data[i + 3] === padding) {
      // Section contains 2 padding characters.
      decodedData.push(
        (bits >> 16) & 0b11111111
      );
    }
  }

  return new Uint8Array(decodedData);
}

export {encode, decode};