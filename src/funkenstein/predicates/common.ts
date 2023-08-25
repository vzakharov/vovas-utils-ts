import _ from 'lodash';
import { isAmong, isArray, isCamelCase, isJsonable, isJsonableObject, isPrimitive, isTyped, Jsonable, JsonableObject, merge, Primitive } from '../..';
import { TypeguardMap } from '../TypeguardMap';
import { isLike } from './isLike';
import { not } from './not';


export function genericTypeguard<G>(predicate: ( (arg: any) => arg is G ) | ( (arg: any) => boolean ) ) {
  function typeguard<T>(arg: T | G): arg is G;
  function typeguard<T>(arg: T): arg is T & G;
  function typeguard<T, H extends G>(arg: T | H): arg is H;
  function typeguard(arg: any) {
    return predicate(arg);
  };

  return typeguard;
};

export type GenericTypeguard<G> = ReturnType<typeof genericTypeguard<G>>;

export function isExactly<T>(sample: T) {
  return genericTypeguard<T>(arg => _.isEqual(arg, sample));
};

export function isInstanceOf<C extends new (...args: any[]) => any>(constructor: C) {
  return genericTypeguard<InstanceType<C>>(arg => arg instanceof constructor);
};


export const commonPredicates = {

  undefined: genericTypeguard(_.isUndefined),
  null: genericTypeguard(_.isNull),
  nil: genericTypeguard(_.isNil),
  string: genericTypeguard(_.isString),
  emptyString: isExactly(''),
  number: genericTypeguard(_.isNumber),
  zero: isExactly(0),
  boolean: genericTypeguard(_.isBoolean),
  false: isExactly(false),
  true: isExactly(true),
  function: genericTypeguard(_.isFunction),
  promise: isInstanceOf(Promise<any>),
  object: genericTypeguard(_.isObject),
  array: isArray,
  regexp: genericTypeguard(_.isRegExp),

  itself: <T>(arg: T): arg is T => true,

  primitive: genericTypeguard(isPrimitive),
  jsonable: genericTypeguard(isJsonable),
  jsonableObject: genericTypeguard(isJsonableObject),

  defined: <T>(arg: T | undefined): arg is T => !_.isUndefined(arg),
  empty: <T extends { length: number }>(arg: T): arg is T & { length: 0 } => arg.length === 0,
  truthy: <T>(arg: T | undefined | null | false | 0 | '' ): arg is T => !!arg,
  falsy: <T>(arg: T | undefined | null | false | 0 | '' ): arg is undefined | null | false | 0 | '' => !arg,

  exactly: isExactly,
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