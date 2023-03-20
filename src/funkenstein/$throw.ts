import { FunctionThatReturns } from "../types";

export function $throw<T extends Error>(error: T): never
export function $throw(message: string): never
export function $throw<T extends Error>(errorOrMessage: T | string): never
export function $throw<T extends Error>(errorOrMessage: T | string): never {
  throw typeof errorOrMessage === 'string' ? new Error(errorOrMessage) : errorOrMessage;
}

export function $thrower<T extends Error>(errorOrMessage: T | string): FunctionThatReturns<never> {
  return () => $throw(errorOrMessage);
}