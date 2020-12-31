import {
    sequenceOf,
    possibly,
    regex,
    char,
    endOfInput
} from 'arcsecond';
import { compoundTag } from '../snbt/collections';
import { commaSeparated, withinWhitespace, betweenSquareBrackets } from '../utils';


const alphaNumParser = regex(/^[a-z_0-9-\.]+/);

const blockStateParser = betweenSquareBrackets(
    commaSeparated(
        sequenceOf([
            alphaNumParser,
            withinWhitespace(char("=")),
            alphaNumParser
        ]).map( ([k,_,v]) => [k,v])
    )
).map( v => v.reduce( (o, [k,v]) =>  ({...o, [k]: v}), {}));


const itemParser = sequenceOf([
    regex(/^(?:[a-z_0-9-\.]+:)?[a-z_0-9-\.\/]+/).map( n => {
        const parts = n.split(":");
        if(parts.length == 1){
            parts.unshift("minecraft");
        }
        return parts.join(":");
    }),
    possibly(blockStateParser),
    // possibly(compoundTag),
    compoundTag,
    endOfInput
]).map( ([item, blockstate, tag]) => ({ item, blockstate, tag}));

export const parseItemStack = data => itemParser.run(data);