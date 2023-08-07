export type Camelize<T> =
  T extends string
    ? T extends `${infer U}_${infer V}`
      ? `${Lowercase<U>}${Capitalize<Camelize<V>>}`
      : Lowercase<T>
    : T extends object[]
      ? Camelize<T[number]>[]
      : T extends object
        ? {
          [K in keyof T as Camelize<K & string>]: Camelize<T[K]>
        }
        : T;