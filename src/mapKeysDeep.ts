import _ from 'lodash';

export function mapKeysDeep(obj: Record<string, any>, fn: (key: string) => string): Record<string, any> {
  // return _.mapKeys(obj, (value, key) => {
  //   if (_.isPlainObject(value)) {
  //     return fn(key);
  //   }
  //   return key;
  // });
  // We need "deep", i.e. recursive, mapping
  return _(obj)
    .mapValues( value => {
      if (_.isPlainObject(value)) {
        return mapKeysDeep(value, fn);
      }
      return value;
    } )
    .mapKeys( (__, key) => fn(key))
    .value();
};