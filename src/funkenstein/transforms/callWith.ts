export function callWith<Args extends any[]>(
  ...args: Args
) {
  return <Fn extends (...args: Args) => T, T>(fn: Fn) => fn(...args);
};