export function $with<Args extends any[], Result>(...args: Args) {

  return {
    do: (fn: (...args: Args) => Result) => fn(...args),
  };

};