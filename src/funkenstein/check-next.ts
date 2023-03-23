import { Transform } from "./check";
import { CommonCheckers } from "./common/checkers";
import { Transformable } from "./transformables";
import { Checker, GuardedType, IsTypeguard } from "./types/checkers";
import { Maker } from "./types/misc";
import { CommonTransformResultsFor } from "./types/transforms";

export type Check<ReceivedSoFar, ReturnedSoFar, IsRoot extends boolean> = {

  (arg: ReceivedSoFar): {

    if: {

      <
        Chkr extends Checker,
        Trfm extends Transform<GuardedType<Chkr>, any>
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
