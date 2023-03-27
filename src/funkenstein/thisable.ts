export function thisable<This, Args extends any[], Return>(
  fn: (own: This, ...args: Args) => Return,
) {
  return function(this: This, ...args: Args) {
    return fn(this, ...args);
  };
};

// Test:
// import { thisable } from './thisable';

type HasName = {
  name: string;
};

const sayHello = thisable((own: HasName) => {
  console.log(`Hello, ${own.name}!`);
});

const person = {
  name: 'John',
  sayHello,
};

person.sayHello(); // Hello, John!