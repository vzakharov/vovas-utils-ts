import { check } from "../check";
import { has } from "../predicates/has";
import { shouldNotBe } from "./compileTimeError";

// export function getProp<Object extends object>(key: keyof Object): (obj: Object) => Object[keyof Object] {
export function getProp<Object extends object, Key extends keyof Object>(key: Key): (obj: Object) => Object[Key] {
  return (obj) => obj[key];
}

// Example / compile-time test:
//
type Dog = { class: "dog", breed: string };
type Car = { class: "car", make: string };
type Person = { class: "person", ethnicity: string };

const category = (item: Dog | Car | Person): string =>
  check( item )
    .if( has({ class: 
      "dog" } as const), // `as const` is needed to make the type narrowing work
        getProp(
          "breed") )
    .if( has({ class: 
      "car" } as const),
        getProp(
          "make") )
    .if( has({ class: 
      "person" } as const),
        getProp(
          "ethnicity") )
    .else( 
      shouldNotBe ); // should give a compile-time error if any of the above cases are commented out
