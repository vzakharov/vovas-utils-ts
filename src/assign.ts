import { is } from ".";

export function assign<T extends Record<string, any>, U extends Partial<T>>(
  object: T, 
  newValuesOrCallback: U | ((object: T) => U)
): T & U {
  return Object.assign(object,
    is.function(newValuesOrCallback)
      ? newValuesOrCallback(object)
      : newValuesOrCallback
  );
};

export function mutate<T extends Record<string, any>, U extends Partial<T>>(
  object: T,
  newValuesOrCallback: U | ((object: T) => U)
): asserts object is T & U {
  assign(object, newValuesOrCallback);
};

// // example/test

// type Person = {
//   name: string;
//   age: number;
//   // and some optional field
//   phone?: string;
//   address?: string;
// };

// const vova: Person = {
//   name: 'Vova',
//   age: 38
// };

// vova.phone.replace('+', ''); // error because phone is optional

// mutate(vova, { phone: '+123456789' });

// mutate(vova, { location: 'New York' }); // error because location is not in Person

// // now vova is Person & { phone: string }

// vova.phone.replace('+', ''); // no error because phone isn't optional anymore

// // To compare with the usual Object.assign:

// Object.assign(vova, { address: 'New York' }); // no autocomplete suggestions for `address`

// vova.address.replace('New', 'Old'); // error because address is optional

// Object.assign(vova, { location: 'New York' }); // no error because assign doesn't check types