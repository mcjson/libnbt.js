import { exactU8, s16BE, s32BE, s8, u8, u32BE } from 'arcsecond-binary';
import { sequenceOf, exactly, takeLeft, many, fail, succeedWith } from 'arcsecond';
import pako from "pako";

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

const type = type => p => p.map( value => ({type, value}))

const prefixedString = prefixedLength(s16BE)(u8).map( v => v.map( e => String.fromCharCode(e)).join('') );

const namedTag = s8.chain( type => {
    if(tagsList[type] == null){
        throw new Error(`invalid type of ${type} found.`);
    }
    if(type == 0){
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

const byteArrayTag = type("byte_array")(prefixedLength(s32BE)(s8).map( v => new Int8Array(v)));
const stringTag = type("string")(prefixedString);
const listTag = type("list")(sequenceOf([s8, s32BE]).chain( ([type, len]) => len == 0 ? succeedWith([]) : exactly(len)(tagsList[type]) ));

const compoundTag = takeLeft(many(namedTag))(endTag).map( v => {
    return v.reduce((o, {name, value}) => ({...o, [name]: value}), {})
});

const intArrayTag = type("int_array")(prefixedLength(s32BE)(s32BE));
const longArrayTag = type("long_array")(prefixedLength(s32BE)(longTag));




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


export const parseNBT = data => {
    const view = new Uint8Array(data);
    if (view[0] == 0x1f && view[1] == 0x8b) {
        console.log("GZIP detected, inflating");
        data = pako.inflate(data);
    }
    return namedTag.map( ({name, value}) => {
    if(name == ""){
        return value;
    }else{
        return ({ [name]: value });
    }
}).run(data).result;
}