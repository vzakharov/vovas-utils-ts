import { ensureProperty } from "./ensure.js";

export default function doWith<T, Result>(
  target: T,
  callback: (target: T) => Result,
  { finally: cleanMethodName }: { finally: string }
): Result {
  try {
    return callback(target);
  } finally {
    ensureProperty<Function>(target, cleanMethodName)();
  }
}