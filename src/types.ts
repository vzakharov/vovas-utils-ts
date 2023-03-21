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

export function functionThatReturns<T>(value: T): FunctionThatReturns<T> {
  return (...args: any[]) => value;
};

export type Return<F> = F extends (...args: any[]) => infer R ? R : never;
export type Arg<F> = F extends (arg: infer Arg, ...args: any[]) => any ? Arg : never;
export type Arg2<F> = F extends (arg: any, arg2: infer Arg2, ...args: any[]) => any ? Arg2 : never;
export type Arg3<F> = F extends (arg: any, arg2: any, arg3: infer Arg3, ...args: any[]) => any ? Arg3 : never;
export type Arg4<F> = F extends (arg: any, arg2: any, arg3: any, arg4: infer Arg4, ...args: any[]) => any ? Arg4 : never;
export type Arg5<F> = F extends (arg: any, arg2: any, arg3: any, arg4: any, arg5: infer Arg5, ...args: any[]) => any ? Arg5 : never;

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
};