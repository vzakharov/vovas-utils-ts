import { ensure } from "../..";

// export type Predicate =
//   ( (arg: any) => boolean )
//   | ( (arg: any) => arg is any )
export type Predicate<Base = any, IsTypeguard extends boolean = boolean, Guarded extends Base = Base> =
  IsTypeguard extends true
    ? ( (arg: Base) => arg is Guarded )
    : ( (arg: Base) => boolean );

// export type Transform = 
//   (arg: any) => any
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

export type TransformForPredicate<Pdct extends Predicate, Result = any> =
  Transform<
    PredicateResult<Pdct>,
    Result
  >;


export type NarrowedType<Base, IsTypeguard extends boolean, Guarded extends Base> =
  IsTypeguard extends true
    ? Exclude<Base, Guarded>
    : Base;

// export type CheckState = {
//   switchKind?: 'first' | 'last';
//   hasArgument: boolean;
//   argument?: any;
//   predicate?: Predicate;
//   transform?: Transform;
//   switchStack: [
//     Predicate,
//     Transform
//   ][];
// };

export type SwitchKind = 'first' | 'last' | undefined;
export type SwitchStack = [
  Predicate,
  Transform
][];

export type CheckState<
  Kind extends SwitchKind,
  HasArgument extends boolean,
  Argument extends any,
  Pdct extends Predicate<Argument> | undefined,
  Trfm extends TransformForPredicate<NonNullable<Pdct>> | undefined,
  CombinedResult extends any,
  Stack extends SwitchStack
> = {
  switchKind: SwitchKind;
  hasArgument: HasArgument;
  argument: Argument;
  predicate: Pdct;
  transform: Trfm;
  switchStack: Stack;
};

  


// export function stateMachine<State extends CheckState>(state: State): StateMachine<State> { return {
export function stateMachine<
  Kind extends SwitchKind,
  HasArgument extends boolean,
  Argument extends any,
  Pdct extends Predicate<Argument> | undefined,
  Trfm extends TransformForPredicate<NonNullable<Pdct>> | undefined,
  CombinedResult extends any,
  Stack extends SwitchStack
