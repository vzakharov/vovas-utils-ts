// `assignTo(object, 'property')` is equivalent to `value => object.property = value`
export function assignTo<T extends object, P extends keyof T>(object: T, property: P):
  <V extends T[P]>(value: V) => V {
  return value => object[property] = value;
}