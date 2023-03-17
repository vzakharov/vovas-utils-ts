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
import { $as, FunctionThatReturns } from './types';
import { ensure } from './ensure';

export type Typeguard<Arg, TypedArg extends Arg> = (arg: Arg) => arg is TypedArg;

// export type Transform<Arg, Result> = (arg: Arg) => Result;
export type Transform<Arg, Result> =
  Arg extends void
    ? () => Result
    : (arg: Arg) => Result;

export type Switch<Arg, Result> = {

  if: If<Arg, Result>;
  else(transform: Transform<Arg, Result>): Result;

};

export type If<Arg, Result> = <TypedArg extends Arg>(
  typeguard: Typeguard<Arg, TypedArg>,
  transform: Transform<TypedArg, Result>
) => Switch<Exclude<Arg, TypedArg>, Result>;
// export type If<Arg, Result> =
//   Arg extends void ? 
//   (
//     condition: boolean,
//     transform: Transform<void, Result>
//   ) => Switch<void, Result>
//   :
//   <TypedArg extends Arg>(
//     typeguard: Typeguard<Arg, TypedArg>,
//     transform: Transform<TypedArg, Result>
//   ) => Switch<Exclude<Arg, TypedArg>, Result>;


export function $if<Arg, TypedArg extends Arg, Result>(
  arg: Arg,
  typeguard: Typeguard<Arg, TypedArg>,
  transform: Transform<TypedArg, Result>
): Switch<Exclude<Arg, TypedArg>, Result>

export function $if<Result>(
  condition: boolean,
  transform: () => Result
): Switch<void, Result>

export function $if<Arg, TypedArg extends Arg, Result> (
  argOrCondition: Arg | boolean,
  typeguardOrTransform: Typeguard<Arg, TypedArg> | Transform<void, Result>,
  transformOrNone?: Transform<TypedArg, Result>
): Switch<Exclude<Arg, TypedArg>, Result> | {
  else(transform: Transform<void, Result>): Result;
} {
  if ( _.isBoolean(argOrCondition) ) {
    typeguardOrTransform
    if ( argOrCondition ) {
      typeguardOrTransform
      const returnValue = $as<Transform<void, Result>>(typeguardOrTransform)();
      return {
        else: $(returnValue)
      }
    }
    return {
      else(elseTransform: Transform<void, Result>) {
        return elseTransform();
      }
    }
  };
  const arg = argOrCondition;
  const typeguard = typeguardOrTransform as Typeguard<Arg, TypedArg>;
  const transform = ensure(transformOrNone);
  if ( typeguard(arg) )
    return bypass(transform(arg));
  return $switch<Exclude<Arg, TypedArg>, Result>(arg as Exclude<Arg, TypedArg>);
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
    },

  };

};


function bypass<Arg, Result>(result: Result): Switch<Arg, Result> {
  return {

    if() { return bypass(result); },

    else() { return result; },

  };
}

export function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return !_.isUndefined(value);
}

export function $<T>(value: T): FunctionThatReturns<T> {
  return (...args: any[]) => value;
}

export function guard<InferType extends FromType, FromType = any>(checker: (value: FromType) => boolean): Typeguard<FromType, InferType> {
  return checker as Typeguard<FromType, InferType>;
}

// Example:
function isGreaterThan0(value: number): boolean {
  return value > 0;
}

// let x = 1;
// $if(x, isGreaterThan0, $('greater than 0'))
// // Gives an error as isGreaterThan0 is not a typeguard

// $if(x, guard(isGreaterThan0), $('greater than 0'))
// // Works