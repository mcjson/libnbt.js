import {
    str,
    takeRight,
} from 'arcsecond';


import {
    typeMap,
    betweenSquareBrackets,
    commaSeparated
} from '../utils.js';

import {
    signedNumber,
    numberTag
} from './numbers.js';

const prefixedArray = prefix => parser => betweenSquareBrackets(takeRight(str(`${prefix};`))( commaSeparated(parser) ));

export const byteArrayTag = prefixedArray('B')(numberTag(-128,127)((signedNumber))).map(v => typeMap("byte_array")( new Int8Array(v) ));
export const intArrayTag = prefixedArray('I')(numberTag(-2147483648, 2147483647)(signedNumber)).map(v => typeMap("int_array")( new Int32Array(v) ));
export const longArrayTag = prefixedArray('L')(signedNumber).map(v => typeMap("long_array")( new BigInt64Array(v) ));

