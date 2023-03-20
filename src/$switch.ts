// Implement code that would allow something like:
import { $throw } from './$throw';

export function getItemNames(itemStringOrArrayOrObject: string | string[] | Record<string, any>): string[] {
  const itemNames = 
    $switch(itemStringOrArrayOrObject)
      .if(_.isString, _.castArray)
      .if(_.isArray, array => array.map(_.toString))
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

export type Typeguard<Arg, TypedArg extends Arg> = 
  ( (arg: Arg) => arg is TypedArg )
  |
  ( (arg: any) => arg is TypedArg );

export type TypeguardOrType<Arg, TypedArg extends Arg> = Typeguard<Arg, TypedArg> | TypedArg;
export type Transform<Arg, Result> = (arg: Arg) => Result;

export type SwitchWithArg<Arg, Result> = {

  if<TypedArg extends Arg, IfResult>(
    typeguard: ( (arg: Arg) => arg is TypedArg ),
    transform: (arg: TypedArg) => IfResult
  ): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>

  if<TypedArg extends Arg, IfResult>(
    typeguard: ( (arg: any) => arg is TypedArg ),
    transform: (arg: TypedArg) => IfResult
  ): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>

  if<TypedArg extends Arg, IfResult>(
    type: TypedArg,
    transform: (arg: TypedArg) => IfResult
  ): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>


  else(transform: (arg: Arg) => Result): Result;
  
};

export type SwitchWithCondition<Result> = {

  if: <Result>(condition: boolean, transform: () => Result) => SwitchWithCondition<Result>
  else(transform: () => Result): Result;
  
};

export type Switch<Arg, Result, ConditionBased extends boolean> = 
  ConditionBased extends true
    ? SwitchWithCondition<Result>
    : SwitchWithArg<Arg, Result>;

function warp<T, ConditionBased extends boolean>(value: T) {
  function recursion() {
    return {
      if: recursion,
      else() {
        return value;
      },
    };
  };
  return recursion() as Switch<any, T, ConditionBased>;
}

export function $if<Arg, TypedArg extends Arg, IfResult>(
  arg: Arg,
  typeguard: (arg: Arg) => arg is TypedArg,
  transform: Transform<TypedArg, IfResult>
): Switch<Exclude<Arg, TypedArg>, IfResult, false>

export function $if<Arg, TypedArg extends Arg, IfResult>(
  arg: Arg,
  typeguard: (arg: any) => arg is TypedArg,
  transform: Transform<TypedArg, IfResult>
): Switch<Exclude<Arg, TypedArg>, IfResult, false>


export function $if<Arg, TypedArg extends Arg, IfResult>(
  arg: Arg,
  typeguard: (arg: any) => arg is TypedArg,
  transform: Transform<TypedArg, IfResult>
): Switch<Exclude<Arg, TypedArg>, IfResult, false>

export function $if<Arg, TypedArg extends Arg, IfResult>(
  arg: Arg,
  type: TypedArg,
  transform: Transform<TypedArg, IfResult>
): Switch<Exclude<Arg, TypedArg>, IfResult, false>


export function $if<Result>(
  condition: boolean,
  transform: () => Result
) : Switch<never, Result, true>

export function $if<Arg, TypedArg extends Arg, Result>(
  argOrCondition: Arg | boolean,
  typeguardOrTypeOrTransform: TypeguardOrType<Arg, TypedArg> | (() => Result),
  transformOrNothing?: Transform<TypedArg, Result>
): Switch<Exclude<Arg, TypedArg>, Result, boolean> {

  if ( _.isBoolean(argOrCondition) )
    return ifWithCondition(argOrCondition, typeguardOrTypeOrTransform as () => Result);
  
  const arg = argOrCondition;
  const typeguardOrType = typeguardOrTypeOrTransform as TypeguardOrType<Arg, TypedArg>;
  const typeguard = _.isFunction(typeguardOrType) ? typeguardOrType : is<Arg, TypedArg>(typeguardOrType);
  const transform = transformOrNothing as Transform<TypedArg, Result>;

  if ( typeguard(arg) ) {
    return warp(transform(arg));
  }

  return $switch<Exclude<Arg, TypedArg>, Result>(arg as Exclude<Arg, TypedArg>);
};

function ifWithCondition<Result>(
  condition: boolean,
  transform: () => Result
): SwitchWithCondition<Result> {

  if ( condition ) {
    return warp<Result, true>(transform());
  }

  return {
    if: ifWithCondition,
    else(transform: () => Result): Result {
      return transform();
    },
  };

};

export function $switch<Arg, Result = never>(arg: Arg): Switch<Arg, Result, false> {

  function _if<TypedArg extends Arg, IfResult>(
    typeguard: (arg: Arg) => arg is TypedArg,
    transform: (arg: TypedArg) => IfResult
  ): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>

  function _if<TypedArg extends Arg, IfResult>(
    typeguard: (arg: any) => arg is TypedArg,
    transform: (arg: TypedArg) => IfResult
  ): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>

  function _if<TypedArg extends Arg, IfResult>(
    type: TypedArg,
    transform: Transform<TypedArg, IfResult>
  ): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>

  function _if<TypedArg extends Arg, IfResult>(
    typeguardOrType: TypeguardOrType<Arg, TypedArg>,
    transform: Transform<TypedArg, IfResult>
  ): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>
  {
    return $if(arg, 
      _.isFunction(typeguardOrType) 
        ? typeguardOrType 
        : is<Arg, TypedArg>(typeguardOrType), transform
    );
  };

  return {

    if: _if,

    else(transform: (arg: Arg) => Result): Result {
      return transform(arg);
    }

  };

};


export function isDefined<T>(value: T | undefined): value is T {
  return !_.isUndefined(value);
}

export function $<T>(value: T): (...args: any[]) => T {
  return (...args: any[]) => value;
}

export function guard<BroadType, NarrowType extends BroadType>(
  checker: (value: BroadType) => boolean
): (value: BroadType) => value is NarrowType {
  // return checker as Typeguard<T, U>;
  return checker as Typeguard<BroadType, NarrowType>;
}

export function is<BroadType, NarrowType extends BroadType>(
  valueToCheck: BroadType
): Typeguard<BroadType, NarrowType> {
  return function isNarrowType(value: BroadType): value is NarrowType {
    return value === valueToCheck;
  }
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