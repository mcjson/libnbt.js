import {
    between,
    many,
    sepBy,
    choice,
    char,
    sequenceOf,
    anyCharExcept,
    optionalWhitespace,
    regex
} from 'arcsecond';

export const typeMap = type => value => ({ type, value });

export const withinWhitespace = between(optionalWhitespace)(optionalWhitespace);

export const betweenSquareBrackets = parser => between(char('['))(char(']'))(withinWhitespace(parser));

export const joinedSequence = parsers => sequenceOf (parsers) .map(x => x.join(''));
export const joinedMany = parser => many (parser) .map(x => x.join(''));

export const betweenQuotes = between (char ('"')) (char ('"'));

export const betweenBrackets = parser => between(char('{'))(char('}'))(withinWhitespace(parser));

export const quotedString = betweenQuotes (joinedMany (choice ([
    joinedSequence ([
      char ('\\'),
      char ('"')
    ]),
    anyCharExcept (char ('"'))
  ])));


export const commaSeparated = sepBy(withinWhitespace(char(',')));


export const minecraftNamespacedKey = regex(/^(?:[a-z_0-9-\.]+:)?[a-z_0-9-\.\/]+$/).map( n => {
  const parts = n.split(":");
  if(parts.length == 1){
      parts.unshift("minecraft");
  }
  return parts.join(":");
})