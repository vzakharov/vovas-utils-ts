import { ensure } from "../..";

export type Predicate =
  ( (arg: any) => boolean )
  | ( (arg: any) => arg is any )

export type Transform = 
  (arg: any) => any

export type CheckState = {
  switchKind?: 'first' | 'last';
  argumentSet: boolean;
  argument?: any;
  predicate?: Predicate;
  transform?: Transform;
  switchStack: [
    Predicate,
    Transform
  ][];
};


export const StateMachine = {

  check<State extends CheckState>(state: State) {

    return StateMachine.if({
      ...state,
      switchKind: 'first',
      argumentSet: true,
      argument: state.argument
    });

  },


  if<State extends CheckState>(state: State) {

    return {

      if: <P extends Predicate, T extends Transform>(predicate: P, transform?: T) =>
        state.transform
          ? StateMachine.stack({ ...state, predicate, transform })
          : StateMachine.then({ ...state, predicate, transform }),

      ...( state.switchKind === 'first' ? {} : {

        else: <T extends Transform>(transform: T) => StateMachine.then({
          ...state,
          switchKind: 'last',
          predicate: () => true,
          transform
        })

      }),

    };

  },


  then<State extends CheckState>(state: State) {

    return {

      then: <T extends Transform>(transform: T) => StateMachine.stack({
        ...state,
        transform
      }),

    };

  },

  stack<State extends CheckState>(state: State) {

    const machineArgs = {
      ...state,
      switchKind: undefined,
      predicate: undefined,
      transform: undefined,
      switchStack: [
        ...state.switchStack,
        [ensure(state.predicate), ensure(state.transform)]
      ]
    };

    return state.switchKind === 'last'
      ? StateMachine.evaluate(machineArgs)
      : StateMachine.if(machineArgs);

  },


  evaluate<State extends CheckState>(state: State) {

    function evaluateForArgument(argument: any) {

      for (const [predicate, transform] of state.switchStack) {

        if ( predicate(argument) ) {
          return transform(argument);
        }

      }

      throw new Error(`No matching predicate found for argument ${argument} (this should never happen)`);

    };

    return state.argumentSet ? evaluateForArgument(state.argument) : evaluateForArgument;

  },

};