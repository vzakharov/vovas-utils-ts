import _ from 'lodash';

export type Predicate<Base = any, IsTypeguard extends boolean = boolean, Guarded extends Base = Base> =
  IsTypeguard extends true
    ? ( (arg: Base) => arg is Guarded )
    : ( (arg: Base) => boolean );

export type Typeguard<Base = any, Guarded extends Base = Base> =
  ( (arg: Base) => arg is Guarded );


export type NonTypeguard<Base = any> =
  ( (arg: Base) => boolean );

export type Transform<Arg = any, Result = any> =
  (arg: Arg) => Result;

export type TransformResult<Trfm extends Transform> =
  Trfm extends Transform<any, infer Result>
    ? Result
    : never;

export type PredicateOutput<Base, IsTypeguard extends boolean, Guarded extends Base> =
  IsTypeguard extends true
    ? Guarded
    : Base;

export type Narrowed<Base, IsTypeguard extends boolean, Guarded extends Base> =
  IsTypeguard extends true
    ? Exclude<Base, Guarded>
    : Base;

export type TypeguardMap<Keys extends string = string> = { // an object whose values are typeguards
  [Key in Keys]: Typeguard;
};

export type GuardedWithMap<Map extends TypeguardMap> = { // converts every typeguard in the map to its guarded type
  [Key in keyof Map]:
    Map[Key] extends Typeguard<any, infer Guarded>
      ? Guarded
      : never;
};

export type MapForType<T> = { // creates a typeguard map for a given type
  [Key in keyof T]: Typeguard<any, T[Key]>;
};

export function isTypeguardMap(arg: any): arg is TypeguardMap {
  return _.isObject(arg) && _.every(arg, _.isFunction);
  // NOTE: We cannot actually check if the functions return what we want them to return, so this is a merely compile-time check.
};

// export function conformsToTypeguardMap<Keys extends string, TG extends TypeguardMap<Keys>>(
//   typeguardMap: TG
//   object: Record<Keys, any>,
// ): object is GuardedWithMap<TG> {
export function conformsToTypeguardMap<Keys extends string, TG extends TypeguardMap<Keys>>(
  typeguardMap: TG
): (object: Record<Keys, any>) => object is GuardedWithMap<TG> {

  return (
    object => {
      return _.every(typeguardMap, (typeguard, key) => typeguard(object[key as Keys]));
    }
  ) as (object: Record<Keys, any>) => object is GuardedWithMap<TG>;

};

// Test:
// type TestTypeguardMap = {
//   name: (arg: any) => arg is string,
//   height: (arg: any) => arg is number,
//   eyeColor: (arg: any) => arg is 'blue' | 'brown' | 'green' | 'hazel' | 'gray' | 'amber' | 'other',
// };

// type TestGuardedWithMap = GuardedWithMap<TestTypeguardMap>;

// const testPerson = {
//   name: 'John',
//   height: 180,
//   eyeColor: 'blue',
// };

// const testTypeguardMap = {
//   name: _.isString,
//   height: _.isNumber,
//   eyeColor: (arg: any): arg is 'blue' | 'brown' | 'green' | 'hazel' | 'gray' | 'amber' | 'other' => {
//     return ['blue', 'brown', 'green', 'hazel', 'gray', 'amber', 'other'].includes(arg);
//   }
// };

// if ( conformsToTypeguardMap(testTypeguardMap)(testPerson) ) {
//   testPerson.eyeColor = 'red'; // error, because testPerson is now of type TestGuardedWithMap
// } else {
//   testPerson.eyeColor = 'red'; // no error, because testPerson is still of type Record<string, any>
// }