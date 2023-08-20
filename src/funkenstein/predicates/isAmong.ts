export function isAmong<T, U extends T[]>(options: U): (arg: T) => arg is U[number] {
  return (arg: T): arg is U[number] => options.includes(arg as any);
}