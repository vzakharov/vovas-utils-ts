export type ChainedFunctions<From, Via, To> =
  Via extends [infer Via1] ? [(from: From) => Via1, (via1: Via1) => To] :
  Via extends [infer Via1, ...infer ViaRest] ? [(from: From) => Via1, ...ChainedFunctions<Via1, ViaRest, To>] :
  never;

export function chain<From, Via extends any[], To>(
  ...fns: ChainedFunctions<From, Via, To>
): (from: From) => To {
  return (from: From) => {
    let result = from as any;
    for (const fn of fns) {
      result = fn(result);
    }
    return result as To;
  };
}
