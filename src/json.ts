import _ from "lodash";
import { Jsonable, JsonableObject } from "./types.js";

export function jsonClone<T>(obj: T): T & Jsonable {
  return JSON.parse(JSON.stringify(obj));
}

export function jsonEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isJsonable(obj: any): obj is Jsonable {
  try {
    return jsonEqual(obj, jsonClone(obj));
  } catch (e) {
    return false;
  }
}

export function isJsonableObject(obj: any): obj is JsonableObject {
  return isJsonable(obj) && _.isPlainObject(obj);
}