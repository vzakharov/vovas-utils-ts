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

export type Typeguard<Arg, TypedArg extends Arg> = (arg: Arg) => arg is TypedArg;
export type Transform<Arg, Result> = (arg: Arg) => Result;
export type Switch<Arg, Result> = {
  if: If<Arg, Result>;
  case: If<Arg, Result>; // alias
  default(transform: (arg: Arg) => Result): Result;
};

export type If<Arg, Result> = <TypedArg extends Arg>(
  typeguard: Typeguard<Arg, TypedArg>,
  transform: Transform<TypedArg, Result>
) => Switch<Exclude<Arg, TypedArg>, Result>;


export function $switch<Arg, Result>(arg: Arg) {

  function $if<TypedArg extends Arg, Result>(
    typeGuard: Typeguard<Arg, TypedArg>,
    transform: Transform<TypedArg, Result>
  ): Switch<Exclude<Arg, TypedArg>, Result> {
    if ( typeGuard(arg) )
      return bypass(transform(arg));
    return $switch<Exclude<Arg, TypedArg>, Result>(arg as Exclude<Arg, TypedArg>);
  }

  return {

    if: $if,
    case: $if, // alias

    default(transform: Transform<Arg, Result>): Result {
      return transform(arg);
    },

  };

};


export function bypass<Arg, Result>(result: Result): Switch<Arg, Result> {
  return {
    if() { return bypass(result); },
    case() { return bypass(result); },
    default() { return result; },
  };
}