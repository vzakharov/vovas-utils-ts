import _ from 'lodash';
import { Typeguard } from './typings';


export type TypeguardMap<Keys extends string = string> = {
  [Key in Keys]: Typeguard;
};

export type GuardedWithMap<Map extends TypeguardMap> = {
  [Key in keyof Map]: Map[Key] extends Typeguard<any, infer Guarded> ? Guarded : never;
};

export type MapForType<T> = {
  [Key in keyof T]: Typeguard<any, T[Key]>;
};

export function isTypeguardMap(arg: any): arg is TypeguardMap {
  return _.isObject(arg) && _.every(arg, _.isFunction);
  // NOTE: We cannot actually check if the functions return what we want them to return, so this is a merely compile-time check.
};

export function conformsToTypeguardMap<Keys extends string, TG extends TypeguardMap<Keys>>(
  typeguardMap: TG
) {

  function conforms<T>(object: T): object is GuardedWithMap<TG> extends T ? GuardedWithMap<TG> : never {
    return _.every(typeguardMap, (typeguard, key) => typeguard(object[key as keyof T]));
  }

  return conforms;

};
