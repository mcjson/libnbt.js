import {
    str,
    takeRight,
} from 'arcsecond';


import {
    typeMap,
    betweenSquareBrackets,
    commaSeparated
} from './utils.js';

import {
    signedNumber,
    numberTag
} from './numbers.js';

const prefixedArray = prefix => parser => betweenSquareBrackets(takeRight(str(`${prefix};`))( commaSeparated(parser) ));

export const byteArrayTag = prefixedArray('B')(numberTag(-128,127)((signedNumber))).map(typeMap("byte_array"));
export const intArrayTag = prefixedArray('I')(numberTag(-2147483648, 2147483647)(signedNumber)).map(typeMap("int_array"));
export const longArrayTag = prefixedArray('L')(signedNumber).map(typeMap("long_array"));

