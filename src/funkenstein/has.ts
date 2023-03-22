import _ from "lodash";
import { $if } from "./$switch";

export function has<T extends object, U extends {}>(source: Readonly<U>): (target: T) => target is T & U {
  return ( (target) => _.isMatch(target, source) ) as (target: T) => target is T & U;
}

// Example / compile-time test:
//
type Dog = { class: "dog", breed: string };
type Car = { class: "car", make: string };
type DogOrCar = Dog | Car;

const dog: Dog = { class: "dog", breed: "labrador" };
const car: Car = { class: "car", make: "ford" };

const categorize = (item: DogOrCar): string =>
  $if( item, 
    has({ class: "dog" } as const), item => // `as const` is needed to make the type narrowing work
      `It's a dog of breed ${item.breed}` ) 
  .else( item => 
    `It's a car of make ${item.make}` );