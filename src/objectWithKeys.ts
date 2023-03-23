import _ from 'lodash';

export function objectWithKeys<
  Key extends string,
  Initializer extends (key: Key) => ReturnType,
  ReturnType
>(
  keys: Key[],
  initializer: Initializer
): {
  [key in Key]: ReturnType;
} {
  return _.fromPairs(
    keys.map(
      (key) => [key, initializer(key)]
    )
  ) as {
    [key in Key]: ReturnType;
  };
}