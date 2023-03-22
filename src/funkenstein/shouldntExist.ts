// A function that reports an error on compile time if its item is of any other type than `never`.
export function shouldntExist(item: never): never {
  throw new Error(`This should not exist: ${item}`);
}