import { Transform } from "./check";
import { Checker, GuardedType, IsTypeguard } from "./types/checkers";
import { CommonTransformResultsFor } from "./types/transforms";

export type Check<IsRoot extends boolean, ReceivedSoFar, ReturnedSoFar> = {

  (arg: ReceivedSoFar): {

    if: {

      <
        Chkr extends Checker,
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
