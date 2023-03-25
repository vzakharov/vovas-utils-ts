import _ from "lodash";
import { shouldNotBe } from "../shouldNotBe";
import { is } from "./common/checkers";
import { give } from "./common/transforms";

export type Predicate<Base = any, IsTypeguard extends boolean = boolean, Guarded extends Base = Base> =
  IsTypeguard extends true
    ? ( (arg: Base) => arg is Guarded )
    : ( (arg: Base) => boolean );

export type Transform<Arg = any, Result = any> =
  (arg: Arg) => Result;

export type TransformResult<Trfm extends Transform> =
  Trfm extends Transform<any, infer Result>
    ? Result
    : never;

export type PredicateResult<Pdct extends Predicate> =
  Pdct extends Predicate<infer Base, infer IsTypeguard, infer Guarded>
    ? IsTypeguard extends true
      ? Guarded
      : Base
    : never;

export type NarrowedAfterPredicate<Pdct extends Predicate> =
  Pdct extends Predicate<infer Base, infer IsTypeguard, infer Guarded>
    ? IsTypeguard extends true
      ? Exclude<Base, Guarded>
      : Base
    : never;

export type MatchingTransform<Pdct extends Predicate, Result = any> =
  Transform<
    PredicateResult<Pdct>,
    Result
  >;

export type NarrowedType<Base, IsTypeguard extends boolean, Guarded extends Base> =
  IsTypeguard extends true
    ? Exclude<Base, Guarded>
    : Base;

export type CheckState = {
  isFirst: boolean;
  isLast: boolean;
  hasArgument: boolean;
  argument?: any;
  predicate?: Predicate;
  transform?: Transform;
  switchStack: [
    Predicate,
    Transform
  ][];
};
  

export type SwitchKind = 'first' | 'last' | undefined;

export function parseSwitch<
  Kind extends SwitchKind, 
  HasArgument extends boolean, 
  Argument extends any, 
  CombinedResult extends any
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument,
  switchStack: [ Predicate, Transform ][]
// ) {
): ParseSwitch<Kind, HasArgument, Argument, CombinedResult> {

  type MatchingPredicate = Predicate<Argument>;

  // function $if<P extends MatchingPredicate>(predicate: P): typeof parseTransform;
  // function $if<P extends MatchingPredicate, T extends MatchingTransform<P>>(predicate: P, transform: T): typeof stack;

  function $if<P extends MatchingPredicate, T extends MatchingTransform<P>>(predicate: P, transform?: T) {
      
      return transform
        ? pushToStack<Kind, HasArgument, NarrowedAfterPredicate<P>, P, T, CombinedResult>(
            kind,
            hasArgument,
            argument as NarrowedAfterPredicate<P>,
            predicate,
            transform,
            switchStack
          )
        : parseTransform<Kind, HasArgument, NarrowedAfterPredicate<P>, P, CombinedResult>(
            kind,
            hasArgument,
            argument as NarrowedAfterPredicate<P>,
            predicate,
            switchStack
          );

  };

  function $else<T extends MatchingTransform<typeof alwaysTrue>>(transform: T) {

    const alwaysTrue: (arg: Argument) => true = () => true;

    return pushToStack<'last', HasArgument, Argument, typeof alwaysTrue, T, CombinedResult>(
      'last',
      hasArgument,
      argument,
      alwaysTrue,
      transform,
      switchStack
    );

  };

  return {
    if: $if,
    ...( kind === 'last' ? { else: $else } : {} )
  } as ParseSwitch<Kind, HasArgument, Argument, CombinedResult>;

};

