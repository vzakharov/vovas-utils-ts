import { Predicate } from "../typings";

export function not<Base, Guarded extends Base>(typeguard: (arg: Base) => arg is Guarded):
  (arg: Base) => arg is Exclude<Base, Guarded>;

export function not<T>(predicate: (arg: T) => true):
  (arg: T) => false;

export function not<T>(predicate: (arg: T) => false):
  (arg: T) => true;

export function not<T>(predicate: (arg: T) => boolean):
  (arg: T) => boolean;

export function not<Arg>(predicate: Predicate<Arg>) {
  return (arg: Arg) => !predicate(arg);
};

export type Not<P extends Predicate> =
  P extends ( (arg: infer Base) => arg is any ) | ( (arg: infer Base) => boolean )
    ? P extends ( (arg: any) => arg is infer Guarded )
      ? (arg: Base) => arg is Exclude<Base, Guarded>
      : (arg: Base) => boolean
    : never;

// Test:
// function test(x: Primitive ) {

//   const isNumber = (x: Primitive): x is number => typeof x === "number";
//   const isPositive = (x: number): boolean => x > 0;

//   if ( not(isNumber)(x) ) {
//     x; // string | boolean | null | undefined
//   } else {
//     x; // number -- type narrowed
//     if ( not(isPositive)(x) ) {
//       x; // still number -- no type narrowing
//     }
//   }

// };
