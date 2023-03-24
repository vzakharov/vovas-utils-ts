import _ from 'lodash';
import { isJsonable, isJsonableObject, isPrimitive, Jsonable, JsonableObject, Primitive, respectively } from '../../..';
import { objectWithKeys } from '../../../objectWithKeys';
import { Not, not } from '../../not';
import { Checker } from '../types/checkers';

export const commonCheckers = {

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
    ( (arg: T) => _.isMatch(arg, sample) ) as (arg: T) => arg is T & U

}

export type CommonCheckers = typeof commonCheckers;

export type CommonCheckerKey = keyof CommonCheckers;

export type CommonCheckerMap = {
  [K in CommonCheckerKey]: any
};


export const is = {
  ...commonCheckers,
  not: {
    undefined: not(commonCheckers.undefined),
    null: not(commonCheckers.null),
    string: not(commonCheckers.string),
    emptyString: not(commonCheckers.emptyString),
    number: not(commonCheckers.number),
    zero: not(commonCheckers.zero),
    boolean: not(commonCheckers.boolean),
    false: not(commonCheckers.false),
    true: not(commonCheckers.true),
    function: not(commonCheckers.function),
    object: not(commonCheckers.object),
    array: not(commonCheckers.array),

    primitive: not(commonCheckers.primitive),
    jsonable: not(commonCheckers.jsonable),
    jsonableObject: not(commonCheckers.jsonableObject),

    defined: not(commonCheckers.defined),
    empty: not(commonCheckers.empty),
    truthy: not(commonCheckers.truthy),
    falsy: not(commonCheckers.falsy),

    exactly: <T>(sample: T) => not(commonCheckers.exactly(sample)),
    above: (sample: number) => not(commonCheckers.above(sample)),
    below: (sample: number) => not(commonCheckers.below(sample)),
    atLeast: (sample: number) => not(commonCheckers.atLeast(sample)),
    atMost: (sample: number) => not(commonCheckers.atMost(sample)),

    like: <U extends object>(sample: U) => not(commonCheckers.like(sample))

  } satisfies CommonCheckerMap
  // TODO: Find a way to make the above work in TS without having to manually type it out.
}

// Tests:
function test(x: number | null) {

  if ( is.null(x) ) {
    x; // null
  } else {
    x; // number
  }

  if ( not(is.null)(x) ) {
    x; // number
  } else {
    x; // null
  }

  if ( is.not.null(x) ) {
    x; // number
  }

}