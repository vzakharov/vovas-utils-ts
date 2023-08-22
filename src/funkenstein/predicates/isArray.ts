export function isArray<T>(arg: any): arg is T[];
export function isArray<T, U>(arg: T | U[]): arg is U[];
export function isArray<T, U, V>(arg: T | U[] | V[]): arg is U[] | V[];

export function isArray(arg: any) {
  return Array.isArray(arg);
}