import _ from 'lodash';
import { tuple } from '../../types';
import { check } from '../check';
import { respectively } from '../respectively';
import { give } from '../transforms/common';
import { conformsToTypeguardMap, GuardedWithMap, isTypeguardMap, NonTypeguard, Predicate, Typeguard, TypeguardMap } from '../typings';
import { is } from './common';

export function isLike<Object extends object, Map extends TypeguardMap>(sample: Map): (arg: Object) => arg is Object & GuardedWithMap<Map>;

export function isLike(sample: RegExp): (arg: string) => boolean;

export function isLike(sample: RegExp | TypeguardMap): (arg: string | object) => boolean;

export function isLike(sample: RegExp | TypeguardMap) {
  return ( arg: string | object ) => {
    const result = check( arg, sample )
      .if ( respectively(is.string, is.regexp), ( [ arg, sample ] ) => sample.test(arg) )
      .if ( respectively(is.object, isTypeguardMap), ( [ arg, sample ] ) => conformsToTypeguardMap(sample)(arg) )
      .else ( give.error("Expected a string and a regexp, or an object and an object") );
    return result;
  };
};

// with typeguard
export function its<Key extends keyof Obj, Guarded extends Obj[Key], Obj extends object>(
  key: Key, 
  typeguard: Typeguard<Obj[Key], Guarded>
): Typeguard<Obj, Obj & { [K in Key]: Guarded }>;

// with non-typeguard predicate
export function its<Key extends keyof Obj, Obj extends object>(
  key: Key,
  predicate: NonTypeguard<Obj[Key]>
): NonTypeguard<Obj>;

export function its(
  key: any,
  predicate: Predicate
) {
  return (
    (arg: any) => predicate(arg[key])
  );
};

export const their = its;