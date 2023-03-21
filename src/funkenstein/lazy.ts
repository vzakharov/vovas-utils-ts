export function lazy<Func extends (...args: any[]) => any>(func: Func, ...args: Parameters<Func>):
  () => ReturnType<Func> {
  return () => func(...args);
}