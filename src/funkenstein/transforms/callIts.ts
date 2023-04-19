import { check } from "../check";
import { is } from "../predicates/common";
import { shouldNotBe } from "./compileTimeError";

export function callIts<Key extends PropertyKey, Args extends any[]>(
  key: Key,
  ...args: Args
): <Object extends Record<Key, (...args: Args) => any>>(object: Object) => ReturnType<Object[Key]> {
  return (object) => object[key](...args);
}

export const please = callIts;

// Example / compile-time test:
//
type Dog = { type: "dog", bark: () => string };
type Cat = { type: "cat", meow: () => string };
type DogOrCat = Dog | Cat;

const makeSound = (animal: DogOrCat): string =>
  check( animal )
    .if( is.typed("dog"), callIts("bark") )
    .if( is.typed("cat"), callIts("meow") )
    .else( shouldNotBe );