export const toSNBT = (v) => {
    const {type, value} = v;
    switch(type){
        
        case 'byte': return value + "b";
        case 'short': return value + "s";
        case 'int': return value;
        case 'long': return value + "l";
        case 'float': return value + "f";
        case 'double': return value + "d";
        case 'byte_array': return `[B;${value.join(',')}]`;
        
        case 'string': return JSON.stringify(value);

        case 'list': return `[${value.map( v => toSNBT(v) ).join(',')}]`;
        case 'compound': return `{${Object.entries(value).map( ([k,v])=> `${k}:${toSNBT(v)}` ).join(",")}}`;
        
        case 'int_array': return `[I;${value.join(',')}]`;
        case 'long_array': return `[L;${value.join(',')}]`;

        default: {
            console.error("unknown type", JSON.stringify(v));
            const e = new Error(`unknown type ${type}`);
            e.value = v;
            throw e;
        }
    }
}