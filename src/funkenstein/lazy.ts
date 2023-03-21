export function lazily<Function extends (...args: any[]) => any>(func: Function, ...args: Parameters<Function>):
  () => ReturnType<Function>

export function lazily<Function extends (...args: any[]) => any>(func: Function):
  (...args: Parameters<Function>) => () => ReturnType<Function>

export function lazily<Function extends (...args: any[]) => any>(func: Function, ...args: Parameters<Function>): 
  () => ReturnType<Function> | ( (...args: Parameters<Function>) => () => ReturnType<Function> ) 
{
  return args.length
    ? () => func(...args)
    : (...args: Parameters<Function>) => () => func(...args);
};

// This is essentially a "thunk" function, but I found the name "lazily" to be more intuitive and less confusing.