import _ from 'lodash';
import { $throw } from './$throw';

export function $try<T>(fn: () => T, fallbackValue: T, finallyCallback?: () => void): T
export function $try<T>(fn: () => T, fallback: (error?: Error) => T, finallyCallback?: () => void): T
export function $try<T>(
  fn: () => T,
  fallback: T | ((error?: Error) => T) = $throw,
  finallyCallback?: () => void
): T {
  try {
    return fn();
  } catch (e: any) {
    return _.isFunction(fallback) ? fallback(e) : fallback;
  } finally {
    finallyCallback?.();
  }
};