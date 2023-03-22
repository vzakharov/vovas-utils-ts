// Implement code that would allow something like:
import { $thrower } from './$throw';

export function getItemNames(itemStringOrArrayOrObject: string | string[] | Record<string, any>): string[] {
  const itemNames = 
    check(itemStringOrArrayOrObject)
      .if(_.isString, _.castArray)
      .if(_.isArray, array => array.map(_.toString))
      .if(_.isObject, _.keys)
      .else($thrower("Expected string, array or object"))
    // (Once we see `default`, the expression is evaluated and the result is returned)
  return itemNames;
};

// Every step should be type-safe, so that the compiler can infer the type for the next if.
// It should also be lazy, so that the expression is evaluated right after the first matching if.

// Implementation:

import _ from 'lodash';

export type Typeguard<BroadType, NarrowType extends BroadType> = 
  ( (arg: BroadType) => arg is NarrowType )
  |
  ( (arg: any) => arg is NarrowType );

export type TypeguardOrType<BroadType, NarrowType extends BroadType> = Typeguard<BroadType, NarrowType> | NarrowType;

export type BroadType<TG extends TypeguardOrType<any, any>> = 
  TG extends Typeguard<infer BroadType, any> ? BroadType : any;

export type NarrowType<TG extends TypeguardOrType<any, any>> =
  TG extends Typeguard<any, infer NarrowType> ? NarrowType : TG;

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


  else<ElseResult>(transform: (arg: Arg) => ElseResult): Result | ElseResult;
  
};

export type SwitchWithCondition<Result> = {

  if<IfResult>(condition: boolean, transform: () => IfResult): SwitchWithCondition<Result | IfResult>;
  else<ElseResult>(transform: () => ElseResult): ElseResult | Result;
  
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

  return check<Exclude<Arg, TypedArg>, Result>(arg as Exclude<Arg, TypedArg>);
};

function ifWithCondition<Result>(
  condition: boolean,
  transform: () => Result
): SwitchWithCondition<Result> {

  if ( condition ) {
    return warp<Result, true>(transform());
  }

  return {
    if<IfResult>(condition: boolean, transform: () => IfResult): SwitchWithCondition<Result | IfResult> {
      return ifWithCondition(condition, transform);
    },
    else<ElseResult>(transform: () => ElseResult): Result | ElseResult {
      return transform();
    },
  };

};

export function check<Arg, Result = never>(arg: Arg): Switch<Arg, Result, false> {

  return {

    if: <TypedArg extends Arg, IfResult>(
      typeguardOrType: TypeguardOrType<Arg, TypedArg>,
      transform: Transform<TypedArg, IfResult>
    ) => $if(arg,
      _.isFunction(typeguardOrType)
        ? typeguardOrType
        : is<Arg, TypedArg>(typeguardOrType), transform
    ),

    else: <ElseResult>(transform: (arg: Arg) => ElseResult) =>
      transform(arg)

  };

};

export function isDefined<T>(value: T | undefined): value is T {
  return !_.isUndefined(value);
}

export function $<T>(value: T): (...args: any[]) => T {
  return (...args: any[]) => value;
}

export function itself<T>(value: T): T {
  return value;
}

export function themselves<T extends any[]>(values: T): T {
  return values;
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

export function map<Item, Result>(
  transform: Transform<Item, Result>
): (items: Item[]) => Result[] {
  return (items: Item[]) => items.map(transform);
};