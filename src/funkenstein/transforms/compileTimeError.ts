// A function that reports an error on compile time if its item is of any other type than `never`.
export function compileTimeError(item: never): never {
  throw new Error(`This should not exist: ${item}`);
}

export const shouldNotBe = compileTimeError;