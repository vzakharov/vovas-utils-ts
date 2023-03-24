import { ensure } from "../..";

export type Predicate =
  ( (arg: any) => boolean )
  | ( (arg: any) => arg is any )

export type Transform = 
  (arg: any) => any

export type CheckState = {
  step: 'check' | 'if' | 'then' | 'stack' | 'evaluate';
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


export function stateMachine<State extends CheckState>(state: State): NextState<State> {

  switch (state.step) {

    case 'check':

      return <T>(argument: T) => stateMachine({
        ...state,
        step: 'if',
        switchKind: 'first',
        argumentSet: true,
        argument
      });

    case 'if':

      return {

        if: <P extends Predicate, T extends Transform>(predicate: P, transform?: T) => stateMachine({
          ...state,
          step: transform ? 'stack' : 'then',
          predicate,
          transform
        }),

        ...( state.switchKind === 'first' ? {} : {

          else: <T extends Transform>(transform: T) => stateMachine({
            ...state,
            switchKind: 'last',
            step: 'then',
            predicate: () => true,
            transform
          })

        }),

      };


    case 'then':

      return {
          
        then: <T extends Transform>(transform: T) => stateMachine({
          ...state,
          step: 'stack',
          transform
        }),

      };

    case 'stack':

      return stateMachine({
        ...state,
        step: state.switchKind === 'last' ? 'evaluate' : 'if',
        switchKind: undefined,
        predicate: undefined,
        transform: undefined,
        switchStack: [
          ...state.switchStack,
          [ensure(state.predicate), ensure(state.transform)]
        ]
      });

    case 'evaluate':

      function evaluateForArgument(argument: any) {

        for (const [predicate, transform] of state.switchStack) {

          // const predicate = typeof predicateOrKey === 'string' ? commonCheckers[predicateOrKey] : predicateOrKey;
          // const transform = typeof transformOrKey === 'string' ? commonTransforms[transformOrKey] : transformOrKey;

          if ( predicate(argument) ) {
            return transform(argument);
          }

        }

        throw new Error(`No matching predicate found for argument ${argument} (this should never happen)`);

      }

      return state.argumentSet ? evaluateForArgument(state.argument) : evaluateForArgument;

    default:

      throw new Error(`Invalid state: ${state.step} (this should never happen)`);

  }

};