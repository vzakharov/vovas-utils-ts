import { ensure } from "../..";

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
) {

  type MatchingPredicate = Predicate<Argument>;

  // function $if<P extends MatchingPredicate>(predicate: P): typeof parseTransform;
  // function $if<P extends MatchingPredicate, T extends MatchingTransform<P>>(predicate: P, transform: T): typeof stack;

  function $if<P extends MatchingPredicate, T extends MatchingTransform<P>>(predicate: P, transform?: T) {
      
      return transform
        ? stack<Kind, HasArgument, Argument, P, T, CombinedResult>(
            kind,
            hasArgument,
            argument as NarrowedAfterPredicate<P>,
            predicate,
            transform,
            switchStack
          )
        : parseTransform<Kind, HasArgument, Argument, P, CombinedResult>(
            kind,
            hasArgument,
            argument as NarrowedAfterPredicate<P>,
            predicate,
            switchStack
          );

  };

  function $else<T extends MatchingTransform<typeof alwaysTrue>>(transform: T) {

    const alwaysTrue: (arg: Argument) => true = () => true;

    return stack<'last', HasArgument, Argument, typeof alwaysTrue, T, CombinedResult>(
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
  };

};

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
) { 
  return {

    then: <T extends MatchingTransform<P>>(transform: T) => stack<Kind, HasArgument, Argument, P, T, CombinedResult>(
      kind,
      hasArgument,
      argument,
      predicate,
      transform,
      switchStack
    ),

  }
}



export function stack<
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
) {

  switchStack.push([predicate, transform]);

  if ( kind === 'last' ) {

    return evaluate<HasArgument, Argument, CombinedResult>(
      hasArgument,
      argument,
      switchStack
    );

  } else {

    return parseSwitch<undefined, HasArgument, Argument, CombinedResult>(
      undefined,
      hasArgument,
      argument,
      switchStack
    );

  };

};

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

  if ( hasArgument ) {
    return evaluateForArgument(argument);
  } else {
    return evaluateForArgument;
  }

};

// }; }

function check<T>(value: T) {
  return parseSwitch<'first', true, T, never>(
    'first',
    true,
    value,
    []
  );
};

check(1).if(x => x === 1, x => x + 1).else(x => x + 2);