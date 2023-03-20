// import { Arg, Arg2, Arg3, Arg4, Arg5, FunctionThatReturns, Return } from "./types";
import { FunctionThatReturns } from "./types";


// export function reverseArgs<Func extends (arg: any, arg2: any) => any>( func: Func ):
//   ( arg2: Arg2<Func>, arg: Arg<Func> ) => Return<Func>;
export function reverseArgs<Arg, Arg2, Result>( func: (arg: Arg, arg2: Arg2) => Result ):
  ( arg2: Arg2, arg: Arg ) => Result;

// export function reverseArgs<Func extends (arg: any, arg2: any, arg3: any) => any>( func: Func ):
//   ( arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func> ) => Return<Func>;
export function reverseArgs<Arg, Arg2, Arg3, Result>( func: (arg: Arg, arg2: Arg2, arg3: Arg3) => Result ):
  ( arg3: Arg3, arg2: Arg2, arg: Arg ) => Result;

// export function reverseArgs<Func extends (arg: any, arg2: any, arg3: any, arg4: any) => any>( func: Func ):
//   ( arg4: Arg4<Func>, arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func> ) => Return<Func>;
export function reverseArgs<Arg, Arg2, Arg3, Arg4, Result>( func: (arg: Arg, arg2: Arg2, arg3: Arg3, arg4: Arg4) => Result ):
  ( arg4: Arg4, arg3: Arg3, arg2: Arg2, arg: Arg ) => Result;

// export function reverseArgs<Func extends (arg: any, arg2: any, arg3: any, arg4: any, arg5: any) => any>( func: Func ):
//   ( arg5: Arg5<Func>, arg4: Arg4<Func>, arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func> ) => Return<Func>;
export function reverseArgs<Arg, Arg2, Arg3, Arg4, Arg5, Result>( func: (arg: Arg, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5) => Result ):
  ( arg5: Arg5, arg4: Arg4, arg3: Arg3, arg2: Arg2, arg: Arg ) => Result;

// export function reverseArgs<Func extends FunctionThatReturns<any>>(
//   func: Func
// ): (...args: any[]) => Return<Func> {
//   return (...args: any[]) => func(...args.reverse());
// }
export function reverseArgs(
  func: FunctionThatReturns<any>
): (...args: any[]) => any {
  return (...args: any[]) => func(...args.reverse());
}