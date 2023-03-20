import { Arg, Arg2, Arg3, Arg4, Arg5, FunctionThatReturns, Return } from "./types";


export function reverseArgs<Func extends (arg: any, arg2: any) => any>( func: Func ):
  ( arg2: Arg2<Func>, arg: Arg<Func> ) => Return<Func>;

export function reverseArgs<Func extends (arg: any, arg2: any, arg3: any) => any>( func: Func ):
  ( arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func> ) => Return<Func>;

export function reverseArgs<Func extends (arg: any, arg2: any, arg3: any, arg4: any) => any>( func: Func ):
  ( arg4: Arg4<Func>, arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func> ) => Return<Func>;

export function reverseArgs<Func extends (arg: any, arg2: any, arg3: any, arg4: any, arg5: any) => any>( func: Func ):
  ( arg5: Arg5<Func>, arg4: Arg4<Func>, arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func> ) => Return<Func>;

export function reverseArgs<Func extends FunctionThatReturns<any>>(
  func: Func
): (...args: any[]) => Return<Func> {
  return (...args: any[]) => func(...args.reverse());
}