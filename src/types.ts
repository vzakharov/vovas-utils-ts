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

export type JsonableObject = {
  [key: string]: Jsonable;
};

export type KeyOfJsonable = keyof JsonableObject;

export type JsonableNonArray = Primitive | JsonableObject;

export type Jsonable = JsonableNonArray | Jsonable[];

export type FunctionThatReturns<T> = (...args: any[]) => T;

export function functionThatReturns<T>(value: T): FunctionThatReturns<T> {
  return (...args: any[]) => value;
};

export function $as<AsWhat>(what: any): AsWhat
export function $as<AsWhat>(what: FunctionThatReturns<any>): FunctionThatReturns<AsWhat>
export function $as<AsWhat>(
  what: any | FunctionThatReturns<any>,
): AsWhat | FunctionThatReturns<AsWhat> {
  return _.isFunction(what)
    ? what as FunctionThatReturns<AsWhat>
    : what as AsWhat;
};

export function tuple<T extends any[]>(...args: T): T {
  return args;
}