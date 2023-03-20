import { Arg, Arg1of2, Arg1of3, Arg1of4, Arg2of3, Arg2of4, Arg3of3, Arg3of4, Arg4of4, Return, Target } from "./types";

export function wrap<Func extends (...args: any[]) => any>(
  func: Func,
  arg: Arg<Func>
): (
  target: Target<Func>,
) => Return<Func>;

export function wrap<Func extends (...args: any[]) => any>(
  func: Func,
  arg1: Arg1of2<Func>,
  arg2: Arg<Func>,
): (
  target: Target<Func>,
) => Return<Func>;

export function wrap<Func extends (...args: any[]) => any>(
  func: Func,
  arg1: Arg1of3<Func>,
  arg2: Arg2of3<Func>,
  arg3: Arg3of3<Func>,
): (
  target: Target<Func>,
) => Return<Func>;

export function wrap<Func extends (...args: any[]) => any>(
  func: Func,
  arg1: Arg1of4<Func>,
  arg2: Arg2of4<Func>,
  arg3: Arg3of4<Func>,
  arg4: Arg4of4<Func>,
): (
  target: Target<Func>,
) => Return<Func>;

export function wrap<Func extends (...args: any[]) => any>(
  func: Func,
  ...args: any[]
) {
  return (target: any) => func(target, ...args);
}
