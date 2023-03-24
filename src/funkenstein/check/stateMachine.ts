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


export const stateMachine = {

  switch<State extends CheckState>(state: State) {

    return {

      if: <P extends Predicate, T extends Transform>(predicate: P, transform?: T) =>
        state.transform
          ? stateMachine.stack({ ...state, predicate, transform })
          : stateMachine.transform({ ...state, predicate, transform }),

      ...( state.switchKind === 'first' ? {} : {

        else: <T extends Transform>(transform: T) => stateMachine.transform({
          ...state,
          switchKind: 'last',
          predicate: () => true,
          transform
        })

      }),

    };

  },


  transform<State extends CheckState>(state: State) {

    return {

      then: <T extends Transform>(transform: T) => stateMachine.stack({
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
      ? stateMachine.evaluate(machineArgs)
      : stateMachine.switch(machineArgs);

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

export function check<T>(argument: T) {

  return stateMachine.switch({
    switchKind: 'first',
    argumentSet: true,
    argument,
    switchStack: []
  });

}