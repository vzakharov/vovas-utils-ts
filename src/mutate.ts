export const mutate = <T extends Record<string, any>>(object: T, newValues: Partial<T>): T =>
  Object.assign(object, newValues);