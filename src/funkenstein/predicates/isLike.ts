import { conformsToTypeguardMap, GuardedWithMap, TypeguardMap } from '../typings';

export function isLike<Map extends TypeguardMap>(sample: Map): <Object extends object>(arg: Object) => arg is Object & GuardedWithMap<Map> {

  return conformsToTypeguardMap(sample) as <Object extends object>(arg: Object) => arg is Object & GuardedWithMap<Map>;
  
};