import _ from 'lodash';

import { Primitive, isPrimitive } from "./types";

export type HasType<T extends string> = {
  type: T;
};

export type Typed<O extends object, T extends string> = O & HasType<T>;

export function typed<T extends string>(
  type: T
): <O extends object>(object: O) => Typed<O, T> {
  return object => Object.assign(object, { type });
}

// Example:
const apple = typed('fruit')({ color: 'red' });

export function isTyped<T extends string>(
  type: T
): <O extends object>(object: O) => object is Typed<O, T> {
  return function(object: any): object is Typed<any, T> {
    return object.type === type;
  }
}

// Example:
if ( isTyped('fruit')(apple) )
  console.log(apple.color);
else
  apple; // should compile to "never"