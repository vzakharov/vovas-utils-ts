import { Jsonable } from "./types.js";
export declare function jsonClone<T>(obj: T): T & Jsonable;
export declare function jsonEqual<T>(a: T, b: T): boolean;
