import _ from 'lodash';

export function objectWithKeys<
  Key extends string,
  ReturnType
>(
  keys: Key[] | readonly Key[],
  initializer: (key: Key) => ReturnType
) {
  return _.fromPairs(
    keys.map(
      (key) => [key, initializer(key)]
    )
  ) as {
    [key in Key]: ReturnType;
  };
}