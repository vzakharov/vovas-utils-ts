export type MethodKey<T, Args extends any[], Result> = {
  [K in keyof T]: T[K] extends (...args: Args) => Result ? K : never
}[keyof T];

// export type TestMethodKey = MethodKey<{
//   a: (a: number) => number;
//   b: (a: string) => string;
//   c: (a: number, b: string) => number;
//   d: number;
// }, [number, string], number>; // expect: 'a' | 'c' ('a' as well because [number, string] is also assignable to [number]).

export function $do<Arg1, Arg2, Result>(
  fn: (arg1: Arg1, arg2: Arg2) => Result,
  arg2: Arg2
): ( target: Arg1 ) => Result

export function $do<Arg1, Arg2, Result>(
  key: MethodKey<Arg1, [Arg2], Result>,
  arg2: Arg2
): ( target: Arg1 ) => Result

export function $do<Arg1, Arg2, Arg3, Result>(
  fn: (arg1: Arg1, arg2: Arg2, arg3: Arg3) => Result,
  arg2: Arg2,
  arg3: Arg3
): ( target: Arg1 ) => Result

export function $do<Arg1, Arg2, Arg3, Result>(
  key: MethodKey<Arg1, [Arg2, Arg3], Result>,
  arg2: Arg2,
  arg3: Arg3
): ( target: Arg1 ) => Result

export function $do(
  fnOrKey: ((...args: any[]) => any) | string,
  ...args: any[]
) {
  return typeof fnOrKey === 'string'
    ? (target: any) => target[fnOrKey](...args)
    : (target: any) => fnOrKey(target, ...args);
}

export const wrap = $do; // Alias