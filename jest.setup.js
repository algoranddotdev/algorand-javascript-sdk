import {Crypto} from '@peculiar/webcrypto';
import * as util from 'util';

global.crypto = new Crypto();
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;