import _ from 'lodash';
import { isAmong, isArray, isCamelCase, isJsonable, isJsonableObject, isPrimitive, isTyped, Jsonable, JsonableObject, merge, Primitive } from '../..';
import { TypeguardMap } from '../TypeguardMap';
import { isLike } from './isLike';
import { not } from './not';

export const commonPredicates = {

  undefined: <T>(arg: T | undefined): arg is undefined => _.isUndefined(arg),
  null: <T>(arg: T | null): arg is null => _.isNull(arg),
  nil: <T>(arg: T | undefined | null): arg is undefined | null => _.isNil(arg),
  string: <T>(arg: T | string): arg is string => _.isString(arg),
  // string: <T>(arg: T): arg is T & string => _.isString(arg),
  emptyString: <T>(arg: T | ''): arg is '' => arg === '',
  number: <T>(arg: T | number): arg is number => _.isNumber(arg),
  zero: <T>(arg: T | 0): arg is 0 => arg === 0,
  boolean: <T>(arg: T | boolean): arg is boolean => _.isBoolean(arg),
  false: <T>(arg: T | false): arg is false => arg === false,
  true: <T>(arg: T | true): arg is true => arg === true,
  function: <T, F extends Function>(arg: T | F): arg is F => _.isFunction(arg),
  promise: <T, P extends Promise<any>>(arg: T | P): arg is P => arg instanceof Promise,
  object: <T>(arg: T | object): arg is object => _.isObject(arg),
  // object: <T>(arg: T): arg is T & object => _.isObject(arg),
  array: isArray,
  regexp: <T>(arg: T | RegExp): arg is RegExp => _.isRegExp(arg),
  // regexp: <T>(arg: T): arg is T & RegExp => _.isRegExp(arg),

  itself: <T>(arg: T): arg is T => true,

  primitive: <T>(arg: T | Primitive): arg is Primitive => isPrimitive(arg),
  jsonable: <T>(arg: T | Jsonable): arg is Jsonable => isJsonable(arg),
  jsonableObject: <T>(arg: T | JsonableObject): arg is JsonableObject => isJsonableObject(arg),

  defined: <T>(arg: T | undefined): arg is T => !_.isUndefined(arg),
  empty: <T extends { length: number }>(arg: T): arg is T & { length: 0 } => arg.length === 0,
  truthy: <T>(arg: T | undefined | null | false | 0 | '' ): arg is T => !!arg,
  falsy: <T>(arg: T | undefined | null | false | 0 | '' ): arg is undefined | null | false | 0 | '' => !arg,

  exactly: <T>(sample: T) => (
    (arg: any) => _.isEqual(arg, sample)
  ) as <U>(arg: U) => arg is T & U,
  above: (sample: number) => (arg: number) => arg > sample,
  below: (sample: number) => (arg: number) => arg < sample,
  atLeast: (sample: number) => (arg: number) => arg >= sample,
  atMost: (sample: number) => (arg: number) => arg <= sample,

  among: isAmong,

  match: <T extends object>(sample: T) => <U extends T>(arg: U) => _.isMatch(arg, sample),
  like: isLike,
  typed: isTyped,

  camelCase: isCamelCase,

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
    nil: not(is.nil),
    string: not(is.string),
    emptyString: not(is.emptyString),
    number: not(is.number),
    zero: not(is.zero),
    boolean: not(is.boolean),
    false: not(is.false),
    true: not(is.true),
    function: not(is.function),
    promise: not(is.promise),
    object: not(is.object),
    array: not(is.array),
    regexp: not(is.regexp),

    itself: not(is.itself), // funny ain't it?

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

    among: (options: any[]) => not(is.among(options)),

    like: (sample: TypeguardMap) => not(isLike(sample)),
    typed: <T extends string | number>(type: T) => not(isTyped(type)),
    match: <T extends object>(sample: T) => not(is.match(sample)),

    camelCase: not(is.camelCase),

    anything: not(is.anything),

  }
  // TODO: Find a way to make the above work in TS without having to manually type it out.
})) satisfies CommonPredicates & { not: CommonPredicateMap };

export const does = is;

export const isnt = is.not;
export const aint = is.not; // Alias
export const doesnt = does.not;

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