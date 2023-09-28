import _ from "lodash";
import { is } from "./funkenstein";

export function ifGeneric<T>(value: T) {

  function fork<G, U, V>(
    typeguard: (value: T) => value is T & G,
    ifTrue: (value: G) => U,
    ifFalse: (value: Exclude<T, G>) => V
  ): T extends G ? U : V;
  
  function fork<G extends T, U, V>(
    typeguard: (value: T) => value is G,
    ifTrue: (value: G) => U,
    ifFalse: (value: Exclude<T, G>) => V
  ): T extends G ? U : V;
  
  function fork<G, U, V>(
    typeguard: (value: T) => value is T & G,
    ifTrue: (value: G) => U,
    ifFalse: (value: Exclude<T, G>) => V
  ) { 
    return (
      typeguard(value) ? ifTrue(value) : ifFalse(value as Exclude<T, G>)
    ) as T extends G ? U : V; 
  }

  return fork;
}

// Example

function stringNumberDial<T extends string | number>(
  value: T,
) {
  return ifGeneric(value)(
    is.string, 
    (value) => parseInt(value+"0"), 
    (value) => ( value + 1 ).toString()
  );
};
// Return type: T extends string ? number : string

stringNumberDial('1') + 1 // OK
stringNumberDial(1).toUpperCase() // OK

// // For comparison, without "ifGeneric"

// function vanillaDial(value: string | number) {
//   if (typeof value === 'string') {
//     return parseInt(value);
//   } else {
//     return value.toString();
//   };
// }
// // Return type: string | number

// vanillaDial('1') + 1 // Error: Operator '+' cannot be applied to types 'string | number' and 'number'
// vanillaDial(1).toUpperCase() // Error: Property 'toUpperCase' does not exist on type 'string | number'