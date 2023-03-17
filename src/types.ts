import _ from "lodash";

export type Dict<T = any> = {
  [key: string]: T;
} | Promise<Dict>;

export type UnixTimestamp = number;

export type Primitive = string | number | boolean | null | undefined;

export function isPrimitive(v: any): v is Primitive {
  const result = _.isString(v) || _.isNumber(v) || _.isBoolean(v) || _.isNull(v) || _.isUndefined(v);
  // log(result, "isPrimitive", v);
  return result;
}

export interface JsonableObject {
  [key: string]: Jsonable;
};

export type JsonableNonArray = Primitive | JsonableObject;

export type Jsonable = JsonableNonArray | Jsonable[];

export type FunctionThatReturns<T> = (...args: any[]) => T;

// export function $as<AsWhat, What extends AsWhat>(what: What): AsWhat {
//   return what;
// }
export function $as<AsWhat>(what: any): AsWhat
export function $as<AsWhat>(what: FunctionThatReturns<any>): FunctionThatReturns<AsWhat>
export function $as<AsWhat>(
  what: any | FunctionThatReturns<any>,
): AsWhat | FunctionThatReturns<AsWhat> {
  return _.isFunction(what)
    ? what as FunctionThatReturns<AsWhat>
    : what as AsWhat;
}