export type ParseSwitch<Kind extends SwitchKind, HasArgument extends boolean, Argument extends any, CombinedResult extends any> = {

  if<P extends Predicate<Argument>>(predicate: P): 
    ParseTransform<Kind, HasArgument, NarrowedAfterPredicate<P>, P, CombinedResult>;

  if<P extends Predicate<Argument>, T extends MatchingTransform<P>>(predicate: P, transform: T):
    PushToStack<Kind, HasArgument, NarrowedAfterPredicate<P>, P, T, CombinedResult>;

} & ( Kind extends 'first' ? {} : {

  else<T extends MatchingTransform<(arg: Argument) => true>>(transform: T):
    PushToStack<'last', HasArgument, Argument, (arg: Argument) => true, T, CombinedResult>;

} );

export function parseTransform<
  Kind extends SwitchKind,
  HasArgument extends boolean,
  Argument extends any,
  P extends Predicate<Argument>,
  CombinedResult extends any
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument,
  predicate: P,
  switchStack: [ Predicate, Transform ][]
// ) {
): ParseTransform<Kind, HasArgument, Argument, P, CombinedResult> { 
  return {

    then: <T extends MatchingTransform<P>>(transform: T) => pushToStack<Kind, HasArgument, Argument, P, T, CombinedResult>(
      kind,
      hasArgument,
      argument,
      predicate,
      transform,
      switchStack
    ),

  };
}

export type ParseTransform<Kind extends SwitchKind, HasArgument extends boolean, Argument extends any, P extends Predicate<Argument>, CombinedResult extends any> = {

  then<T extends MatchingTransform<P>>(transform: T):
    PushToStack<Kind, HasArgument, Argument, P, T, CombinedResult>;

};


export function pushToStack<
  Kind extends SwitchKind,
  HasArgument extends boolean,
  Argument extends any,
  P extends Predicate<Argument>,
  T extends MatchingTransform<P>,
  CombinedResult extends any
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument,
  predicate: P,
  transform: T,
  switchStack: [ Predicate, Transform ][]
): PushToStack<Kind, HasArgument, Argument, P, T, CombinedResult> {

  switchStack.push([predicate, transform]);

  return (
    kind === 'last'
      ? evaluate<HasArgument, Argument, CombinedResult>(
        hasArgument, argument, switchStack
      )
      : parseSwitch<undefined, HasArgument, Argument, CombinedResult>(
        undefined, hasArgument, argument, switchStack
      )
  ) as PushToStack<Kind, HasArgument, Argument, P, T, CombinedResult>;

};

export type PushToStack<Kind extends SwitchKind, HasArgument extends boolean, Argument extends any, P extends Predicate<Argument>, T extends MatchingTransform<P>, CombinedResult extends any> = (

  Kind extends 'last'
    ? Evaluate<HasArgument, Argument, CombinedResult>
    : ParseSwitch<undefined, HasArgument, Argument, CombinedResult>

);

export function evaluate<
  HasArgument extends boolean,
  Argument extends any,
  CombinedResult extends any
>(
  hasArgument: HasArgument,
  argument: Argument,
  switchStack: [ Predicate, Transform ][]
// ) {
): Evaluate<HasArgument, Argument, CombinedResult> {

  function evaluateForArgument(argument: Argument): CombinedResult {

    for ( const [predicate, transform] of switchStack ) {
      if ( predicate(argument) ) {
        return transform(argument);
      }
    }

    throw new Error(`No matching predicate found for argument ${argument} (this should never happen)`);

  };

  return (
    hasArgument
      ? evaluateForArgument(argument)
      : evaluateForArgument
  ) as Evaluate<HasArgument, Argument, CombinedResult>;

};

export type Evaluate<HasArgument extends boolean, Argument extends any, CombinedResult extends any> = (

  HasArgument extends true
    ? CombinedResult
    : (arg: Argument) => CombinedResult

);

function check<T>(value: T) {
  return parseSwitch<'first', true, T, never>(
    'first',
    true,
    value,
    []
  );
};

const keyNames = check('key' as string | string[] | object)
  .if(is.array, keys => keys)
  .if(is.string, key => [key])
  .if(is.object, obj => Object.keys(obj))
  .else(invalidArgument => { throw new Error(`Invalid argument ${invalidArgument}`) });