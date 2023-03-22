export function wrap<Function extends (arg1: any, arg2: any) => any>(
  fn: Function,
  arg2: Parameters<Function>[1]
): ( target: Parameters<Function>[0] ) => ReturnType<Function>

export function wrap<Function extends (arg1: any, arg2: any, arg3: any) => any>(
  fn: Function,
  arg2: Parameters<Function>[1],
  arg3: Parameters<Function>[2]
): ( target: Parameters<Function>[0] ) => ReturnType<Function>

export function wrap<Function extends (...args: any[]) => any>(
  fn: Function,
  ...args: Parameters<Function>
) {
  return ( target: Parameters<Function>[0] ) => fn(target, ...args);
}