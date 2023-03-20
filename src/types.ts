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
export type Target<F> = F extends (target: infer Target, ...args: any[]) => any ? Target : never;
export type Arg<F> = F extends (target: any, arg: infer Arg) => any ? Arg : never;
export type Arg1of2<F> = F extends (target: any, arg1: infer Arg1, arg2: any) => any ? Arg1 : never;
export type Arg2of2<F> = F extends (target: any, arg1: any, arg2: infer Arg2) => any ? Arg2 : never;
export type Arg1of3<F> = F extends (target: any, arg1: infer Arg1, arg2: any, arg3: any) => any ? Arg1 : never;
export type Arg2of3<F> = F extends (target: any, arg1: any, arg2: infer Arg2, arg3: any) => any ? Arg2 : never;
export type Arg3of3<F> = F extends (target: any, arg1: any, arg2: any, arg3: infer Arg3) => any ? Arg3 : never;
export type Arg1of4<F> = F extends (target: any, arg1: infer Arg1, arg2: any, arg3: any, arg4: any) => any ? Arg1 : never;
export type Arg2of4<F> = F extends (target: any, arg1: any, arg2: infer Arg2, arg3: any, arg4: any) => any ? Arg2 : never;
export type Arg3of4<F> = F extends (target: any, arg1: any, arg2: any, arg3: infer Arg3, arg4: any) => any ? Arg3 : never;
export type Arg4of4<F> = F extends (target: any, arg1: any, arg2: any, arg3: any, arg4: infer Arg4) => any ? Arg4 : never;

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