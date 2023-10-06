export type ReifyInterface<T> = {
  [P in keyof T]:
    T[P] extends (infer U)[] 
      ? ReifyInterface<U>[] 
    : T[P] extends object | undefined
      ? ReifyInterface<NonNullable<T[P]>> | undefined 
    : T[P] extends object
      ? NonNullable<ReifyInterface<T[P]>>
    : T[P];
};