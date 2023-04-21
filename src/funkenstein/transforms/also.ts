// Injects a handler based on an argument and returns that argument.
// E.g. `also(console.log)` is equivalent to `x => { console.log(x); return x; }`
//
// Useful for handling promises, e.g. `promise.then(also(console.log))` will resolve with the original value, but also log it.

export function also<T>(handler: (value: T) => void): (value: T) => T {
  return value => (
    handler(value),
    value
  );
};