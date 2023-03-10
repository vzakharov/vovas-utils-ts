export type Primitive = string | number | boolean | null | undefined;

export type JsonableNonArray = Primitive | JsonableObject;

export type Jsonable = JsonableNonArray | Jsonable[];

export interface JsonableObject {
  [key: string]: Jsonable;
};

export function jsonClone<T>(obj: T): T & Jsonable {
  return JSON.parse(JSON.stringify(obj));
}

export function jsonEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}