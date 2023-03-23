import _ from 'lodash';
import { objectWithKeys } from '../../objectWithKeys';
import { Not, not } from '../not';
import { Checker } from '../types/checkers';

export const guardedTypeSamples = {
  undefined: undefined as undefined,
  null: null as null,
  string: '',
  emptyString: '' as const,
  number: 0,
  zero: 0 as const,
  boolean: false,
  false: false as const,
  true: true as const,
  function: (() => {}) as (...args: any[]) => any,
  object: {} as object,
  array: [] as any[],
};
// The above is a hack to allow us to create both a type and an object that we can then map to create an object of typeguards. The values in the above object are not used, but they are required for TypeScript to infer the correct types (hence the many 'as' casts).

export type GuardedTypes = typeof guardedTypeSamples;

export type GuardedKey = keyof GuardedTypes;

export const guardedKeys: GuardedKey[] = Object.keys(guardedTypeSamples) as GuardedKey[];

export const commonCheckers = {

  ..._.mapValues(guardedTypeSamples,
    function checker<OtherType>(value: GuardedTypes[GuardedKey], key: GuardedKey) {

      function apply(arg: OtherType | GuardedTypes[GuardedKey]): arg is GuardedTypes[GuardedKey] {
        switch (key) {
          case 'null': return _.isNull(arg);
          case 'array': return _.isArray(arg);
          default: return typeof arg === key;
        }
      };

      return apply;

    }
  ) as unknown as {
    [K in GuardedKey]: <T>(arg: T | GuardedTypes[K]) => arg is GuardedTypes[K]
  },

  defined: <T>(arg: T | undefined): arg is T => !_.isUndefined(arg),
  empty: <T extends { length: number }>(arg: T): arg is T & { length: 0 } => arg.length === 0,

}

export type CommonCheckers = typeof commonCheckers;

export type CommonCheckerKey = keyof CommonCheckers;

export type CommonCheckerMap = {
  [K in CommonCheckerKey]: any
};


export const is = {
  ...commonCheckers,
  not: {
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
    undefined: not(commonCheckers.undefined),
    null: not(commonCheckers.null),
    defined: not(commonCheckers.defined),
    empty: not(commonCheckers.empty),
  } satisfies CommonCheckerMap
  // TODO: Find a way to make the above work without having to manually type it out.
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