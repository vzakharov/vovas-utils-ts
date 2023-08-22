import { Typeguard } from "../typings";

// export const everyItem = <T, U extends T>(typeguard: Typeguard<T, U>) => (arr: T[]): arr is U[] => arr.every(typeguard);

export function everyItem<T, U extends T>(typeguard: Typeguard<T, U>): (arr: T[]) => arr is U[];

export function everyItem<T, U extends T>(arr: T[], typeguard: Typeguard<T, U>): arr is U[];

export function everyItem<T, U extends T>(arrOrTypeguard: T[] | Typeguard<T, U>, typeguard?: Typeguard<T, U>) {
  if (Array.isArray(arrOrTypeguard)) {
    return arrOrTypeguard.every(typeguard!);
  } else {
    return (arr: T[]) => arr.every(arrOrTypeguard);
  }
};