import { exactU8, s16BE, s32BE, s8, u8, u32BE } from 'arcsecond-binary';
import { sequenceOf, exactly, takeLeft, many, fail, succeedWith } from 'arcsecond';

const tagNameList = [
    "end",
    "byte",
    "short",
    "int",
    "long",
    "float",
    "double",
    "byteArray",
    "string",
    "list",
    "compound",
    "intArray",
    "longArray"
]

const prefixedLength = pLength => pArray => pLength.chain( len => len == 0 ? succeedWith([]) : exactly(len)(pArray))

const type = type => p => p; //.map( v => ( {[type]: v } ))

const prefixedString = prefixedLength(s16BE)(u8).map( v => v.map( e => String.fromCharCode(e)).join('') );

const namedTag = s8.chain( type => {
    if(tagsList[type] == null){
        throw new Error(`invalid type of ${type} found.`);
    }
    if(type == 0){
        console.log("Hit end tag");
        return fail('END_TAG');
    }
    return sequenceOf([
        prefixedString,
        tagsList[type],
    ]).map( ([name, value]) => ({ name, value}))
});

const endTag = exactU8(0);
const byteTag =  type("byte")(s8);
const shortTag =  type("short")(s16BE);
const intTag =  type("int")(s32BE);
const longTag =  type("long")(exactly(8)(u8).map( v => (new DataView( (new Uint8Array(v)).buffer )).getBigInt64(0,false) ) );

const floatTag =  type("float")( exactly(4)(u8).map( v => (new DataView( (new Uint8Array(v)).buffer )).getFloat32(0,false) ) );
const doubleTag =  type("double")(exactly(8)(u8).map( v => (new DataView( (new Uint8Array(v)).buffer )).getFloat64(0,false) ) );

const byteArrayTag = type("byteArray")(prefixedLength(s32BE)(s8));
const stringTag = type("string")(prefixedString);
const listTag = type("list")(sequenceOf([s8, s32BE]).chain( ([type, len]) => {
    console.log(`LIST: ${tagNameList[type]}[${len}]`);
    return len == 0 ? succeedWith([]) : exactly(len)(tagsList[type]);
})).map( v => {
    console.log("list", v)
    return v;
});

const compoundTag = takeLeft(many(namedTag))(endTag).map( v => {
    console.log("COMPOUND_FORMED");
    return v.reduce((o, {name, value}) => ({...o, [name]: value}), {})
});

const intArrayTag = type("intArray")(prefixedLength(s32BE)(s32BE));
const longArrayTag = type("longArray")(prefixedLength(s32BE)(longTag));




const tagsList = [
    endTag,
    byteTag,
    shortTag,
    intTag,
    longTag,
    floatTag,
    doubleTag,
    byteArrayTag,
    stringTag,
    listTag,
    compoundTag,
    intArrayTag,
    longArrayTag
]
export const taggedNBT = (b, parser) => sequenceOf([
    exactU8(b),
    stringTag,
    parser
]);


export const parseNBT = data => namedTag.run(data)