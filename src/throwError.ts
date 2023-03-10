export function throwError<T extends Error>(error: T): never
export function throwError(message: string): never
export function throwError<T extends Error>(error: T | string): never {
  throw typeof error === 'string' ? new Error(error) : error;
}