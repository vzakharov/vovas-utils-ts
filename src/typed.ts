import _ from 'lodash';

export type Typed<T extends string | number> = {
  type: T;
};

export type KindOf<T extends string | number> = {
  kind: T;
};

export function toType<T extends string | number>(
  type: T
): <O extends object>(object: O) => O & Typed<T> {
  return object => Object.assign(object, { type });
}

// Example:
// const apple = typed('fruit')({ color: 'red' });

export function isTyped<T extends string | number>(
  type: T
) {
  return function<O extends Typed<string | number>>(object: O): object is O & Typed<T> {
    return object.type === type;
  }
}

// Example:
// if ( isTyped('fruit')(apple) )
//   console.log(apple.color);
// else
//   apple; // should compile to "never"

export function isKindOf<T extends string | number>(
  kind: T
) {
  return function<O extends { kind: string }>(object: O): object is O & KindOf<T> {
    return object.kind === kind;
  }
}