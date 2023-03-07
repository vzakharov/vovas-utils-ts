export type GoRecurse<TReturn, TArg> = (arg: TArg) => TReturn;

export type GoCallback<TReturn, TArg> = (recurse: GoRecurse<TReturn, TArg>, arg: TArg) => TReturn;

export function go<TReturn, TArg>(callback: GoCallback<TReturn, TArg>, arg: TArg): TReturn {
  const recurse: GoRecurse<TReturn, TArg> = (arg: TArg) => go(callback, arg);
  return callback(recurse, arg);
}

export function goer<TReturn, TArg>(callback: GoCallback<TReturn, TArg>): GoRecurse<TReturn, TArg> {
  return (arg: TArg) => go(callback, arg);
}

// Examples:
function examples() {

  // 1. Function to calculate the factorial with `goer`:
  const getFactorial = goer<number, number>((recurse, n) => n === 0 ? 1 : n * recurse(n - 1));
  console.log(getFactorial(5));
  
  // 2. Retry connecting to an endpoint five times with `go`:
  go<Promise<Response>, number>((retry, retriesLeft) => {
    try {
      return fetch("https://example.com");
    } catch (e) {
      if ( retriesLeft > 0 )
        return retry(retriesLeft - 1);
      else
        throw e;
    }
  }, 5).then(console.log);

}