export function throwError<T extends Error>(error: T): never
export function throwError(message: string): never
export function throwError<T extends Error>(error: T | string): never {
  if (typeof error === 'string') {
    throw new Error(error);
  } else {
    throw error;
  }
}