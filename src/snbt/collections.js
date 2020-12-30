import {
    recursiveParser,
    choice,
    char,
    sequenceOf,
} from 'arcsecond';

import {
    typeMap,
    withinWhitespace,
    betweenSquareBrackets,
    betweenBrackets,
    quotedString,
    commaSeparated
} from './utils.js';

import { stringTag } from './string.js';

import {
    byteTag,
    shortTag,
    intTag,
    longTag,
    floatTag,
    doubleTag
} from './numbers.js';

import {
    byteArrayTag,
    intArrayTag,
    longArrayTag
} from './arrays.js';

const anyTag = recursiveParser(() => choice([
    compoundTag,
    stringTag,
    byteTag,
    shortTag,
    intTag,
    longTag,
    
    floatTag,
    doubleTag,

    byteArrayTag,
    intArrayTag,
    longArrayTag,
    tagList
    
]))

export const tagList = betweenSquareBrackets(commaSeparated(anyTag)).map(typeMap("list")).map ( v => {
    if(!v.value.every(({type}) => v.value[0].type == type )){
        throw new Error(`Expect all of type ${v.value[0].type}, but got ${Array.from(new Set( v.value.map(({type}) => type) )).join()}`);
    }
    return v;
})


//Compound tag
const namedTag = sequenceOf([
    quotedString,
    withinWhitespace(char(':')),
    anyTag
]).map( ([n,_, v]) => [n,v])

export const compoundTag = betweenBrackets(
    commaSeparated(namedTag).map( l => l.reduce( (o, [k,v]) => ({...o, [k]: v }), {}))
).map(typeMap('compound'))


//End compound tag
