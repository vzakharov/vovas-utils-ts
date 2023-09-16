// Injects a handler based on an argument and returns that argument.
// E.g. `also(console.log)` is equivalent to `x => { console.log(x); return x; }`
//
// Useful for handling promises, e.g. `promise.then(also(console.log))` will resolve with the original value, but also log it.

export function also<T>(value: T, handler: (value: T) => void): T;
export function also<T>(handler: (value: T) => void): <U extends T>(value: U) => U;

export function also(...args: any[]) {

  const callback = args.length === 1 ? args[0] : args[1];
  const value = args.length === 1 ? undefined : args[0];

  const handle = <T>(value: T) => (
    callback(value),
    value
  );

  return args.length === 1
    ? handle
    : handle(value);

};

export function alsoLog(prefix: string, doLog?: boolean) {
  return <T>(value: T) => (
    doLog && console.log(prefix, value),
    value
  );
}