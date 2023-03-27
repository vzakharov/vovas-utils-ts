import _ from 'lodash';
import { isJsonable, isJsonableObject, isPrimitive, Jsonable, JsonableObject, merge, Primitive } from '../..';
import { not } from './not';

export const commonPredicates = {

  undefined: <T>(arg: T | undefined): arg is undefined => _.isUndefined(arg),
  null: <T>(arg: T | null): arg is null => _.isNull(arg),
  string: <T>(arg: T | string): arg is string => _.isString(arg),
  emptyString: <T>(arg: T | ''): arg is '' => arg === '',
  number: <T>(arg: T | number): arg is number => _.isNumber(arg),
  zero: <T>(arg: T | 0): arg is 0 => arg === 0,
  boolean: <T>(arg: T | boolean): arg is boolean => _.isBoolean(arg),
  false: <T>(arg: T | false): arg is false => arg === false,
  true: <T>(arg: T | true): arg is true => arg === true,
  function: <T>(arg: T | ((...args: any[]) => any)): arg is (...args: any[]) => any => _.isFunction(arg),
  object: <T>(arg: T | object): arg is object => _.isObject(arg),
  array: <T>(arg: T | any[]): arg is any[] => _.isArray(arg),

  primitive: <T>(arg: T | Primitive): arg is Primitive => isPrimitive(arg),
  jsonable: <T>(arg: T | Jsonable): arg is Jsonable => isJsonable(arg),
  jsonableObject: <T>(arg: T | JsonableObject): arg is JsonableObject => isJsonableObject(arg),

  defined: <T>(arg: T | undefined): arg is T => !_.isUndefined(arg),
  empty: <T extends { length: number }>(arg: T): arg is T & { length: 0 } => arg.length === 0,
  truthy: <T>(arg: T | undefined | null | false | 0 | '' ): arg is T => !!arg,
  falsy: <T>(arg: T | undefined | null | false | 0 | '' ): arg is undefined | null | false | 0 | '' => !arg,

  exactly: <T>(sample: T) => (arg: T) => _.isEqual(arg, sample),
  above: (sample: number) => (arg: number) => arg > sample,
  below: (sample: number) => (arg: number) => arg < sample,
  atLeast: (sample: number) => (arg: number) => arg >= sample,
  atMost: (sample: number) => (arg: number) => arg <= sample,

  like: <T extends object, U extends object>(sample: U) =>
    ( (arg: T) => _.isMatch(arg, sample) ) as (arg: T) => arg is T & U,

  describing: (string: string) => (regex: RegExp) => regex.test(string),
  
  anything: (...args: any[]): true => true,

}

export type CommonPredicates = typeof commonPredicates;

export type CommonPredicateName = keyof CommonPredicates;

export type CommonPredicateMap = {
  [K in CommonPredicateName]: any
};


export const is = merge(commonPredicates, is => ({
  not: {
    undefined: not(is.undefined),
    null: not(is.null),
    string: not(is.string),
    emptyString: not(is.emptyString),
    number: not(is.number),
    zero: not(is.zero),
    boolean: not(is.boolean),
    false: not(is.false),
    true: not(is.true),
    function: not(is.function),
    object: not(is.object),
    array: not(is.array),

    primitive: not(is.primitive),
    jsonable: not(is.jsonable),
    jsonableObject: not(is.jsonableObject),

    defined: not(is.defined),
    empty: not(is.empty),
    truthy: not(is.truthy),
    falsy: not(is.falsy),

    exactly: <T>(sample: T) => not(is.exactly(sample)),
    above: (sample: number) => not(is.above(sample)),
    below: (sample: number) => not(is.below(sample)),
    atLeast: (sample: number) => not(is.atLeast(sample)),
    atMost: (sample: number) => not(is.atMost(sample)),

    like: <U extends object>(sample: U) => not(is.like(sample)),
    describing: (string: string) => (regex: RegExp) => not(is.describing(string)),

    anything: not(is.anything),

  }
  // TODO: Find a way to make the above work in TS without having to manually type it out.
})) satisfies CommonPredicates & { not: CommonPredicateMap };

export const isnt = is.not;
export const aint = is.not; // Alias

// Tests:
// function test(x: number | null) {

//   if ( is.null(x) ) {
//     x; // null
//   } else {
//     x; // number
//   }

//   if ( not(is.null)(x) ) {
//     x; // number
//   } else {
//     x; // null
//   }

//   if ( is.not.null(x) ) {
//     x; // number
//   }

// }