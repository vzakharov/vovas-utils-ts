export function chain<From, Via extends any[], To>(
  ...fns:
    Via extends [infer Via1] ? [(from: From) => Via1, (via1: Via1) => To] :
    Via extends [infer Via1, infer Via2] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => To] :
    Via extends [infer Via1, infer Via2, infer Via3] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => Via3, (via3: Via3) => To] :
    Via extends [infer Via1, infer Via2, infer Via3, infer Via4] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => Via3, (via3: Via3) => Via4, (via4: Via4) => To] :
    Via extends [infer Via1, infer Via2, infer Via3, infer Via4, infer Via5] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => Via3, (via3: Via3) => Via4, (via4: Via4) => Via5, (via5: Via5) => To] :
    Via extends [infer Via1, infer Via2, infer Via3, infer Via4, infer Via5, infer Via6] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => Via3, (via3: Via3) => Via4, (via4: Via4) => Via5, (via5: Via5) => Via6, (via6: Via6) => To] :
    Via extends [infer Via1, infer Via2, infer Via3, infer Via4, infer Via5, infer Via6, infer Via7] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => Via3, (via3: Via3) => Via4, (via4: Via4) => Via5, (via5: Via5) => Via6, (via6: Via6) => Via7, (via7: Via7) => To] :
    Via extends [infer Via1, infer Via2, infer Via3, infer Via4, infer Via5, infer Via6, infer Via7, infer Via8] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => Via3, (via3: Via3) => Via4, (via4: Via4) => Via5, (via5: Via5) => Via6, (via6: Via6) => Via7, (via7: Via7) => Via8, (via8: Via8) => To] :
    Via extends [infer Via1, infer Via2, infer Via3, infer Via4, infer Via5, infer Via6, infer Via7, infer Via8, infer Via9] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => Via3, (via3: Via3) => Via4, (via4: Via4) => Via5, (via5: Via5) => Via6, (via6: Via6) => Via7, (via7: Via7) => Via8, (via8: Via8) => Via9, (via9: Via9) => To] :
    Via extends [infer Via1, infer Via2, infer Via3, infer Via4, infer Via5, infer Via6, infer Via7, infer Via8, infer Via9, infer Via10] ? [(from: From) => Via1, (via1: Via1) => Via2, (via2: Via2) => Via3, (via3: Via3) => Via4, (via4: Via4) => Via5, (via5: Via5) => Via6, (via6: Via6) => Via7, (via7: Via7) => Via8, (via8: Via8) => Via9, (via9: Via9) => Via10, (via10: Via10) => To] :
    never
): (from: From) => To {
  return (from: From) => {
    let result = from as any;
    for (const fn of fns) {
      result = fn(result);
    }
    return result as To;
  };
}
