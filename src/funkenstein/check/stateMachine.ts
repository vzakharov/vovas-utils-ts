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

export type Narrowed<Base, IsTypeguard extends boolean, Guarded extends Base> =
  IsTypeguard extends true
    ? Exclude<Base, Guarded>
    : Base;

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
): ParseSwitchOutput<Kind, HasArgument, Argument, CombinedResult> {
  function $if<IsTypeguard extends boolean, Guarded extends Argument, TransformResult extends any>(
    predicate: Predicate<Argument, IsTypeguard, Guarded>,
    transform?: Transform<Narrowed<Argument, IsTypeguard, Guarded>, TransformResult>
  ) {

      type NarrowedArgument = Narrowed<Argument, IsTypeguard, Guarded>;
      
      return transform
        ? pushToStack(
            kind,
            hasArgument,
            argument as NarrowedArgument,
            predicate,
            transform,
            switchStack
          )
        : parseTransform(
            kind,
            hasArgument,
            argument as NarrowedArgument,
            predicate,
            switchStack
          );

  };

  function $else<T extends MatchingTransform<typeof alwaysTrue>>(transform: T) {

    const alwaysTrue: (arg: Argument) => true = () => true;
    return pushToStack(
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
  } as ParseSwitchOutput<Kind, HasArgument, Argument, CombinedResult>;

};

export type ParseSwitchOutput<Kind extends SwitchKind, HasArgument extends boolean, Argument extends any, CombinedResult extends any> = {
  if<IsTypeguard extends boolean, Guarded extends Argument>(
    predicate: Predicate<Argument, IsTypeguard, Guarded>
  ): 
    ParseTransformOutput<Kind, HasArgument, Narrowed<Argument, IsTypeguard, Guarded>, CombinedResult>;
  if<IsTypeguard extends boolean, Guarded extends Argument, TransformResult extends any>(
    predicate: Predicate<Argument, IsTypeguard, Guarded>,
    transform: Transform<Narrowed<Argument, IsTypeguard, Guarded>, TransformResult>
  ):
    PushToStackOutput<Kind, HasArgument, Narrowed<Argument, IsTypeguard, Guarded>, TransformResult, CombinedResult>;

} & ( Kind extends 'first' ? {} : {
  else<TransformResult extends any>(
    transform: Transform<Argument, TransformResult>
  ):
    PushToStackOutput<'last', HasArgument, Argument, TransformResult, CombinedResult>;

} );

export function parseTransform<
  Kind extends SwitchKind,
  HasArgument extends boolean,
  Argument extends any,
  CombinedResult extends any
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument,
  predicate: Predicate,
  switchStack: [ Predicate, Transform ][]
): ParseTransformOutput<Kind, HasArgument, Argument, CombinedResult> {
  return {
    then: <TransformResult extends any>(transform: Transform<Argument, TransformResult>) => pushToStack(
      kind,
      hasArgument,
      argument,
      predicate,
      transform,
      switchStack
    ),

  };
}
export type ParseTransformOutput<Kind extends SwitchKind, HasArgument extends boolean, Argument extends any, CombinedResult extends any> = {
  then<TransformResult extends any>(
    transform: Transform<Argument, TransformResult>
  ):
    PushToStackOutput<Kind, HasArgument, Argument, TransformResult, CombinedResult>;

};


export function pushToStack<
  Kind extends SwitchKind,
  HasArgument extends boolean,
  Argument extends any,
  TransformResult extends any,
  CombinedResult extends any
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument,
  predicate: Predicate,
  transform: Transform<Argument, TransformResult>,
  switchStack: [ Predicate, Transform ][]
): PushToStackOutput<Kind, HasArgument, Argument, TransformResult, CombinedResult> {

  switchStack.push([predicate, transform]);

  return (
    kind === 'last'
      ? evaluate(
        hasArgument, argument, switchStack
      )
      : parseSwitch(
        undefined, hasArgument, argument, switchStack
      )
  ) as PushToStackOutput<Kind, HasArgument, Argument, TransformResult, CombinedResult>;

};
export type PushToStackOutput<Kind extends SwitchKind, HasArgument extends boolean, Argument extends any, TransformResult extends any, CombinedResult extends any> = (

  Kind extends 'last'
    ? Evaluate<HasArgument, Argument, CombinedResult>
    : ParseSwitchOutput<undefined, HasArgument, Argument, CombinedResult>

);

export function evaluate<
  HasArgument extends boolean,
  Argument extends any,
  CombinedResult extends any
>(
  hasArgument: HasArgument,
  argument: Argument,
  switchStack: [ Predicate, Transform ][]
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
  .if<true, any[], string[]>(is.array, keys => keys)
  .if<true, string, string[]>(is.string, key => [key])
  .if<true, object, string[]>(is.object, obj => Object.keys(obj))
  .else(invalidArgument => { throw new Error(`Invalid argument ${invalidArgument}`) });