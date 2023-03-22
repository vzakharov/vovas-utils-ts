import { $if, check, has, shouldntExist } from ".";

export function get<T extends object>(key: keyof T): (obj: T) => T[keyof T] {
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
        get(
          "breed") )
    .if( has({ class: 
      "car" } as const),
        get(
          "make") )
    .if( has({ class: 
      "person" } as const),
        get(
          "ethnicity") )
    .else( 
      shouldntExist ); // should give a compile-time error if any of the above cases are commented out
