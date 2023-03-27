export function $do<Arg1, Arg2, Result>(
  fn: (arg1: Arg1, arg2: Arg2) => Result,
  arg2: Arg2
): ( target: Arg1 ) => Result

export function $do<Arg1, Arg2, Arg3, Result>(
  fn: (arg1: Arg1, arg2: Arg2, arg3: Arg3) => Result,
  arg2: Arg2,
  arg3: Arg3
): ( target: Arg1 ) => Result

export function $do<Function extends (...args: any[]) => any>(
  fn: Function,
  ...args: Parameters<Function>
) {
  return ( target: Parameters<Function>[0] ) => fn(target, ...args);
}

export const wrap = $do; // Alias