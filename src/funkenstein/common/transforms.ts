import { $throw } from "../$throw";
import { shouldNotBe } from "../shouldNotBe";

export const commonTransforms = {

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
  
  throw: $throw,

  shouldNotBe

};

export function $<T>(arg: T): (...args: any[]) => T {
  return () => arg;
}

export type CommonTransforms = typeof commonTransforms;

export type CommonTransformsFor<ReceivedSoFar> = {
  [K in keyof CommonTransforms]: CommonTransforms[K] extends (arg: ReceivedSoFar) => any
    ? CommonTransforms[K]
    : never
};

export type CommonTransformResultsFor<ReceivedSoFar, IgnoreOriginalReturnTypes extends boolean = false> = {
  [K in keyof CommonTransformsFor<ReceivedSoFar>]: 
    IgnoreOriginalReturnTypes extends true 
      ? any
      : ReturnType<CommonTransformsFor<ReceivedSoFar>[K]>
};