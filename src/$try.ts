import _ from 'lodash';

export function $try<T>(fn: () => T, fallback: T): T
export function $try<T>(fn: () => T, fallback: () => T): T
export function $try<T>(fn: () => T, fallback: T | (() => T)): T {
  try {
    return fn();
  } catch (e) {
    return _.isFunction(fallback) ? fallback() : fallback;
  }
}