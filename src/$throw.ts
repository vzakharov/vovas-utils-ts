export function $throw<T extends Error>(error: T): never
export function $throw(message: string): never
export function $throw<T extends Error>(error: T | string): never {
  throw typeof error === 'string' ? new Error(error) : error;
}