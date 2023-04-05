import _ from "lodash";
import { Typeguard, NonTypeguard, Transform } from "../typings";

// getter
export function its<Key extends keyof Obj, Obj extends object>(
  key: Key
): Transform<Obj, Obj[Key]>;

// with typeguard
export function its<Key extends keyof Obj, Guarded extends Obj[Key], Obj extends object>(
  key: Key, 
  typeguard: Typeguard<Obj[Key], Guarded>
): Typeguard<Obj, Obj & { [K in Key]: Guarded }>;

// with non-typeguard predicate
export function its<Key extends keyof Obj, Obj extends object>(
  key: Key,
  predicate: NonTypeguard<Obj[Key]>
): NonTypeguard<Obj>;

// with literal type
export function its<Key extends keyof Obj, Value extends Obj[Key], Obj extends object>(
  key: Key,
  value: Value
): Typeguard<Obj, Obj & { [K in Key]: Value }>;

export function its(
  key: any,
  predicateOrValue?: any
) {
  return _.isUndefined(predicateOrValue)
    ? (
      (arg: any) => arg[key]
    )
    : _.isFunction(predicateOrValue)
    ? (
      (arg: any) => predicateOrValue(arg[key])
    )
    : (
      (arg: any) => arg[key] === predicateOrValue
    );
};