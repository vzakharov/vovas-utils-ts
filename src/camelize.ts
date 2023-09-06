import _ from "lodash";
import { is } from "./funkenstein";

export type Camelized<T, CamelizeStrings extends boolean = true> =
  T extends string
    ? CamelizeStrings extends true
      ? T extends `${infer U}_${infer V}`
        ? `${Lowercase<U>}${Capitalize<Camelized<V>>}`
        : Lowercase<T>
      : T
    : T extends object[]
      ? Camelized<T[number]>[]
      : T extends object
        ? {
          [K in keyof T as Camelized<K & string>]: Camelized<T[K], false>;
          // (I.e., we don't want to camelize actual values that are strings)
        }
        : T;

export const camelize = <T>(target: T): Camelized<T> => (
  is.string(target)
    ? target.replace(/_([a-z])/g, (__, char) => char.toUpperCase())
    : is.array(target)
      ? target.map(camelize)
      : is.object(target)
        ? _.mapKeys(target, (__, key) => camelize(key))
        : target
) as Camelized<T>;

export function isCamelCase<T>(target: T | Camelized<T>): target is Camelized<T> {
  return JSON.stringify(target) === JSON.stringify(camelize(target));
};