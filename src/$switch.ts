// Implement code that would allow something like:
import { $throw } from './$throw';

export function getItemNames(itemStringOrArrayOrObject: string | string[] | Record<string, any>): string[] {
  const itemNames = 
    $switch(itemStringOrArrayOrObject)
      .if(_.isString, _.castArray)
      .if(_.isArray, _.identity)
      .if(_.isObject, _.keys)
      .else($throw("Expected string, array or object"))
    // (Once we see `default`, the expression is evaluated and the result is returned)
  return itemNames;
};

// Every step should be type-safe, so that the compiler can infer the type for the next if.
// It should also be lazy, so that the expression is evaluated right after the first matching if.

// Implementation:

import _ from 'lodash';
import { FunctionThatReturns } from './types';

export type Typeguard<Arg, TypedArg extends Arg> = (arg: Arg) => arg is TypedArg;
export type Transform<Arg, Result> = (arg: Arg) => Result;

export type Switch<Arg, Result> = {

  if: <TypedArg extends Arg>(
    typeguard: Typeguard<Arg, TypedArg>,
    transform: Transform<TypedArg, Result>
  ) => Switch<Exclude<Arg, TypedArg>, Result>;

  else(transform: Transform<Arg, Result>): Result;
  
};

type SwitchWithCondition<Result> = {
  if: typeof ifWithCondition;
  else(transform: FunctionThatReturns<Result>): Result;
};

export function dummySwitch<T>(value: T) {
  const recursion = () => ({
    if: recursion,
    else() {
      return value;
    },
  })
  return recursion();
}

export function $if<Arg, TypedArg extends Arg, IfResult>(
  arg: Arg,
  typeguard: Typeguard<Arg, TypedArg>,
  transform: Transform<TypedArg, IfResult>
): Switch<Exclude<Arg, TypedArg>, IfResult>

export function $if<Result>(
  condition: boolean,
  transform: () => Result
) : SwitchWithCondition<Result>

export function $if<Arg, TypedArg extends Arg, Result>(
  argOrCondition: Arg | boolean,
  typeguardOrTransform: Typeguard<Arg, TypedArg> | (() => Result),
  transformOrNothing?: Transform<TypedArg, Result>
): Switch<Exclude<Arg, TypedArg>, Result> | SwitchWithCondition<Result> {

  if ( _.isBoolean(argOrCondition) )
    return ifWithCondition(argOrCondition, typeguardOrTransform as () => Result);
  
  const arg = argOrCondition;
  const typeguard = typeguardOrTransform as Typeguard<Arg, TypedArg>;
  const transform = transformOrNothing as Transform<TypedArg, Result>;

  if ( typeguard(arg) ) {
    return dummySwitch(transform(arg));
  }

  return $switch<Exclude<Arg, TypedArg>, Result>(arg as Exclude<Arg, TypedArg>);
};

function ifWithCondition<Result>(
  condition: boolean,
  transform: () => Result
): SwitchWithCondition<Result> {

  if ( condition ) {
    return dummySwitch(transform());
  }

  return {
    else(transform: FunctionThatReturns<Result>): Result {
      return transform();
    },
    if: ifWithCondition
  };

};

export function $switch<Arg, Result>(arg: Arg) {

  return {

    if<TypedArg extends Arg, IfResult extends Result>(
      typeguard: Typeguard<Arg, TypedArg>,
      transform: Transform<TypedArg, IfResult>
    ): Switch<Exclude<Arg, TypedArg>, IfResult> {
      return $if(arg, typeguard, transform);
    },

    else(transform: Transform<Arg, Result>): Result {
      return transform(arg);
    }

  };

};


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