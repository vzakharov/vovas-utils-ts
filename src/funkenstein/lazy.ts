export function lazy<Function extends (...args: any[]) => any>(func: Function, ...args: Parameters<Function>):
  () => ReturnType<Function>

export function lazy<Function extends (...args: any[]) => any>(func: Function):
  (...args: Parameters<Function>) => () => ReturnType<Function>

export function lazy<Function extends (...args: any[]) => any>(func: Function, ...args: Parameters<Function>): 
  () => ReturnType<Function> | ( (...args: Parameters<Function>) => () => ReturnType<Function> ) 
{
  return args.length
    ? () => func(...args)
    : (...args: Parameters<Function>) => () => func(...args);
};