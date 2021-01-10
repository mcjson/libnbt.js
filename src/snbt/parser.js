import {
    sequenceOf,
    endOfInput
} from 'arcsecond';

import { compoundTag } from './collections';




export const parseSNBT = data => sequenceOf([compoundTag, endOfInput]).run(data).result;