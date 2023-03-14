export type Dict<T = any> = {
    [key: string]: T;
} | Promise<Dict>;
export type UnixTimestamp = number;
export type Primitive = string | number | boolean | null | undefined;
export declare function isPrimitive(v: any): v is Primitive;
export interface JsonableObject {
    [key: string]: Jsonable;
}
export type JsonableNonArray = Primitive | JsonableObject;
export type Jsonable = JsonableNonArray | Jsonable[];
