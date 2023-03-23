import _ from 'lodash';

export type Checker =
  ( (arg: any) => boolean )
  | ( (arg: any) => arg is any );

export type BaseType<Chkr extends Checker> =
  Chkr extends ( (arg: infer Base) => boolean )
    ? Base
    : Chkr extends ( (arg: infer Base) => arg is any )
      ? Base
      : Chkr extends ( <T>(arg: infer Base) => arg is any )
        ? Base
        : never;

export type IsTypeguard<Chkr extends Checker> =
  Chkr extends ( (arg: any) => arg is any ) ? true : false;

export type GuardedType<Chkr extends Checker> =
  Chkr extends ( (arg: any) => arg is infer Narrowed )
    ? Narrowed
    : never;

export type PostGuardedType<Chkr extends Checker> =
  IsTypeguard<Chkr> extends true
    ? Exclude<BaseType<Chkr>, GuardedType<Chkr>>
    : BaseType<Chkr>;

// TS compile/tooltip tests:
type IsNumberOr<T> = (arg: number | T) => arg is number;
type IsPositive = (arg: number) => boolean;

let base1: BaseType<IsNumberOr<string>>; // number | string
let base2: BaseType<IsPositive>; // number

let isTypeguard1: IsTypeguard<IsNumberOr<string>>; // true
let isTypeguard2: IsTypeguard<IsPositive>; // false

let guarded1: GuardedType<IsNumberOr<string>>; // number
let guarded2: GuardedType<IsPositive>; // never

let postGuarded1: PostGuardedType<IsNumberOr<string>>; // string
let postGuarded2: PostGuardedType<IsPositive>; // number