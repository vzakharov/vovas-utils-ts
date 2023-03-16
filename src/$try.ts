import _ from 'lodash';

export function $try<T>(fn: () => T, fallback: T): T
export function $try<T>(fn: () => T, fallback: (error?: Error) => T): T
export function $try<T>(fn: () => T, fallback: T | ((error?: Error) => T)): T {
  try {
    return fn();
  } catch (e: any) {
    return _.isFunction(fallback) ? fallback(e) : fallback;
  }
}