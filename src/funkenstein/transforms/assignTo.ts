// `assignTo(object, 'property')` is equivalent to `value => object.property = value`
export function assignTo<T extends object>(object: T, property: keyof T):
  <V extends T[typeof property]>(value: V) => V {
  return value => object[property] = value;
}