import _ from 'lodash';
import { conformsToTypeguardMap, GuardedWithMap, TypeguardMap } from '../typings';

export function isLike<Map extends TypeguardMap>(sample: Map): <T>(arg: T) => arg is T & GuardedWithMap<Map> {

  return (
    _.isObject(sample) ?
      conformsToTypeguardMap(sample)
      : () => false
  ) as <T>(arg: T) => arg is T & GuardedWithMap<Map>;
  
};