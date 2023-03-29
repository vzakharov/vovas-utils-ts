export type ChainedFunctions<From, Via, To> =
  Via extends [infer Via1] ? [(from: From) => Via1, (via1: Via1) => To] :
  Via extends [infer Via1, ...infer ViaRest] ? [(from: From) => Via1, ...ChainedFunctions<Via1, ViaRest, To>] :
  never;

export function chain<From, Via, To>(...fns: ChainedFunctions<From, [Via], To>): (from: From) => To;
export function chain<From, Via1, Via2, To>(...fns: ChainedFunctions<From, [Via1, Via2], To>): (from: From) => To;
export function chain<From, Via1, Via2, Via3, To>(...fns: ChainedFunctions<From, [Via1, Via2, Via3], To>): (from: From) => To;
export function chain<From, Via1, Via2, Via3, Via4, To>(...fns: ChainedFunctions<From, [Via1, Via2, Via3, Via4], To>): (from: From) => To;
export function chain<From, Via1, Via2, Via3, Via4, Via5, To>(...fns: ChainedFunctions<From, [Via1, Via2, Via3, Via4, Via5], To>): (from: From) => To;
export function chain<From, Via1, Via2, Via3, Via4, Via5, Via6, To>(...fns: ChainedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6], To>): (from: From) => To;
export function chain<From, Via1, Via2, Via3, Via4, Via5, Via6, Via7, To>(...fns: ChainedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6, Via7], To>): (from: From) => To;
export function chain<From, Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, To>(...fns: ChainedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8], To>): (from: From) => To;
export function chain<From, Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, Via9, To>(...fns: ChainedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, Via9], To>): (from: From) => To;
export function chain<From, Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, Via9, Via10, To>(...fns: ChainedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, Via9, Via10], To>): (from: From) => To;

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
