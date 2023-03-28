import _ from 'lodash';
import { tuple } from '../../types';
import { check } from '../check';
import { respectively } from '../respectively';
import { give } from '../transforms/common';
import { Typeguard } from '../typings';
import { is } from './common';

// export function isLike<T extends object, U extends object>(sample: U): (arg: T) => arg is T & U {
//   return ( (arg: T) => _.isMatch(arg, sample) ) as Typeguard<T, T & U>;

export function isLike<T extends object, U extends object>(sample: U): (arg: T) => arg is T & U;

export function isLike(sample: RegExp): (arg: string) => boolean;

export function isLike(sample: RegExp | object) {
  return ( arg: string | object ) =>
    check( tuple(arg, sample) )
      .if( respectively(is.string, is.regexp), ( [ arg, sample ] ) => sample.test(arg) )
      .if( respectively(is.object, is.object), ( [ arg, sample ] ) => _.isMatch(arg, sample) )
      .else( give.error("Expected a string and a regexp, or an object and an object") )
};