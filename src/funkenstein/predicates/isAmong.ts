export const isAmong = <U extends readonly any[]>(options: U) =>
  (arg: any): arg is U[number] => 
    options.includes(arg as any)