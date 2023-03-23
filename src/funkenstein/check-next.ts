import { CommonTransformResultsFor, CommonTransforms } from "./common/transforms";
import { Transform, GuardedType, IsTypeguard, Checker } from "./types/checkers";

export type Check<IsRoot extends boolean, ReceivedSoFar, ReturnedSoFar> = {

  (arg: ReceivedSoFar): {

    if: {

      <
        Chkr extends Checker<ReceivedSoFar, any>,
        Trfm extends Transform<GuardedType<Chkr>, any>
      >
      (checker: Chkr, transform: Trfm):
        Check<
          false,
          IsTypeguard<Chkr> extends true
            ? Exclude<ReceivedSoFar, GuardedType<Chkr>>
            : ReceivedSoFar,
          ReturnedSoFar | ReturnType<Trfm>
        >;

    }

  } & IsRoot extends true ? {} : {

    else: {

      <
        Trfm extends Transform<ReceivedSoFar, any>
      >
      (transform: Trfm): ReturnedSoFar | ReturnType<Trfm>;

    } & CommonTransformResultsFor<ReceivedSoFar>

  };

};
