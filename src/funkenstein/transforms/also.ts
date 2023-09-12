// Injects a handler based on an argument and returns that argument.
// E.g. `also(console.log)` is equivalent to `x => { console.log(x); return x; }`
//
// Useful for handling promises, e.g. `promise.then(also(console.log))` will resolve with the original value, but also log it.

export function also<T>(value: T, handler: (value: T) => void): T;
export function also<T>(handler: (value: T) => void): (value: T) => T;

export function also<T>(...args: [T, (value: T) => void] | [(value: T) => void]): T | ((value: T) => T) {

  const callback = args.length === 1 ? args[0] : args[1];
  const value = args.length === 1 ? undefined : args[0];

  const handle = (value: T) => (
    callback(value),
    value
  );

  return value === undefined
    ? handle
    : handle(value);

};