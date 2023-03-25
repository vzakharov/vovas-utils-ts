import _ from "lodash";
import { $throw, $thrower } from "../../$throw";
import { compileTimeError, shouldNotBe } from "../../shouldNotBe";

export const give = {

  // Value-ish transforms: e.g. `.else.itself` returns the original value without needing to wrap it in a function

  itself: <T>(arg: T): T => arg,
  themselves: <T extends any[]>(arrayArg: T): T => arrayArg,

  $,
  exactly: $,

  undefined: $(undefined as undefined),
  null: $(null as null),
  true: $(true as const),
  false: $(false as const),
  NaN: $(NaN),
  Infinity: $(Infinity),
  zero: $(0 as const),
  emptyString: $("" as const),
  emptyArray: $([] as const), 
  emptyObject: $({} as const),

  string: (arg: any): string => arg.toString(),
  array: <T>(arg: T): T[] => _.castArray(arg),
  keys: (arg: any) => _.keys(arg),
  json: (arg: any) => JSON.stringify(arg),

  lowerCase: (arg: string) => arg.toLowerCase(),
  upperCase: (arg: string) => arg.toUpperCase(),

  head: <T>(arg: T[]): T => {

    console.log("Give h**d? Ha-ha, very funny. But just in case you mean the first element, here you go.")

    return arg[0];

  },
  
  compileTimeError,

  // Function-ish transforms: e.g. `.else.throw("message")` throws an error with the given message

  throw: $thrower,
  error: $thrower,
  map: <T, R>(transform: (arg: T) => R) => (arg: T[]): R[] => arg.map(transform),

};

export const to = give;

export type CommonTransforms = typeof give;

export type CommonTransformKey = keyof CommonTransforms;

export function $<T>(arg: T): (...args: any[]) => T {
  return () => arg;
}