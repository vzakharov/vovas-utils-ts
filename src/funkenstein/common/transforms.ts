import { $throw, $thrower } from "../$throw";
import { shouldNotBe } from "../shouldNotBe";

export const commonTransforms = {

  // Value-ish transforms: e.g. `.else.itself` returns the original value without needing to wrap it in a function

  itself: <T>(arg: T): T => arg,
  themselves: <T extends any[]>(arrayArg: T): T => arrayArg,

  $,

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
  
  shouldNotBe,

  // Function-ish transforms: e.g. `.else.throw("message")` throws an error with the given message

  throw: $thrower,

};

export function $<T>(arg: T): (...args: any[]) => T {
  return () => arg;
}