export function isAmong<U extends readonly any[]>(options: U) {
  return (arg: any): arg is U[number] => 
    options.includes(arg as any);
};