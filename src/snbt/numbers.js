import {
    digits,
    choice,
    char,
    possibly,
    takeLeft,
} from 'arcsecond';

import {
    typeMap,
    withinWhitespace,
    betweenSquareBrackets,
    joinedSequence,
    joinedMany,
    betweenQuotes,
    betweenBrackets,
    quotedString,
    commaSeparated
} from '../utils.js';

export const signedNumber = joinedSequence([possibly(char('-')),digits]).map(parseInt);
export const signedDecimal = joinedSequence([signedNumber, possibly(joinedSequence([char("."), signedNumber]))]).map(parseFloat)

const anyCaseChar = c => choice([ char(c.toLowerCase()), char(c.toUpperCase())])

const withSuffix = c => parser => takeLeft(parser)(anyCaseChar(c))
export const numberTag = (min, max) => parser => parser.map( n => {
    if(n < min || n > max){ throw new Error(`${n} must be between ${min} and ${max}`)}
    return n;
})

export const byteTag = numberTag(-128,127)(withSuffix('b')(signedNumber)).map(typeMap('byte'));
export const shortTag = numberTag(-32768, 32767)(withSuffix('s')(signedNumber)).map(typeMap('short'));
export const intTag = numberTag(-2147483648, 2147483647)(signedNumber).map(typeMap('int'));
export const longTag = withSuffix('l')(signedNumber).map(typeMap('long'));

export const floatTag = (withSuffix('f')(signedDecimal)).map(typeMap('float'));
export const doubleTag = (withSuffix('d')(signedDecimal)).map(typeMap('double'));

