export type Primitive = string | number | boolean | null | undefined;
export type JsonableNonArray = Primitive | JsonableObject;
export type Jsonable = JsonableNonArray | Jsonable[];
export interface JsonableObject {
    [key: string]: Jsonable;
}
export declare function jsonClone<T>(obj: T): T & Jsonable;
export declare function jsonEqual<T>(a: T, b: T): boolean;
