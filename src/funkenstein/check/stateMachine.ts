import _ from "lodash";
import { shouldNotBe } from "../shouldNotBe";
import { is } from "./common/checkers";
import { give } from "./common/transforms";

export type Predicate<Base = any, IsTypeguard extends boolean = boolean, Guarded extends Base = Base> =
  IsTypeguard extends true
    ? ( (arg: Base) => arg is Guarded )
    : ( (arg: Base) => boolean );

export type Typeguard<Base = any, Guarded extends Base = Base> =
  ( (arg: Base) => arg is Guarded );

export type NonTypeguard<Base = any> =
  ( (arg: Base) => boolean );

export type Transform<Arg = any, Result = any> =
  (arg: Arg) => Result;

export type TransformResult<Trfm extends Transform> =
  Trfm extends Transform<any, infer Result>
    ? Result
    : never;

export type PredicateOutput<Base, IsTypeguard extends boolean, Guarded extends Base> =
  IsTypeguard extends true
    ? Guarded
    : Base;

export type Narrowed<Base, IsTypeguard extends boolean, Guarded extends Base> =
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
) {
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
            argument,
            predicate,
            switchStack
          );

  };

  // function $else<T extends MatchingTransform<typeof alwaysTrue>>(transform: T) {
  function $else<TransformResult extends any>(
    transform: Transform<Argument, TransformResult>
  ) {

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

  if<Guarded extends Argument>(typeguard: Typeguard<Argument, Guarded>): 
    ParseTransformOutput<Kind, HasArgument, Argument, Exclude<Argument, Guarded>, CombinedResult>;

  if(predicate: NonTypeguard<Argument>): 
    ParseTransformOutput<Kind, HasArgument, Argument, Argument, CombinedResult>;

  if<Guarded extends Argument, TransformResult extends any>(
    typeguard: Typeguard<Argument, Guarded>,
    transform: Transform<Guarded, TransformResult>
  ):
    PushToStackOutput<Kind, HasArgument, Exclude<Argument, Guarded>, TransformResult, CombinedResult>;
  
  if<TransformResult extends any>(
    predicate: NonTypeguard<Argument>,
    transform: Transform<Argument, TransformResult>
  ):
    PushToStackOutput<Kind, HasArgument, Argument, TransformResult, CombinedResult>;

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
  Narrowed extends Argument,
  CombinedResult extends any
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument,
  predicate: Predicate,
  switchStack: [ Predicate, Transform ][]
) {
  return {

    then: <TransformResult extends any>(transform: Transform<Argument, TransformResult>) => pushToStack(
      kind,
      hasArgument,
      argument,
      predicate,
      transform,
      switchStack
    ),

  } as ParseTransformOutput<Kind, HasArgument, Argument, Narrowed, CombinedResult>;
}
export type ParseTransformOutput<Kind extends SwitchKind, HasArgument extends boolean, Argument extends any, Narrowed extends Argument, CombinedResult extends any> = {
  then<TransformResult extends any>(
    transform: Transform<Argument, TransformResult>
  ):
    // PushToStackOutput<Kind, HasArgument, Argument, TransformResult, CombinedResult>;
    PushToStackOutput<Kind, HasArgument, Narrowed, TransformResult, CombinedResult>;

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
) {

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
    ? Evaluate<HasArgument, Argument, CombinedResult | TransformResult>
    : ParseSwitchOutput<undefined, HasArgument, Argument, CombinedResult | TransformResult>

);

export function evaluate<
  HasArgument extends boolean,
  Argument extends any,
  CombinedResult extends any
>(
  hasArgument: HasArgument,
  argument: Argument,
  switchStack: [ Predicate, Transform ][]
) {

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

export function check<Argument>(value: Argument) {
  return parseSwitch<'first', true, Argument, never>(
    'first',
    true,
    value,
    []
  );
};

export function $if<Argument, Guarded extends Argument, TransformResult>(
  value: Argument,
  typeguard: Typeguard<Argument, Guarded>,
  transform: Transform<Guarded, TransformResult>
) {
  type GuardedArgument = Guarded extends Argument ? Argument : never;
  return parseSwitch<'first', true, Argument, never>(
    'first',
    true,
    value,
    []
  ).if(typeguard, transform);
};


const keyNames = 
  check('something' as string | string[] | object)
    .if(is.array, give.map(give.string))
    .if(is.string, give.array)
    .if(is.object, give.keys)
    .else(shouldNotBe);

console.log(keyNames);