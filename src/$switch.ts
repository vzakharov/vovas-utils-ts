// Implement code that would allow something like:
import { $throw } from './$throw';

export function getItemNames(itemStringOrArrayOrObject: string | string[] | Record<string, any>): string[] {
  const itemNames = 
    $switch(itemStringOrArrayOrObject)
      .if(_.isString, _.castArray)
      .if(_.isArray, _.identity)
      .if(_.isObject, _.keys)
      .default($throw("Expected string, array or object"))
    // (Once we see `default`, the expression is evaluated and the result is returned)
  return itemNames;
};

// Every step should be type-safe, so that the compiler can infer the type for the next if.
// It should also be lazy, so that the expression is evaluated right after the first matching if.

// Implementation:

import _ from 'lodash';
import { functionThatReturns, FunctionThatReturns } from './types';

export type Typeguard<Arg, TypedArg extends Arg> = (arg: Arg) => arg is TypedArg;
export type Transform<Arg, Result> = (arg: Arg) => Result;

export type Switch<Arg, Result> = {
  if: If<Arg, Result>;
  else(transform: Transform<Arg, Result>): Result;
};

export type If<Arg, Result> = <TypedArg extends Arg>(
  typeguard: Typeguard<Arg, TypedArg>,
  transform: Transform<TypedArg, Result>
) => Switch<Exclude<Arg, TypedArg>, Result>;

export function $if<Arg, TypedArg extends Arg, IfResult>(
  arg: Arg,
  typeguard: Typeguard<Arg, TypedArg>,
  transform: Transform<TypedArg, IfResult>
): Switch<Exclude<Arg, TypedArg>, IfResult> {
  if ( typeguard(arg) )
    return bypass(transform(arg));
  return $switch<Exclude<Arg, TypedArg>, IfResult>(arg as Exclude<Arg, TypedArg>);
};

export type SwitchWithCondition<Result> = {
  if: typeof ifWithCondition;
  else(transform: FunctionThatReturns<Result>): Result;
};

export function ifWithCondition<Result>(
  condition: boolean,
  transform: () => Result
): SwitchWithCondition<Result> {

  if ( condition ) {
    const value = transform();
    const dummy = () => ({
      else(): Result {
        return value;
      },
      if: dummy
    })
    return dummy();
  }

  return {
    else(transform: FunctionThatReturns<Result>): Result {
      return transform();
    },
    if: ifWithCondition
  };

};

export function $switch<Arg, Result>(arg: Arg) {

  function _if<TypedArg extends Arg, IfResult extends Result>(
    typeguard: Typeguard<Arg, TypedArg>,
    transform: Transform<TypedArg, IfResult>
  ): Switch<Exclude<Arg, TypedArg>, IfResult> {
    return $if(arg, typeguard, transform);
  };

  function _else(transform: Transform<Arg, Result>): Result {
    return transform(arg);
  };

  return {

    if: _if,
    case: _if, // alias

    else: _else,
    default: _else, // alias

  };

};


export function bypass<Arg, Result>(result: Result): Switch<Arg, Result> {
  return {

    if() { return bypass(result); },
    case() { return bypass(result); },

    else() { return result; },
    default() { return result; },

  };
}

export function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return !_.isUndefined(value);
}

export function $<T>(value: T): FunctionThatReturns<T> {
  return (...args: any[]) => value;
}

export function guard<T, U extends T>(checker: (value: T) => boolean): Typeguard<T, U> {
  return checker as Typeguard<T, U>;
}

// // Example:
// function isGreaterThan0(value: number): boolean {
//   return value > 0;
// }

// let x = 1;
// $if(x, isGreaterThan0, $('greater than 0'))
// // Gives an error as isGreaterThan0 is not a typeguard

// $if(x, guard(isGreaterThan0), $('greater than 0'))
// // Works