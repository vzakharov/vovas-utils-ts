import { Jsonable } from "./types.js";

export function jsonClone<T>(obj: T): T & Jsonable {
  return JSON.parse(JSON.stringify(obj));
}

export function jsonEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}