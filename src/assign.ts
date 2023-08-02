import { is } from ".";

export type StrictlyPartial<T> = {
  [K in string]: K extends keyof T ? T[K] : never;
};

export function assign<T extends Record<string, any>, U extends Partial<T>>(
  object: T, 
  newValuesOrCallback: U | ((object: T) => U)
) {
  return Object.assign(object,
    is.function(newValuesOrCallback)
      ? newValuesOrCallback(object)
      : newValuesOrCallback
  ) as Required<T> extends Required<U> ? T & U : never;
};

export function mutate<T extends Record<string, any>, U extends Partial<T>>(
  object: T,
  newValuesOrCallback: U | ((object: T) => U)
): asserts object is Required<T> extends Required<U> ? T & U : never {
  assign(object, newValuesOrCallback);
};

// // example/test

// const a = { b: '123', c: '456' };
// mutate(a, {
//   c: '789',
//   d: '101112' // should be error because d is not in a
// });


// type Person = {
//   name: string;
//   age: number;
//   // and some optional field
//   phone?: string;
//   address?: string;
// };

// type PartialPerson = Partial<Person>;

// const vova: Person = {
//   name: 'Vova',
//   age: 38
// };

// type StrictlyPartialPerson = StrictlyPartial<Person>;

// vova.phone.replace('+', ''); // error because phone is optional

// mutate(vova, { phone: '+123456789' });

// // mutate(vova, { phone: '123', location: 'New York' }); // Makes `vova` to be `never`, because `location` is not in `Person`. I couldn't find a way to make it work by reporting an error instead of making `vova` to be `never`. But even if it's `never`, it's still useful because any further usage of `vova` will be likely reported as error.

// vova.phone.replace('+', ''); // no error because phone isn't optional anymore

// // To compare with the usual Object.assign:

// Object.assign(vova, { address: 'New York' }); // no autocomplete suggestions for `address`

// vova.address.replace('New', 'Old'); // error because address is still optional

// Object.assign(vova, { location: 'New York' }); // no error because Object.assign doesn't check types