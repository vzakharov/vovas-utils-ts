import { Check } from "./check";
import { CommonTransforms } from "./transforms";

export type Transformable<ReceivedSoFar, ReturnedSoFar, IsFinal extends boolean> = {

  <Returns>( transform: ( arg: ReceivedSoFar ) => Returns ):
    IsFinal extends true
      ? ReturnedSoFar | Returns
      : Check<ReceivedSoFar, ReturnedSoFar | Returns, false>;

} & {

  [K in keyof CommonTransforms]:
    CommonTransforms[K] extends ( ...makerArgs: infer MakerArgs ) => ( arg: ReceivedSoFar ) => infer Returns
      ? ( ...makerArgs: MakerArgs ) =>
        IsFinal extends true
          ? ReturnedSoFar | Returns
          : Check<ReceivedSoFar, ReturnedSoFar | Returns, false>
      : CommonTransforms[K] extends ( arg: ReceivedSoFar ) => infer Returns
        ? IsFinal extends true
          ? ReturnedSoFar | Returns
          : Check<ReceivedSoFar, ReturnedSoFar | Returns, false>
        : never;

}