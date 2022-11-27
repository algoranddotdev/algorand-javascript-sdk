import {Algorand} from '../Algorand.js';

import * as coding from '../../utilities/coding';

class Teal {
  constructor(source = '') {
    this.source = source;
    this.trim();
  }
  trim() {
    const lines = this.source.split('\n');
    const nextSource = lines
      .map((line) => line.trim())
      .filter((line, index, lines) => {
        if (index === 0) {
          return line.length > 0;
        } else if (index === (lines.length - 1)) {
          return line.length > 0;
        } else {
          return true;
        }
      })
      .reduce((buffer, line, index, lines) => {
        if (index === (lines.length - 1)) {
          // Last line, skip new line.
          return `${buffer}${line}`;
        } else {
          return `${buffer}${line}\n`;
        }
      }, '');

    this.source = nextSource;
  }
  async compile() {
    const endpoint = (
      `${Algorand.main.node}` +
      `/v2` +
      `/teal` +
      `/compile` +
      `?sourcemap=true`
    );
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'plain/text'
      },
      body: this.source
    });
    
    if (response.status === 200) {
      const responseJson = await response.json();
      return coding.base64.decode(responseJson.result);
    } else {
      return null;
    }
  }
}

export {Teal};