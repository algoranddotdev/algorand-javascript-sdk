// Base32 functions based on the RFC 4648 standard.

const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '234567';
const padding = '=';

const characterSet = [
  ...upperCaseLetters.split(''),
  ...numbers.split(''),
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
  const paddingLength = bytes.byteLength % 5
  const lengthWithoutPadding = bytes.byteLength - paddingLength

  if (lengthWithoutPadding > 0) {
    // Since we're working with 40 bit long sequences, regular JavaScript Number won't work.
    // Bit shift operations return a 32-bit signed integer and it becomes impossible to mask correctly.
    // For that reason, I'm using the native BigInt and the 0n literal for BigInt.
    for (let i = 0; i < lengthWithoutPadding; i += 5) {
      // Assemble 5 bytes together using bit shifting.
      let bits = 0n;
      for (let b = 0; b < 5; b += 1) {
        bits = bits << 8n;
        bits += BigInt(bytes[i + b]);
      }

      // Extract 8 5-bit segments using bit masking.
      // Map each 5-bit segment to Base32 character set and append to result.
      let buffer = '';
      for (let s = 0; s < 8; s += 1) {
        const segment = Number(bits & 0b11111n);
        buffer = `${characterSet[segment]}${buffer}`;
        bits = bits >> 5n;
      }
      encodedData += buffer;
    }
  }
  if (paddingLength > 0) {
    // Find how many 5-bit segments we can fill with data.
    // Calculate how big the gap is between paddingLength and 40 bits.
    const segments = Math.ceil((paddingLength * 8) / 5);
    const gap = segments * 5 - paddingLength * 8;

    // Populate with data bits.
    let bits = 0n;
    for (let b = 0; b < paddingLength; b += 1) {
      bits = bits << 8n;
      bits += BigInt(bytes[lengthWithoutPadding + b]);
    }
    bits = bits << BigInt(gap);

    // Extract 5-bits segments from segments * 5 bits.
    let buffer = '';
    for (let s = 0; s < segments; s += 1) {
      const segment = Number(bits & 0b11111n);
      buffer = `${characterSet[segment]}${buffer}`;
      bits = bits >> 5n;
    }

    // Append encoded segments + padding characters.
    encodedData += buffer + padding.repeat(8 - segments);
  }

  return encodedData;
}

function decode(data) {
  if (data.length % 8 !== 0) {
    throw new Error('Error: decode expects a valid Base32 encoded string, this one has invalid length.');
  }

  let decodedData = [];

  for (let i = 0; i < data.length; i += 8) {
    // Assemble 8 5-bit segments into one 40 bit long number.
    let bits = 0n;
    let segments = 0;
    while (segments < 8) {
      const symbol = data[i + segments];
      if (symbol === padding) {
        break;
      }
      bits = bits << 5n;
      bits += BigInt(encoding[symbol]);
      segments += 1;
    }

    // Using bit mapping extract 5, 4, 3, 2, or 1 bytes from the number, depending on padding.
    const unpaddedBytes = Math.floor((segments * 5) / 8);
    const gap = segments * 5 - unpaddedBytes * 8;
    let buffer = [];

    for (let b = 0; b < unpaddedBytes; b += 1) {
      buffer.push(
        Number((bits >> BigInt(8 * b + gap)) & 0b11111111n)
      );
    }
    
    decodedData.push(...buffer.reverse());
  }

  return new Uint8Array(decodedData);
}

export {encode, decode};