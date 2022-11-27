import * as base64 from './base64.js';
import * as base32 from './base32.js';
import * as hex from './hex.js';
import * as sha512 from './sha512.js';

const bytes = {
  areEqual: (a, b) => {
    if (a.byteLength !== b.byteLength) {
      return false;
    }
    for (let i = 0; i < a.byteLength; i += 1) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
};

export {
  base64,
  base32,
  hex,
  sha512,
  bytes
};