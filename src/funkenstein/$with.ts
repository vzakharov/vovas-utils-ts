export function $with<Args extends any[]>(...args: Args) {

  return {
    do: <Result>(fn: (...args: Args) => Result) => fn(...args),
  };

};