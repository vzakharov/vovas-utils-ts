import { CommonCheckers } from "../common/checkers";
import { Checker, IsTypeguard, GuardedType } from "./checkers";
import { Transformable } from "./transformable";
import { CommonTransformResultsFor, Transform } from "./transforms";

export type Check<ReceivedSoFar, ReturnedSoFar, IsRoot extends boolean> = {

  (arg: ReceivedSoFar): {

    if: {

      <
        Chkr extends Checker,
        Trfm extends Transform
      >
      (checker: Chkr, transform: Trfm):
        Check<
          IsTypeguard<Chkr> extends true
            ? Exclude<ReceivedSoFar, GuardedType<Chkr>>
            : ReceivedSoFar,
          ReturnedSoFar | ReturnType<Trfm>,
          false
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

  } & IsRoot extends true ? {} : {

    // else: {

    //   <
    //     Trfm extends Transform<ReceivedSoFar, any>
    //   >
    //   (transform: Trfm): ReturnedSoFar | ReturnType<Trfm>;

    // } & CommonTransformResultsFor<ReceivedSoFar>

    else: Transformable<ReceivedSoFar, ReturnedSoFar, true>;

  };

};
