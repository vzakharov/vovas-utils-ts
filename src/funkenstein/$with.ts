export function $with<T, R>(arg: T, fn: (arg: T) => R): R {
  return fn(arg);
}