import _ from "lodash";

export function isFunction(maybeFn: any): maybeFn is (...args: any[]) => any;
export function isFunction<Args extends any[], Result>(maybeFn: any): maybeFn is (...args: Args) => Result;

export function isFunction(maybeFn: any) {
  return _.isFunction(maybeFn);
};