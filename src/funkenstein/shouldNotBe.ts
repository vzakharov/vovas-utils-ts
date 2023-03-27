// A function that reports an error on compile time if its item is of any other type than `never`.
export function shouldNotBe(item: never): never {
  throw new Error(`This should not exist: ${item}`);
}

export const compileTimeError = shouldNotBe;