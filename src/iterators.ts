import { StringKey } from "./types";

export type IteratorArgs<T extends object, R> = [
  object: T,
  callback: <K extends StringKey<T>>(value: T[K], key: K) => R
]

export function forEach<T extends object>(...[object, callback]: IteratorArgs<T, void>) {
  for (const key in object) {
    callback(object[key], key);
  }
};

export function map<T extends object, R>(...[object, callback]: IteratorArgs<T, R>) {
  const result: R[] = [];
  forEach(object, (value, key) => {
    result.push(callback(value, key));
  });
  return result;
};

export function every<T extends object>(...[object, callback]: IteratorArgs<T, boolean>) {
  return everyOrAny(object, callback, true);
};

export function any<T extends object>(...[object, callback]: IteratorArgs<T, boolean>) {
  return everyOrAny(object, callback, false);
};

function everyOrAny<T extends object>(...[object, callback, every]: [...IteratorArgs<T, boolean>, boolean]) {
  for (const key in object) {
    if (callback(object[key], key) !== every) return !every;
  }
  return every;
};