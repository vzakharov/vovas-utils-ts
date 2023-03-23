import { commonTransforms } from "../common/transforms";

export type Transform = (arg: any) => any;

export type TransformsFrom<Tfrm extends Transform> =
  Tfrm extends (arg: infer From) => any
    ? From
    : never;

export type TransformsTo<Tfrm extends Transform> =
  Tfrm extends (arg: any) => infer To
    ? To
    : never;

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