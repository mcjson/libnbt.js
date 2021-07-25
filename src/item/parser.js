import {
    sequenceOf,
    possibly,
    regex,
    char,
    endOfInput
} from 'arcsecond';
import { compoundTag } from '../snbt/collections';
import { toSNBT } from '../snbt/stringifier';
import { commaSeparated, withinWhitespace, betweenSquareBrackets, minecraftNamespacedKey } from '../utils';


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
    minecraftNamespacedKey,
    possibly(blockStateParser),
    // possibly(compoundTag),
    possibly(compoundTag),
    endOfInput
]).map( ([item, blockstate, tag]) => ({ item, blockstate, tag}));

export const parseItemStack = data => itemParser.run(data).result;

export const toItemSNBT = itemStack => {
    const {item, blockstate, tag} = itemStack;



    return item + (
        blockstate 
        ?
        "[" + Object.entries(blockstate).map( a => a.join("=")).join(",") + "]"
        :
        ""
    ) + (
        tag
        ?
        toSNBT(tag)
        :
        ""
    )
}