import { Arg, Arg2, Arg3, Arg4, Arg5, FunctionThatReturns, Return } from "./types";

export function wrap<Func extends FunctionThatReturns<any>>(
  func: Func,
  arg2: Arg2<Func>
): ( arg: Arg<Func> ) => Return<Func>;

export function wrap<Func extends FunctionThatReturns<any>>(
  func: Func,
  arg2: Arg2<Func>,
  arg3: Arg3<Func>
): ( arg: Arg<Func> ) => Return<Func>;

export function wrap<Func extends FunctionThatReturns<any>>(
  func: Func,
  arg2: Arg2<Func>,
  arg3: Arg3<Func>,
  arg4: Arg4<Func>
): ( arg: Arg<Func> ) => Return<Func>;

export function wrap<Func extends FunctionThatReturns<any>>(
  func: Func,
  arg2: Arg2<Func>,
  arg3: Arg3<Func>,
  arg4: Arg4<Func>,
  arg5: Arg5<Func>
): ( arg: Arg<Func> ) => Return<Func>;


export function wrap<Func extends (...args: any[]) => any>(
  func: Func,
  ...args: any[]
) {
  return (target: any) => func(target, ...args);
}
