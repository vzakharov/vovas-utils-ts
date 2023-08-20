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
): asserts object is T & U {
  assign(object, newValuesOrCallback);
};

export function addProperties<T extends object, U extends object>(
  object: T,
  newValuesOrCallback: U | ((object: T) => U)
): asserts object is T & U {
  Object.assign(object,
    is.function(newValuesOrCallback)
      ? newValuesOrCallback(object)
      : newValuesOrCallback
  );
};