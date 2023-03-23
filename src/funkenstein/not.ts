import _ from "lodash";
import { Primitive } from "../types";
import { BaseType, Checker, GuardedType, IsTypeguard, PostGuardedType } from "./types/checkers";

export function not<Base, Guarded extends Base>(typeguard: (arg: Base) => arg is Guarded):
  (arg: Base) => arg is Exclude<Base, Guarded>;

export function not<T>(predicate: (arg: T) => boolean):
  (arg: T) => boolean;

export function not<Chkr extends Checker>(checker: Chkr) {
  return (arg: BaseType<Chkr>) => !checker(arg);
};

export type Not<Chkr extends Checker> =
  Chkr extends ( (arg: infer Base) => arg is any ) | ( (arg: infer Base) => boolean )
    ? Chkr extends ( (arg: any) => arg is infer Guarded )
      ? (arg: Base) => arg is Exclude<Base, Guarded>
      : (arg: Base) => boolean
    : never;

// Test:
function test(x: Primitive ) {

  const isNumber = (x: Primitive): x is number => typeof x === "number";
  const isPositive = (x: number): boolean => x > 0;

  if ( not(isNumber)(x) ) {
    x; // string | boolean | null | undefined
  } else {
    x; // number -- type narrowed
    if ( not(isPositive)(x) ) {
      x; // still number -- no type narrowing
    }
  }

};
