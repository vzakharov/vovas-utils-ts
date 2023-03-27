import { CommonCheckers } from "../common/checkers";
import { Checker, IsTypeguard, GuardedType } from "./checkers";
import { Transformable } from "./transformable";
import { CommonTransformResultsFor, Transform } from "./transforms";

export interface Check<ReceivedSoFar, ReturnedSoFar> {

  if: {

    <
      Chkr extends Checker,
      Trfm extends Transform
    >
    (checker: Chkr, transform: Trfm):
      NextCheck<
        IsTypeguard<Chkr> extends true
          ? Exclude<ReceivedSoFar, GuardedType<Chkr>>
          : ReceivedSoFar,
        ReturnedSoFar | ReturnType<Trfm>
      >;

  } & {

    [K in keyof CommonCheckers]:
      CommonCheckers[K] extends ( ( arg: any ) => arg is any ) | ( ( arg: any ) => boolean )
        ? {

          then: Transformable<
            CommonCheckers[K] extends ( ( arg: any ) => arg is infer Guarded )
              ? Exclude<ReceivedSoFar, Guarded>
              : ReceivedSoFar,
            ReturnedSoFar,
            false
          >;

        }
        : CommonCheckers[K] extends ( ...makerArgs: infer MakerArgs ) => any
          ? ( ...makerArgs: MakerArgs ) => {

            then: Transformable<
              CommonCheckers[K] extends (
                ( ...makerArgs: any ) => ( arg: any ) => arg is infer Guarded
              )
                ? Exclude<ReceivedSoFar, Guarded>
                : ReceivedSoFar,
              ReturnedSoFar,
              false
            >;
            
          }
          : never;

  }
};


export interface NextCheck<ReceivedSoFar, ReturnedSoFar> extends Check<ReceivedSoFar, ReturnedSoFar> {

  else: Transformable<ReceivedSoFar, ReturnedSoFar, true>
  
};
