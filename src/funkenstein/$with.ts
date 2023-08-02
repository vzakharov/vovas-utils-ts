// export function $with<Args extends any[]>(...args: Args) {

import { is } from "./predicates/common";

//   return {
//     do: <Result>(fn: (...args: Args) => Result) => fn(...args),
//   };

// };
export function $with<Arg, Result>(arg: Arg, fn: (arg: Arg) => Result): Result;

export function $with<Args extends any[]>(...args: Args): {
  do: <Result>(fn: (...args: Args) => Result) => Result;
};

export function $with(...args: any[]) {

  return args.length === 2 && is.function(args[1])
    ? args[1](args[0])
    : {
      do: <Result>(fn: (...args: any[]) => Result) => fn(...args),
    };

};