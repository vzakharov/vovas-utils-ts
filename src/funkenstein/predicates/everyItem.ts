import { Typeguard } from "../typings";

// export function everyItem<U>(typeguard: Typeguard<any, U>) {
//   return (arr: any[]): arr is U[] => arr.every( typeguard );
// }

export function everyItem<T>(typeguard: Typeguard<any, T>): Typeguard<any[], T[]>;

export function everyItem<T>(arr: any[], typeguard: Typeguard<any, T>): arr is T[];

export function everyItem<T>(...args: [Typeguard<any, T>] | [any[], Typeguard<any, T>]) {
  if (args.length === 1) {
    return (arr: any[]) => arr.every(args[0]);
  } else {
    return args[0].every(args[1]);
  }
}
