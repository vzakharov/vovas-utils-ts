import _ from "lodash";
import { shouldNotBe } from "../shouldNotBe";
import { is } from "./common/checkers";
import { give, to } from "./common/transforms";

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
  OriginalArgument,
  Argument, 
  CombinedResult
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument | undefined,
  switchStack: [ Predicate, Transform ][]
) {
  function $if<IsTypeguard extends boolean, Guarded extends Argument, TransformResult>(
    predicate: Predicate<Argument, IsTypeguard, Guarded>,
    transform?: Transform<PredicateOutput<Argument, IsTypeguard, Guarded>, TransformResult>
  ) {

      return transform
        ? pushToStack(
            kind,
            hasArgument,
            argument as PredicateOutput<Argument, IsTypeguard, Guarded>,
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
  function $else<TransformResult>(
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
  } as ParseSwitchOutput<Kind, HasArgument, OriginalArgument, Argument, CombinedResult>;

};

export type ParseSwitchOutput<Kind extends SwitchKind, HasArgument extends boolean, OriginalArgument, Argument, CombinedResult> = {

  if<Guarded extends Argument>(typeguard: Typeguard<Argument, Guarded>): 
    ParseTransformOutput<Kind, HasArgument, OriginalArgument, Argument, Exclude<Argument, Guarded>, CombinedResult>;

  if(predicate: NonTypeguard<Argument>): 
    ParseTransformOutput<Kind, HasArgument, OriginalArgument, Argument, Argument, CombinedResult>;

  if<Guarded extends Argument, TransformResult>(
    typeguard: Typeguard<Argument, Guarded>,
    transform: Transform<Guarded, TransformResult>
  ):
    PushToStackOutput<Kind, HasArgument, OriginalArgument, Exclude<Argument, Guarded>, TransformResult, CombinedResult>;
  
  if<TransformResult>(
    predicate: NonTypeguard<Argument>,
    transform: Transform<Argument, TransformResult>
  ):
    PushToStackOutput<Kind, HasArgument, OriginalArgument, Argument, TransformResult, CombinedResult>;

} & ( Kind extends 'first' ? {} : {

  else<TransformResult>(
    transform: Transform<Argument, TransformResult>
  ):
    PushToStackOutput<'last', HasArgument, OriginalArgument, Argument, TransformResult, CombinedResult>;

} );

export function parseTransform<
  Kind extends SwitchKind,
  HasArgument extends boolean,
  OriginalArgument,
  Argument,
  Narrowed extends Argument,
  CombinedResult
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument,
  predicate: Predicate,
  switchStack: [ Predicate, Transform ][]
) {
  return {

    then: <TransformResult>(transform: Transform<Argument, TransformResult>) => pushToStack(
      kind,
      hasArgument,
      argument,
      predicate,
      transform,
      switchStack
    ),

  } as ParseTransformOutput<Kind, HasArgument, OriginalArgument, Argument, Narrowed, CombinedResult>;
}
export type ParseTransformOutput<Kind extends SwitchKind, HasArgument extends boolean, OriginalArgument, Argument, Narrowed extends Argument, CombinedResult> = {
  then<TransformResult>(
    transform: Transform<Argument, TransformResult>
  ):
    // PushToStackOutput<Kind, HasArgument, Argument, TransformResult, CombinedResult>;
    PushToStackOutput<Kind, HasArgument, OriginalArgument, Narrowed, TransformResult, CombinedResult>;

};


export function pushToStack<
  Kind extends SwitchKind,
  HasArgument extends boolean,
  OriginalArgument, 
  Argument,
  TransformResult,
  CombinedResult
>(
  kind: Kind,
  hasArgument: HasArgument,
  argument: Argument | undefined,
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
  ) as PushToStackOutput<Kind, HasArgument, OriginalArgument, Argument, TransformResult, CombinedResult>;

};

export type PushToStackOutput<Kind extends SwitchKind, HasArgument extends boolean, OriginalArgument, Argument, TransformResult, CombinedResult> = (

  Kind extends 'last'
    ? Evaluate<HasArgument, OriginalArgument, Argument, CombinedResult | TransformResult>
    : ParseSwitchOutput<undefined, HasArgument, OriginalArgument, Argument, CombinedResult | TransformResult>

);

export function evaluate<
  HasArgument extends boolean,
  OriginalArgument,
  Argument,
  CombinedResult
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
  ) as Evaluate<HasArgument, OriginalArgument, Argument, CombinedResult>;

};

export type Evaluate<HasArgument extends boolean, OriginalArgument, Argument, CombinedResult> = (

  HasArgument extends true
    ? CombinedResult
    : (arg: OriginalArgument) => CombinedResult

);


export function check<Argument>(): ParseSwitchOutput<'first', false, Argument, Argument, never>;

export function check<Argument>(argument: Argument): ParseSwitchOutput<'first', true, Argument, Argument, never>;

export function check<Argument>(argument?: Argument) {
  return parseSwitch(
    'first',
    !!argument,
    argument,
    []
  );
};

export const transform = check;
// An alias to make the code more readable for cases where we perform actual transformations, like:

const switchCase =
  transform<string>()
    .if( string => !!string.match(/^[A-Z]*$/), to.lowerCase )
    .if( string => !!string.match(/^[a-z]*$/), to.upperCase )
    .else( give.error("Only fully uppercase or lowercase strings are allowed") );

export function $if<Argument, Guarded extends Argument, TransformResult>(
  argument: Argument,
  typeguard: Typeguard<Argument, Guarded>,
  transform: Transform<Guarded, TransformResult>
): PushToStackOutput<'first', true, Argument, Exclude<Argument, Guarded>, TransformResult, never>;

export function $if<Argument, TransformResult>(
  argument: Argument,
  predicate: NonTypeguard<Argument>,
  transform: Transform<Argument, TransformResult>
): PushToStackOutput<'first', true, Argument, Argument, TransformResult, never>;

export function $if<Argument, IsTypeguard extends boolean, Guarded extends Argument, TransformResult>(
  argument: Argument,
  predicate: Predicate<Argument, IsTypeguard, Guarded>,
  transform: Transform<PredicateOutput<Argument, IsTypeguard, Guarded>, TransformResult>
) {
  return pushToStack(
    'first' as const, true, argument as PredicateOutput<Argument, IsTypeguard, Guarded>, predicate, transform, []
  )
};

// Tests:

const castArray =
  $if('something' as string | string[], is.array, give.map(to.string))
  .else(give.array);

const absoluteValue = 
  $if(-5, x => x < 0, x => -x)
  .else(x => x);

const keyNames = 
  check('something' as string | string[] | object)
    .if(is.array, give.map(to.string))
    .if(is.string, give.array)
    .if(is.object, give.keys)
    .else(give.compileTimeError);

const getKeyNames =
  check<string | string[] | object>()
    .if(is.array, give.map(to.string))
    .if(is.string, give.array)
    .if(is.object, give.keys)
    .else(give.compileTimeError);

const keyNames2 = getKeyNames({ this: 'is', an: 'object' }); // ['this', 'an']

console.log(keyNames);