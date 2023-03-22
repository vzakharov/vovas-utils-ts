// There are two types of comparators: predicates and typeguards.
// Predicates are functions that return a boolean.
// Typeguards are functions that return a boolean and narrow the type of the argument.
//
// As JavaScript does not have a type system, there is no way to distinguish between a predicate and a typeguard at runtime.
// Therefore, we need to create a type system that can distinguish between them.
// To do this, we'll explicitly mark predicates and typeguards with a type property (so they will be functions with a type property).
// A drawback of this approach is that we can't use existing TypeScript-compatible typeguards from other libraries such as lodash.
// We will work around this by creating our own typeguards for the most common use cases, possibly just reusing the typeguards from lodash.

import { isTyped, toType } from "../..";

export type Predicate<T = any> = {
  type: 'predicate';
  (arg: T): boolean;
};

export type Typeguard<Narrowed extends Base, Base = any> = {
  type: 'typeguard';
  (arg: Base): arg is Narrowed;
};

export const isPredicate = isTyped('predicate');
export const isTypeguard = isTyped('typeguard');

export const toPredicate = toType('predicate');
export const toTypeguard = toType('typeguard');