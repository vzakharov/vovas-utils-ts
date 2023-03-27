export function $do<FirstArg, RestArgs extends any[], Result>(
  fn: (firstArg: FirstArg, ...restArgs: RestArgs) => Result,
  restArgs: RestArgs
): (firstArg: FirstArg) => Result {
  return (firstArg: FirstArg) => fn(firstArg, ...restArgs);
}