>(state: CheckState<Kind, HasArgument, Argument, Pdct, Trfm, CombinedResult, Stack>) { return {


  switch() {

    return {

      // if<P extends Predicate, T extends Transform>(predicate: P, transform?: T) {
      if: <
        P extends Predicate<Argument>, T extends TransformForPredicate<P>
      >(predicate: P, transform?: T) => {
        return transform
          // ? stateMachine({ ...state, predicate, transform }).stack()
          ? stateMachine<
            Kind,                       // same
            HasArgument,                // same
            NarrowedAfterPredicate<P>,  // narrowed
            P,                          // updated
            T,                          // updated
            CombinedResult
              | TransformResult<T>,     // extended
            Stack                       // same
          >({ ...state, 
            argument: state.argument as NarrowedAfterPredicate<P>, 
            predicate, 
            transform 
          }).stack()
          // : stateMachine({ ...state, predicate }).transform();
          : stateMachine<
            Kind,                       // same
            HasArgument,                // same
            NarrowedAfterPredicate<P>,  // narrowed
            P,                          // updated
            undefined,                  // updated (but should have been undefined before)
            CombinedResult,             // same
            Stack                       // same
          >({ ...state, 
            argument: state.argument as NarrowedAfterPredicate<P>, 
            predicate, 
            transform: undefined 
          }).parseTransform();


      },

      ...( state.switchKind === 'first' ? {} : {

        // else: <T extends Transform>(transform: T) => stateMachine({
        else: <T extends TransformForPredicate<(arg: Argument) => true>>(transform: T) => stateMachine<
          Kind,                       // same
          HasArgument,                // same
          Argument,                   // same
          (arg: Argument) => true,    // updated
          T,                          // updated
          CombinedResult
            | TransformResult<T>,     // extended
          Stack                       // same
        >({
          ...state,
          switchKind: 'last',
          predicate: () => true,
          transform
        }).parseTransform()

      }),

    } as {

      if<P extends Predicate<Argument>>(predicate: P): typeof stateMachine<
        Kind,                       // same
        HasArgument,                // same
        NarrowedAfterPredicate<P>,  // narrowed
        P,                          // updated
        undefined,                  // updated (but should have been undefined before)
        CombinedResult,             // same
        Stack                       // same
      >
    } & Kind extends 'first'
      ? {}                          // no else
      : {

        else<T extends TransformForPredicate<(arg: Argument) => true>>(transform: T): typeof stateMachine<
          Kind,                       // same
          HasArgument,                // same
          Argument,                   // same
          (arg: Argument) => true,    // updated
          T,                          // updated
          CombinedResult
            | TransformResult<T>,     // extended
          Stack                       // same
        >

      };


  },


  parseTransform() {

    return {

      then: <T extends Transform>(transform: T) => stateMachine({
        ...state,
        transform
      }).stack(),

    } as unknown as MachineMethodOutput<State, 'transform'>;

  },

  stack() {

    const newState = {
      ...state,
      switchKind: undefined,
      predicate: undefined,
      transform: undefined,
      switchStack: [
        ...state.switchStack,
        [ensure(state.predicate), ensure(state.transform)]
      ]
    };

    return (
      state.switchKind === 'last'
        ? stateMachine(newState).evaluate()
        : stateMachine(newState).switch()
    ) as MachineMethodOutput<State, 'stack'>;

  },

  evaluate() {

    function evaluateForArgument(argument: any) {

      for (const [predicate, transform] of state.switchStack) {

        if ( predicate(argument) ) {
          return transform(argument);
        }

      }

      throw new Error(`No matching predicate found for argument ${argument} (this should never happen)`);

    };

    return (
      state.hasArgument 
        ? evaluateForArgument(state.argument)
        : evaluateForArgument
    ) as MachineMethodOutput<State, 'evaluate'>;

  },

}; }

export function check<T>(argument: T) {

  return stateMachine({
    switchKind: 'first',
    hasArgument: true,
    argument,
    switchStack: []
  }).switch();

}

check(1)
.if( (arg: any) => arg === 1, (arg: any) => arg + 1 )

// export type StateMachine<State extends CheckState> = {

//   switch: () =>

//     {

//       if: <P extends Predicate, T extends Transform>(predicate: P, transform?: T) =>
//         T extends Transform
//           ? StateMachine<State & { predicate: P, transform: T }>['stack']
//           : StateMachine<State & { predicate: P }>['transform'];

//     } & ( State['switchKind'] extends 'first' ? {} : {

//       else: <T extends Transform>(transform: T) => StateMachine<State & { predicate: () => true, transform: T }>['transform'];

//     } ),

//   transform: () => {

//     then: <T extends Transform>(transform: T) => StateMachine<State & { transform: T }>['stack'];

//   },

//   stack: () =>

//     State['switchKind'] extends 'last'
//     ? StateMachine<State & {
//         switchKind: undefined,
//         predicate: undefined,
//         transform: undefined,
//         switchStack: [
//           ...State['switchStack'],
//           [Predicate, Transform]
//         ]
//       }>[ 'evaluate' ]
//     : StateMachine<State & {
//         switchKind: undefined,
//         predicate: undefined,
//         transform: undefined,
//         switchStack: [
//           ...State['switchStack'],
//           [Predicate, Transform]
//         ]
//       }>[ 'switch' ],

//   evaluate: () =>

//     State['hasArgument'] extends true
//       ? any
//       : (argument: any) => any;


// }

// export type MachineMethodOutput<State extends CheckState, Method extends keyof StateMachine<State>> =
//   StateMachine<State>[Method] extends () => infer Output
//     ? Output
//     : never;