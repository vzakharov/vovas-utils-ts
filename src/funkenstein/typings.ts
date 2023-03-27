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

// TS compile/tooltip tests:
// type IsNumberOr<T> = (arg: number | T) => arg is number;
// type IsPositive = (arg: number) => boolean;

// let base1: BaseType<IsNumberOr<string>>; // number | string
// let base2: BaseType<IsPositive>; // number

// let isTypeguard1: IsTypeguard<IsNumberOr<string>>; // true
// let isTypeguard2: IsTypeguard<IsPositive>; // false

// let guarded1: GuardedType<IsNumberOr<string>>; // number
// let guarded2: GuardedType<IsPositive>; // never

// let postGuarded1: PostGuardedType<IsNumberOr<string>>; // string
// let postGuarded2: PostGuardedType<IsPositive>; // number