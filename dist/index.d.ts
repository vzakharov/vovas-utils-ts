import fs from 'fs';

type AliasesDefinition<Key extends keyof any = keyof any> = {
    readonly [key in Key]?: readonly string[] | string;
};
type MapToUnion<T> = {
    [key in keyof T]: T[key] extends readonly (infer U)[] ? U : T[key] extends infer U ? U : never;
};
type FlattenToPropsUnion<T extends object> = T[keyof T];
type AllPropsUnion<T> = FlattenToPropsUnion<MapToUnion<T>>;
type AliasedKeys<Definition extends AliasesDefinition> = AllPropsUnion<Definition> & string;
type ReverseKeysValues<T extends Record<string, string>> = {
    [Value in T[keyof T]]: {
        [Key in keyof T]: Value extends T[Key] ? Key : never;
    }[keyof T];
};
type AliasesFor<Object extends Record<string, any>, Definition extends AliasesDefinition<keyof Object>> = {
    [key in AliasedKeys<Definition>]: MapToUnion<Definition> extends Record<string, string> ? key extends keyof ReverseKeysValues<MapToUnion<Definition>> ? ReverseKeysValues<MapToUnion<Definition>>[key] extends keyof Object ? Object[ReverseKeysValues<MapToUnion<Definition>>[key]] : never : never : never;
};
type Aliasified<Object extends Record<string, any>, Definition extends AliasesDefinition<keyof Object>> = Object & AliasesFor<Object, Definition>;
declare function aliasify<Object extends Record<string, any>, Definition extends AliasesDefinition<keyof Object>>(object: Object, aliasesDefinition: Definition): Aliasified<Object, Definition>;

type MethodKey<T, Args extends any[], Result> = {
    [K in keyof T]: T[K] extends (...args: Args) => Result ? K : never;
}[keyof T];
declare function $do<Arg1, Arg2, Result>(fn: (arg1: Arg1, arg2: Arg2) => Result, arg2: Arg2): (target: Arg1) => Result;
declare function $do<Arg1, Arg2, Result>(key: MethodKey<Arg1, [Arg2], Result>, arg2: Arg2): (target: Arg1) => Result;
declare function $do<Arg1, Arg2, Arg3, Result>(fn: (arg1: Arg1, arg2: Arg2, arg3: Arg3) => Result, arg2: Arg2, arg3: Arg3): (target: Arg1) => Result;
declare function $do<Arg1, Arg2, Arg3, Result>(key: MethodKey<Arg1, [Arg2, Arg3], Result>, arg2: Arg2, arg3: Arg3): (target: Arg1) => Result;
declare const wrap: typeof $do;

type Dict<T = any> = {
    [key: string]: T;
} | Promise<Dict>;
type UnixTimestamp = number;
type Primitive = string | number | boolean | null | undefined;
declare function isPrimitive(v: any): v is Primitive;
interface JsonableObject {
    [key: string]: Jsonable;
}
type JsonableNonArray = Primitive | JsonableObject;
type Jsonable = JsonableNonArray | Jsonable[];
type FunctionThatReturns<T> = (...args: any[]) => T;
declare function functionThatReturns<T>(value: T): FunctionThatReturns<T>;
declare function $as<AsWhat>(what: any): AsWhat;
declare function $as<AsWhat>(what: FunctionThatReturns<any>): FunctionThatReturns<AsWhat>;
declare function assign<T extends {}, U>(target: T, source: U): T & U;
declare function tuple<T extends any[]>(...args: T): T;

declare function $throw<T extends Error>(error: T): never;
declare function $throw(message: string): never;
declare function $throw<T extends Error>(errorOrMessage: T | string): never;
declare function $thrower<T extends Error>(errorOrMessage: T | string): FunctionThatReturns<never>;

declare function $try<T>(fn: () => T, fallbackValue: T, finallyCallback?: () => void): T;
declare function $try<T>(fn: () => T, fallback?: (error?: Error) => T, finallyCallback?: () => void): T;

declare function $with<Args extends any[]>(...args: Args): {
    do: <Result>(fn: (...args: Args) => Result) => Result;
};

type ChainableKeys<Function extends (...args: any[]) => any, ChainedParameterIndex extends number> = (keyof NonNullable<Parameters<Function>[ChainedParameterIndex]>);
type ChainableTypes<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]> = Pick<NonNullable<Parameters<Function>[ChainedParameterIndex]>, ChainedKeys[number]>;
type Chainified<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]> = {
    [Key in ChainedKeys[number]]: (value: ChainableTypes<Function, ChainedParameterIndex, [Key]>[Key]) => ((...args: Parameters<Function>) => ReturnType<Function>) & Chainified<Function, ChainedParameterIndex, Exclude<ChainedKeys, Key>>;
};
declare function chainified<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]>($function: Function, chainedParameterIndex: ChainedParameterIndex, chainedKeys: ChainedKeys): Chainified<Function, ChainedParameterIndex, ChainedKeys>;

type Predicate<Base = any, IsTypeguard extends boolean = boolean, Guarded extends Base = Base> = IsTypeguard extends true ? ((arg: Base) => arg is Guarded) : ((arg: Base) => boolean);
type Typeguard<Base = any, Guarded extends Base = Base> = ((arg: Base) => arg is Guarded);
type NonTypeguard<Base = any> = ((arg: Base) => boolean);
type Transform<Arg = any, Result = any> = (arg: Arg) => Result;
type TransformResult<Trfm extends Transform> = Trfm extends Transform<any, infer Result> ? Result : never;
type PredicateOutput<Base, IsTypeguard extends boolean, Guarded extends Base> = IsTypeguard extends true ? Guarded : Base;
type Narrowed<Base, IsTypeguard extends boolean, Guarded extends Base> = IsTypeguard extends true ? Exclude<Base, Guarded> : Base;
type TypeguardMap<Keys extends string = string> = {
    [Key in Keys]: Typeguard;
};
type GuardedWithMap<Map extends TypeguardMap> = {
    [Key in keyof Map]: Map[Key] extends Typeguard<any, infer Guarded> ? Guarded : never;
};
type MapForType<T> = {
    [Key in keyof T]: Typeguard<any, T[Key]>;
};
declare function isTypeguardMap(arg: any): arg is TypeguardMap;
declare function conformsToTypeguardMap<Keys extends string, TG extends TypeguardMap<Keys>>(typeguardMap: TG): (object: Record<Keys, any>) => object is GuardedWithMap<TG>;

type CheckState = {
    isFirst: boolean;
    isLast: boolean;
    hasArgument: boolean;
    argument?: any;
    predicate?: Predicate;
    transform?: Transform;
    switchStack: [
        Predicate,
        Transform
    ][];
};
type CheckKind = 'first' | 'last' | undefined;
declare function parseSwitch<Kind extends CheckKind, HasArgument extends boolean, OriginalArgument, Argument, CombinedResult, Output = ParseSwitchOutput<Kind, HasArgument, OriginalArgument, Argument, CombinedResult>>(kind: Kind, hasArgument: HasArgument, argument: Argument | undefined, switchStack: [Predicate, Transform][]): Output;
type ParseSwitchOutput<Kind extends CheckKind, HasArgument extends boolean, OriginalArgument, Argument, CombinedResult> = {
    if<Guarded extends Argument>(typeguard: Typeguard<Argument, Guarded>): ParseTransformOutput<Kind, HasArgument, OriginalArgument, Argument, Exclude<Argument, Guarded>, CombinedResult>;
    if(predicate: NonTypeguard<Argument>): ParseTransformOutput<Kind, HasArgument, OriginalArgument, Argument, Argument, CombinedResult>;
    if<Guarded extends Argument, TransformResult>(typeguard: Typeguard<Argument, Guarded>, transform: Transform<Guarded, TransformResult>): PushToStackOutput<Kind, HasArgument, OriginalArgument, Exclude<Argument, Guarded>, TransformResult, CombinedResult>;
    if<TransformResult>(predicate: NonTypeguard<Argument>, transform: Transform<Argument, TransformResult>): PushToStackOutput<Kind, HasArgument, OriginalArgument, Argument, TransformResult, CombinedResult>;
} & (Kind extends 'first' ? {} : {
    else<TransformResult>(transform: Transform<Argument, TransformResult>): PushToStackOutput<'last', HasArgument, OriginalArgument, Argument, TransformResult, CombinedResult>;
});
declare function parseTransform<Kind extends CheckKind, HasArgument extends boolean, OriginalArgument, Argument, Narrowed extends Argument, CombinedResult>(kind: Kind, hasArgument: HasArgument, argument: Argument, predicate: Predicate, switchStack: [Predicate, Transform][]): ParseTransformOutput<Kind, HasArgument, OriginalArgument, Argument, Narrowed, CombinedResult>;
type ParseTransformOutput<Kind extends CheckKind, HasArgument extends boolean, OriginalArgument, Argument, Narrowed extends Argument, CombinedResult> = {
    then<TransformResult>(transform: Transform<Argument, TransformResult>): PushToStackOutput<Kind, HasArgument, OriginalArgument, Narrowed, TransformResult, CombinedResult>;
};
declare function pushToStack<Kind extends CheckKind, HasArgument extends boolean, OriginalArgument, Argument, TransformResult, CombinedResult>(kind: Kind, hasArgument: HasArgument, argument: Argument | undefined, predicate: Predicate, transform: Transform<Argument, TransformResult>, switchStack: [Predicate, Transform][]): PushToStackOutput<Kind, HasArgument, OriginalArgument, Argument, TransformResult, CombinedResult>;
type PushToStackOutput<Kind extends CheckKind, HasArgument extends boolean, OriginalArgument, Argument, TransformResult, CombinedResult> = (Kind extends 'last' ? Evaluate<HasArgument, OriginalArgument, Argument, CombinedResult | TransformResult> : ParseSwitchOutput<undefined, HasArgument, OriginalArgument, Argument, CombinedResult | TransformResult>);
declare function evaluate<HasArgument extends boolean, OriginalArgument, Argument, CombinedResult>(hasArgument: HasArgument, argument: Argument, switchStack: [Predicate, Transform][]): Evaluate<HasArgument, OriginalArgument, Argument, CombinedResult>;
type Evaluate<HasArgument extends boolean, OriginalArgument, Argument, CombinedResult> = (HasArgument extends true ? CombinedResult : (arg: OriginalArgument) => CombinedResult);
declare function check<Argument>(): ParseSwitchOutput<'first', false, Argument, Argument, never>;
declare function check<Argument>(arg: Argument): ParseSwitchOutput<'first', true, Argument, Argument, never>;
declare function check<Arguments extends any[]>(...args: Arguments): ParseSwitchOutput<'first', true, Arguments, Arguments, never>;
declare const transform: typeof check;
declare function $if<Argument, Guarded extends Argument, TransformResult>(argument: Argument, typeguard: Typeguard<Argument, Guarded>, transform: Transform<Guarded, TransformResult>): PushToStackOutput<'first', true, Argument, Exclude<Argument, Guarded>, TransformResult, never>;
declare function $if<Argument, TransformResult>(argument: Argument, predicate: NonTypeguard<Argument>, transform: Transform<Argument, TransformResult>): PushToStackOutput<'first', true, Argument, Argument, TransformResult, never>;

declare function lazily<Function extends (...args: any[]) => any>(func: Function, ...args: Parameters<Function>): () => ReturnType<Function>;
declare function lazily<Function extends (...args: any[]) => any>(func: Function): (...args: Parameters<Function>) => () => ReturnType<Function>;

declare function meta<Args extends any[], Return>(fn: (wrapper: (...args: Args) => Return) => (...args: Args) => Return): (...args: Args) => Return;

declare function both<Arg, Guarded1 extends Arg, Guarded2 extends Guarded1>(typeguard1: Typeguard<Arg, Guarded1>, typeguard2: Typeguard<Guarded1, Guarded2>): Typeguard<Arg, Guarded1 & Guarded2>;
declare function both<Arg>(predicate1: NonTypeguard<Arg>, predicate2: NonTypeguard<Arg>): NonTypeguard<Arg>;

declare function isLike<Map extends TypeguardMap>(sample: Map): <T>(arg: T) => arg is T & GuardedWithMap<Map>;

declare const commonPredicates: {
    undefined: <T>(arg: T | undefined) => arg is undefined;
    null: <T_1>(arg: T_1 | null) => arg is null;
    nil: <T_2>(arg: T_2 | null | undefined) => arg is null | undefined;
    string: <T_3>(arg: string | T_3) => arg is string;
    emptyString: <T_4>(arg: "" | T_4) => arg is "";
    number: <T_5>(arg: number | T_5) => arg is number;
    zero: <T_6>(arg: 0 | T_6) => arg is 0;
    boolean: <T_7>(arg: boolean | T_7) => arg is boolean;
    false: <T_8>(arg: false | T_8) => arg is false;
    true: <T_9>(arg: true | T_9) => arg is true;
    function: <T_10>(arg: T_10 | ((...args: any[]) => any)) => arg is (...args: any[]) => any;
    object: <T_11>(arg: object | T_11) => arg is object;
    array: <T_12>(arg: any[] | T_12) => arg is any[];
    regexp: <T_13>(arg: RegExp | T_13) => arg is RegExp;
    itself: <T_14>(arg: T_14) => arg is T_14;
    primitive: <T_15>(arg: Primitive | T_15) => arg is Primitive;
    jsonable: <T_16>(arg: Jsonable | T_16) => arg is Jsonable;
    jsonableObject: <T_17>(arg: JsonableObject | T_17) => arg is JsonableObject;
    defined: <T_18>(arg: T_18 | undefined) => arg is T_18;
    empty: <T_19 extends {
        length: number;
    }>(arg: T_19) => arg is T_19 & {
        length: 0;
    };
    truthy: <T_20>(arg: false | "" | 0 | T_20 | null | undefined) => arg is T_20;
    falsy: <T_21>(arg: false | "" | 0 | T_21 | null | undefined) => arg is false | "" | 0 | null | undefined;
    exactly: <T_22>(sample: T_22) => <U>(arg: U) => arg is T_22 & U;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    match: <T_23 extends object>(sample: T_23) => <U_1 extends T_23>(arg: U_1) => boolean;
    like: typeof isLike;
    typed: typeof isTyped;
    anything: (...args: any[]) => true;
};
type CommonPredicates = typeof commonPredicates;
type CommonPredicateName = keyof CommonPredicates;
type CommonPredicateMap = {
    [K in CommonPredicateName]: any;
};
declare const is: {
    string: <T_3>(arg: string | T_3) => arg is string;
    number: <T_5>(arg: number | T_5) => arg is number;
    boolean: <T_7>(arg: boolean | T_7) => arg is boolean;
    undefined: <T>(arg: T | undefined) => arg is undefined;
    object: <T_11>(arg: object | T_11) => arg is object;
    function: <T_10>(arg: T_10 | ((...args: any[]) => any)) => arg is (...args: any[]) => any;
    match: <T_23 extends object>(sample: T_23) => <U_1 extends T_23>(arg: U_1) => boolean;
    null: <T_1>(arg: T_1 | null) => arg is null;
    nil: <T_2>(arg: T_2 | null | undefined) => arg is null | undefined;
    emptyString: <T_4>(arg: "" | T_4) => arg is "";
    zero: <T_6>(arg: 0 | T_6) => arg is 0;
    false: <T_8>(arg: false | T_8) => arg is false;
    true: <T_9>(arg: true | T_9) => arg is true;
    array: <T_12>(arg: any[] | T_12) => arg is any[];
    regexp: <T_13>(arg: RegExp | T_13) => arg is RegExp;
    itself: <T_14>(arg: T_14) => arg is T_14;
    primitive: <T_15>(arg: Primitive | T_15) => arg is Primitive;
    jsonable: <T_16>(arg: Jsonable | T_16) => arg is Jsonable;
    jsonableObject: <T_17>(arg: JsonableObject | T_17) => arg is JsonableObject;
    defined: <T_18>(arg: T_18 | undefined) => arg is T_18;
    empty: <T_19 extends {
        length: number;
    }>(arg: T_19) => arg is T_19 & {
        length: 0;
    };
    truthy: <T_20>(arg: false | "" | 0 | T_20 | null | undefined) => arg is T_20;
    falsy: <T_21>(arg: false | "" | 0 | T_21 | null | undefined) => arg is false | "" | 0 | null | undefined;
    exactly: <T_22>(sample: T_22) => <U>(arg: U) => arg is T_22 & U;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    like: typeof isLike;
    typed: typeof isTyped;
    anything: (...args: any[]) => true;
    not: {
        undefined: <T>(arg: T | undefined) => arg is Exclude<T, undefined>;
        null: <T_1>(arg: T_1 | null) => arg is Exclude<T_1, null>;
        nil: <T_2>(arg: T_2 | null | undefined) => arg is Exclude<T_2, null | undefined>;
        string: <T_3>(arg: string | T_3) => arg is Exclude<T_3, string>;
        emptyString: <T_4>(arg: "" | T_4) => arg is Exclude<T_4, "">;
        number: <T_5>(arg: number | T_5) => arg is Exclude<T_5, number>;
        zero: <T_6>(arg: 0 | T_6) => arg is Exclude<T_6, 0>;
        boolean: <T_7>(arg: boolean | T_7) => arg is Exclude<T_7, boolean>;
        false: <T_8>(arg: false | T_8) => arg is Exclude<T_8, false>;
        true: <T_9>(arg: true | T_9) => arg is Exclude<T_9, true>;
        function: <T_10>(arg: T_10 | ((...args: any[]) => any)) => arg is Exclude<T_10, (...args: any[]) => any>;
        object: <T_11>(arg: object | T_11) => arg is Exclude<T_11, object>;
        array: <T_12>(arg: any[] | T_12) => arg is Exclude<T_12, any[]>;
        regexp: <T_13>(arg: RegExp | T_13) => arg is Exclude<T_13, RegExp>;
        itself: <T_14>(arg: T_14) => arg is Exclude<T_14, T_14>;
        primitive: <T_15>(arg: Primitive | T_15) => arg is Exclude<T_15, Primitive>;
        jsonable: <T_16>(arg: Jsonable | T_16) => arg is Exclude<T_16, Jsonable>;
        jsonableObject: <T_17>(arg: JsonableObject | T_17) => arg is Exclude<T_17, JsonableObject>;
        defined: <T_18>(arg: T_18 | undefined) => arg is Exclude<undefined, T_18> | Exclude<T_18, T_18>;
        empty: <T_19 extends {
            length: number;
        }>(arg: T_19) => arg is Exclude<T_19, T_19 & {
            length: 0;
        }>;
        truthy: <T_20>(arg: false | "" | 0 | T_20 | null | undefined) => arg is Exclude<undefined, T_20> | Exclude<null, T_20> | Exclude<false, T_20> | Exclude<"", T_20> | Exclude<0, T_20> | Exclude<T_20, T_20>;
        falsy: <T_21>(arg: false | "" | 0 | T_21 | null | undefined) => arg is Exclude<T_21, false | "" | 0 | null | undefined>;
        exactly: <T_22>(sample: T_22) => <U>(arg: U) => arg is Exclude<U, T_22 & U>;
        above: (sample: number) => (arg: number) => boolean;
        below: (sample: number) => (arg: number) => boolean;
        atLeast: (sample: number) => (arg: number) => boolean;
        atMost: (sample: number) => (arg: number) => boolean;
        like: (sample: TypeguardMap) => <T_23>(arg: T_23) => arg is Exclude<T_23, T_23 & GuardedWithMap<TypeguardMap<string>>>;
        typed: <T_24 extends string | number>(type: T_24) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_24>>;
        match: <T_25 extends object>(sample: T_25) => <U_1 extends T_25>(arg: U_1) => boolean;
        anything: (arg: any) => false;
    };
};
declare const does: {
    string: <T_3>(arg: string | T_3) => arg is string;
    number: <T_5>(arg: number | T_5) => arg is number;
    boolean: <T_7>(arg: boolean | T_7) => arg is boolean;
    undefined: <T>(arg: T | undefined) => arg is undefined;
    object: <T_11>(arg: object | T_11) => arg is object;
    function: <T_10>(arg: T_10 | ((...args: any[]) => any)) => arg is (...args: any[]) => any;
    match: <T_23 extends object>(sample: T_23) => <U_1 extends T_23>(arg: U_1) => boolean;
    null: <T_1>(arg: T_1 | null) => arg is null;
    nil: <T_2>(arg: T_2 | null | undefined) => arg is null | undefined;
    emptyString: <T_4>(arg: "" | T_4) => arg is "";
    zero: <T_6>(arg: 0 | T_6) => arg is 0;
    false: <T_8>(arg: false | T_8) => arg is false;
    true: <T_9>(arg: true | T_9) => arg is true;
    array: <T_12>(arg: any[] | T_12) => arg is any[];
    regexp: <T_13>(arg: RegExp | T_13) => arg is RegExp;
    itself: <T_14>(arg: T_14) => arg is T_14;
    primitive: <T_15>(arg: Primitive | T_15) => arg is Primitive;
    jsonable: <T_16>(arg: Jsonable | T_16) => arg is Jsonable;
    jsonableObject: <T_17>(arg: JsonableObject | T_17) => arg is JsonableObject;
    defined: <T_18>(arg: T_18 | undefined) => arg is T_18;
    empty: <T_19 extends {
        length: number;
    }>(arg: T_19) => arg is T_19 & {
        length: 0;
    };
    truthy: <T_20>(arg: false | "" | 0 | T_20 | null | undefined) => arg is T_20;
    falsy: <T_21>(arg: false | "" | 0 | T_21 | null | undefined) => arg is false | "" | 0 | null | undefined;
    exactly: <T_22>(sample: T_22) => <U>(arg: U) => arg is T_22 & U;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    like: typeof isLike;
    typed: typeof isTyped;
    anything: (...args: any[]) => true;
    not: {
        undefined: <T>(arg: T | undefined) => arg is Exclude<T, undefined>;
        null: <T_1>(arg: T_1 | null) => arg is Exclude<T_1, null>;
        nil: <T_2>(arg: T_2 | null | undefined) => arg is Exclude<T_2, null | undefined>;
        string: <T_3>(arg: string | T_3) => arg is Exclude<T_3, string>;
        emptyString: <T_4>(arg: "" | T_4) => arg is Exclude<T_4, "">;
        number: <T_5>(arg: number | T_5) => arg is Exclude<T_5, number>;
        zero: <T_6>(arg: 0 | T_6) => arg is Exclude<T_6, 0>;
        boolean: <T_7>(arg: boolean | T_7) => arg is Exclude<T_7, boolean>;
        false: <T_8>(arg: false | T_8) => arg is Exclude<T_8, false>;
        true: <T_9>(arg: true | T_9) => arg is Exclude<T_9, true>;
        function: <T_10>(arg: T_10 | ((...args: any[]) => any)) => arg is Exclude<T_10, (...args: any[]) => any>;
        object: <T_11>(arg: object | T_11) => arg is Exclude<T_11, object>;
        array: <T_12>(arg: any[] | T_12) => arg is Exclude<T_12, any[]>;
        regexp: <T_13>(arg: RegExp | T_13) => arg is Exclude<T_13, RegExp>;
        itself: <T_14>(arg: T_14) => arg is Exclude<T_14, T_14>;
        primitive: <T_15>(arg: Primitive | T_15) => arg is Exclude<T_15, Primitive>;
        jsonable: <T_16>(arg: Jsonable | T_16) => arg is Exclude<T_16, Jsonable>;
        jsonableObject: <T_17>(arg: JsonableObject | T_17) => arg is Exclude<T_17, JsonableObject>;
        defined: <T_18>(arg: T_18 | undefined) => arg is Exclude<undefined, T_18> | Exclude<T_18, T_18>;
        empty: <T_19 extends {
            length: number;
        }>(arg: T_19) => arg is Exclude<T_19, T_19 & {
            length: 0;
        }>;
        truthy: <T_20>(arg: false | "" | 0 | T_20 | null | undefined) => arg is Exclude<undefined, T_20> | Exclude<null, T_20> | Exclude<false, T_20> | Exclude<"", T_20> | Exclude<0, T_20> | Exclude<T_20, T_20>;
        falsy: <T_21>(arg: false | "" | 0 | T_21 | null | undefined) => arg is Exclude<T_21, false | "" | 0 | null | undefined>;
        exactly: <T_22>(sample: T_22) => <U>(arg: U) => arg is Exclude<U, T_22 & U>;
        above: (sample: number) => (arg: number) => boolean;
        below: (sample: number) => (arg: number) => boolean;
        atLeast: (sample: number) => (arg: number) => boolean;
        atMost: (sample: number) => (arg: number) => boolean;
        like: (sample: TypeguardMap) => <T_23>(arg: T_23) => arg is Exclude<T_23, T_23 & GuardedWithMap<TypeguardMap<string>>>;
        typed: <T_24 extends string | number>(type: T_24) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_24>>;
        match: <T_25 extends object>(sample: T_25) => <U_1 extends T_25>(arg: U_1) => boolean;
        anything: (arg: any) => false;
    };
};
declare const isnt: {
    undefined: <T>(arg: T | undefined) => arg is Exclude<T, undefined>;
    null: <T_1>(arg: T_1 | null) => arg is Exclude<T_1, null>;
    nil: <T_2>(arg: T_2 | null | undefined) => arg is Exclude<T_2, null | undefined>;
    string: <T_3>(arg: string | T_3) => arg is Exclude<T_3, string>;
    emptyString: <T_4>(arg: "" | T_4) => arg is Exclude<T_4, "">;
    number: <T_5>(arg: number | T_5) => arg is Exclude<T_5, number>;
    zero: <T_6>(arg: 0 | T_6) => arg is Exclude<T_6, 0>;
    boolean: <T_7>(arg: boolean | T_7) => arg is Exclude<T_7, boolean>;
    false: <T_8>(arg: false | T_8) => arg is Exclude<T_8, false>;
    true: <T_9>(arg: true | T_9) => arg is Exclude<T_9, true>;
    function: <T_10>(arg: T_10 | ((...args: any[]) => any)) => arg is Exclude<T_10, (...args: any[]) => any>;
    object: <T_11>(arg: object | T_11) => arg is Exclude<T_11, object>;
    array: <T_12>(arg: any[] | T_12) => arg is Exclude<T_12, any[]>;
    regexp: <T_13>(arg: RegExp | T_13) => arg is Exclude<T_13, RegExp>;
    itself: <T_14>(arg: T_14) => arg is Exclude<T_14, T_14>;
    primitive: <T_15>(arg: Primitive | T_15) => arg is Exclude<T_15, Primitive>;
    jsonable: <T_16>(arg: Jsonable | T_16) => arg is Exclude<T_16, Jsonable>;
    jsonableObject: <T_17>(arg: JsonableObject | T_17) => arg is Exclude<T_17, JsonableObject>;
    defined: <T_18>(arg: T_18 | undefined) => arg is Exclude<undefined, T_18> | Exclude<T_18, T_18>;
    empty: <T_19 extends {
        length: number;
    }>(arg: T_19) => arg is Exclude<T_19, T_19 & {
        length: 0;
    }>;
    truthy: <T_20>(arg: false | "" | 0 | T_20 | null | undefined) => arg is Exclude<undefined, T_20> | Exclude<null, T_20> | Exclude<false, T_20> | Exclude<"", T_20> | Exclude<0, T_20> | Exclude<T_20, T_20>;
    falsy: <T_21>(arg: false | "" | 0 | T_21 | null | undefined) => arg is Exclude<T_21, false | "" | 0 | null | undefined>;
    exactly: <T_22>(sample: T_22) => <U>(arg: U) => arg is Exclude<U, T_22 & U>;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    like: (sample: TypeguardMap) => <T_23>(arg: T_23) => arg is Exclude<T_23, T_23 & GuardedWithMap<TypeguardMap<string>>>;
    typed: <T_24 extends string | number>(type: T_24) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_24>>;
    match: <T_25 extends object>(sample: T_25) => <U_1 extends T_25>(arg: U_1) => boolean;
    anything: (arg: any) => false;
};
declare const aint: {
    undefined: <T>(arg: T | undefined) => arg is Exclude<T, undefined>;
    null: <T_1>(arg: T_1 | null) => arg is Exclude<T_1, null>;
    nil: <T_2>(arg: T_2 | null | undefined) => arg is Exclude<T_2, null | undefined>;
    string: <T_3>(arg: string | T_3) => arg is Exclude<T_3, string>;
    emptyString: <T_4>(arg: "" | T_4) => arg is Exclude<T_4, "">;
    number: <T_5>(arg: number | T_5) => arg is Exclude<T_5, number>;
    zero: <T_6>(arg: 0 | T_6) => arg is Exclude<T_6, 0>;
    boolean: <T_7>(arg: boolean | T_7) => arg is Exclude<T_7, boolean>;
    false: <T_8>(arg: false | T_8) => arg is Exclude<T_8, false>;
    true: <T_9>(arg: true | T_9) => arg is Exclude<T_9, true>;
    function: <T_10>(arg: T_10 | ((...args: any[]) => any)) => arg is Exclude<T_10, (...args: any[]) => any>;
    object: <T_11>(arg: object | T_11) => arg is Exclude<T_11, object>;
    array: <T_12>(arg: any[] | T_12) => arg is Exclude<T_12, any[]>;
    regexp: <T_13>(arg: RegExp | T_13) => arg is Exclude<T_13, RegExp>;
    itself: <T_14>(arg: T_14) => arg is Exclude<T_14, T_14>;
    primitive: <T_15>(arg: Primitive | T_15) => arg is Exclude<T_15, Primitive>;
    jsonable: <T_16>(arg: Jsonable | T_16) => arg is Exclude<T_16, Jsonable>;
    jsonableObject: <T_17>(arg: JsonableObject | T_17) => arg is Exclude<T_17, JsonableObject>;
    defined: <T_18>(arg: T_18 | undefined) => arg is Exclude<undefined, T_18> | Exclude<T_18, T_18>;
    empty: <T_19 extends {
        length: number;
    }>(arg: T_19) => arg is Exclude<T_19, T_19 & {
        length: 0;
    }>;
    truthy: <T_20>(arg: false | "" | 0 | T_20 | null | undefined) => arg is Exclude<undefined, T_20> | Exclude<null, T_20> | Exclude<false, T_20> | Exclude<"", T_20> | Exclude<0, T_20> | Exclude<T_20, T_20>;
    falsy: <T_21>(arg: false | "" | 0 | T_21 | null | undefined) => arg is Exclude<T_21, false | "" | 0 | null | undefined>;
    exactly: <T_22>(sample: T_22) => <U>(arg: U) => arg is Exclude<U, T_22 & U>;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    like: (sample: TypeguardMap) => <T_23>(arg: T_23) => arg is Exclude<T_23, T_23 & GuardedWithMap<TypeguardMap<string>>>;
    typed: <T_24 extends string | number>(type: T_24) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_24>>;
    match: <T_25 extends object>(sample: T_25) => <U_1 extends T_25>(arg: U_1) => boolean;
    anything: (arg: any) => false;
};
declare const doesnt: {
    undefined: <T>(arg: T | undefined) => arg is Exclude<T, undefined>;
    null: <T_1>(arg: T_1 | null) => arg is Exclude<T_1, null>;
    nil: <T_2>(arg: T_2 | null | undefined) => arg is Exclude<T_2, null | undefined>;
    string: <T_3>(arg: string | T_3) => arg is Exclude<T_3, string>;
    emptyString: <T_4>(arg: "" | T_4) => arg is Exclude<T_4, "">;
    number: <T_5>(arg: number | T_5) => arg is Exclude<T_5, number>;
    zero: <T_6>(arg: 0 | T_6) => arg is Exclude<T_6, 0>;
    boolean: <T_7>(arg: boolean | T_7) => arg is Exclude<T_7, boolean>;
    false: <T_8>(arg: false | T_8) => arg is Exclude<T_8, false>;
    true: <T_9>(arg: true | T_9) => arg is Exclude<T_9, true>;
    function: <T_10>(arg: T_10 | ((...args: any[]) => any)) => arg is Exclude<T_10, (...args: any[]) => any>;
    object: <T_11>(arg: object | T_11) => arg is Exclude<T_11, object>;
    array: <T_12>(arg: any[] | T_12) => arg is Exclude<T_12, any[]>;
    regexp: <T_13>(arg: RegExp | T_13) => arg is Exclude<T_13, RegExp>;
    itself: <T_14>(arg: T_14) => arg is Exclude<T_14, T_14>;
    primitive: <T_15>(arg: Primitive | T_15) => arg is Exclude<T_15, Primitive>;
    jsonable: <T_16>(arg: Jsonable | T_16) => arg is Exclude<T_16, Jsonable>;
    jsonableObject: <T_17>(arg: JsonableObject | T_17) => arg is Exclude<T_17, JsonableObject>;
    defined: <T_18>(arg: T_18 | undefined) => arg is Exclude<undefined, T_18> | Exclude<T_18, T_18>;
    empty: <T_19 extends {
        length: number;
    }>(arg: T_19) => arg is Exclude<T_19, T_19 & {
        length: 0;
    }>;
    truthy: <T_20>(arg: false | "" | 0 | T_20 | null | undefined) => arg is Exclude<undefined, T_20> | Exclude<null, T_20> | Exclude<false, T_20> | Exclude<"", T_20> | Exclude<0, T_20> | Exclude<T_20, T_20>;
    falsy: <T_21>(arg: false | "" | 0 | T_21 | null | undefined) => arg is Exclude<T_21, false | "" | 0 | null | undefined>;
    exactly: <T_22>(sample: T_22) => <U>(arg: U) => arg is Exclude<U, T_22 & U>;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    like: (sample: TypeguardMap) => <T_23>(arg: T_23) => arg is Exclude<T_23, T_23 & GuardedWithMap<TypeguardMap<string>>>;
    typed: <T_24 extends string | number>(type: T_24) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_24>>;
    match: <T_25 extends object>(sample: T_25) => <U_1 extends T_25>(arg: U_1) => boolean;
    anything: (arg: any) => false;
};

declare function either<Arg, Guarded1 extends Arg, Guarded2 extends Guarded1>(typeguard1: Typeguard<Arg, Guarded1>, typeguard2: Typeguard<Arg, Guarded2>): Typeguard<Arg, Guarded1 | Guarded2>;
declare function either<Arg>(predicate1: NonTypeguard<Arg>, predicate2: NonTypeguard<Arg>): NonTypeguard<Arg>;

declare function its<Key extends keyof Obj, Obj extends object>(key: Key): Transform<Obj, Obj[Key]>;
declare function its<Key extends keyof Obj, Guarded extends Obj[Key], Obj extends object>(key: Key, typeguard: Typeguard<Obj[Key], Guarded>): Typeguard<Obj, Obj & {
    [K in Key]: Guarded;
}>;
declare function its<Key extends keyof Obj, Obj extends object>(key: Key, predicate: NonTypeguard<Obj[Key]>): NonTypeguard<Obj>;
declare function its<Key extends keyof Obj, Value extends Obj[Key], Obj extends object>(key: Key, value: Value): Typeguard<Obj, Obj & {
    [K in Key]: Value;
}>;

declare function has<T extends object, U extends {}>(source: Readonly<U>): (target: T) => target is T & U;

declare function not<Base, Guarded extends Base>(typeguard: (arg: Base) => arg is Guarded): (arg: Base) => arg is Exclude<Base, Guarded>;
declare function not<T>(predicate: (arg: T) => true): (arg: T) => false;
declare function not<T>(predicate: (arg: T) => false): (arg: T) => true;
declare function not<T>(predicate: (arg: T) => boolean): (arg: T) => boolean;
type Not<P extends Predicate> = P extends ((arg: infer Base) => arg is any) | ((arg: infer Base) => boolean) ? P extends ((arg: any) => arg is infer Guarded) ? (arg: Base) => arg is Exclude<Base, Guarded> : (arg: Base) => boolean : never;

declare function respectively<BroadType1, NarrowType1 extends BroadType1, BroadType2, NarrowType2 extends BroadType2>(typeguard1: Typeguard<BroadType1, NarrowType1>, typeguard2: Typeguard<BroadType2, NarrowType2>): Typeguard<[BroadType1, BroadType2], [NarrowType1, NarrowType2]>;
declare function respectively<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3>(tg1: Typeguard<BT1, NT1>, tg2: Typeguard<BT2, NT2>, tg3: Typeguard<BT3, NT3>): Typeguard<[BT1, BT2, BT3], [NT1, NT2, NT3]>;
declare function respectively<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3, BT4, NT4 extends BT4>(tg1: Typeguard<BT1, NT1>, tg2: Typeguard<BT2, NT2>, tg3: Typeguard<BT3, NT3>, tg4: Typeguard<BT4, NT4>): Typeguard<[BT1, BT2, BT3, BT4], [NT1, NT2, NT3, NT4]>;
declare function respectively<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3, BT4, NT4 extends BT4, BT5, NT5 extends BT5>(tg1: Typeguard<BT1, NT1>, tg2: Typeguard<BT2, NT2>, tg3: Typeguard<BT3, NT3>, tg4: Typeguard<BT4, NT4>, tg5: Typeguard<BT5, NT5>): Typeguard<[BT1, BT2, BT3, BT4, BT5], [NT1, NT2, NT3, NT4, NT5]>;
declare namespace respectively {
    var _a: typeof respectivelyReturn;
    export { _a as return };
}
declare function respectivelyReturn<BroadType1, NarrowType1 extends BroadType1, BroadType2, NarrowType2 extends BroadType2>(transform1: Transform<BroadType1, NarrowType1>, transform2: Transform<BroadType2, NarrowType2>): (arg: [BroadType1, BroadType2]) => [NarrowType1, NarrowType2];
declare function respectivelyReturn<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3>(tf1: (arg: BT1) => NT1, tf2: (arg: BT2) => NT2, tf3: (arg: BT3) => NT3): (arg: [BT1, BT2, BT3]) => [NT1, NT2, NT3];
declare function respectivelyReturn<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3, BT4, NT4 extends BT4>(tf1: (arg: BT1) => NT1, tf2: (arg: BT2) => NT2, tf3: (arg: BT3) => NT3, tf4: (arg: BT4) => NT4): (arg: [BT1, BT2, BT3, BT4]) => [NT1, NT2, NT3, NT4];
declare function respectivelyReturn<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3, BT4, NT4 extends BT4, BT5, NT5 extends BT5>(tf1: (arg: BT1) => NT1, tf2: (arg: BT2) => NT2, tf3: (arg: BT3) => NT3, tf4: (arg: BT4) => NT4, tf5: (arg: BT5) => NT5): (arg: [BT1, BT2, BT3, BT4, BT5]) => [NT1, NT2, NT3, NT4, NT5];

declare function also<T>(handler: (value: T) => void): (value: T) => T;

declare function assignTo<T extends object, P extends keyof T>(object: T, property: P): <V extends T[P]>(value: V) => V;

declare function callIts<Key extends PropertyKey, Args extends any[]>(key: Key, ...args: Args): <Object extends Record<Key, (...args: Args) => any>>(object: Object) => ReturnType<Object[Key]>;
declare const please: typeof callIts;

declare function compileTimeError(item: never): never;
declare const shouldNotBe: typeof compileTimeError;

declare function getProp<Object extends object, Key extends keyof Object>(key: Key): (obj: Object) => Object[Key];

declare const commonTransforms: Aliasified<{
    itself: <T>(arg: T) => T;
    themselves: <T_1 extends any[]>(arrayArg: T_1) => T_1;
    $: typeof give$;
    undefined: (...args: any[]) => undefined;
    null: (...args: any[]) => null;
    true: (...args: any[]) => true;
    false: (...args: any[]) => false;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    zero: (...args: any[]) => 0;
    emptyString: (...args: any[]) => "";
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
    string: <T_2>(arg: T_2) => string;
    boolean: <T_3>(arg: T_3) => boolean;
    number: <T_4>(arg: T_4) => number;
    array: <T_5>(arg: T_5) => T_5[];
    keys: (arg: object) => string[];
    json: (arg: Jsonable) => string;
    yaml: (arg: Jsonable) => string;
    parsedJson: (arg: string) => Jsonable;
    parsedYaml: (arg: string) => Jsonable;
    lowerCase: (arg: string) => string;
    upperCase: (arg: string) => string;
    camelCase: (arg: string) => string;
    snakeCase: (arg: string) => string;
    kebabCase: (arg: string) => string;
    startCase: (arg: string) => string;
    format: (format: string) => (insert: string) => string;
    replace: (template: string | RegExp, replacement: string) => (arg: string) => string;
    first: <T_6>(arg: T_6[]) => T_6;
    last: <T_7>(arg: T_7[]) => T_7;
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    map: <Array_1 extends any[], TransformResult>(transform: (arg: Array_1 extends (infer Item)[] ? Item : never) => TransformResult) => (arg: Array_1) => TransformResult[];
    mapValues: <T_8, R>(transform: (arg: T_8) => R) => (arg: {
        [key: string]: T_8;
    }) => {
        [key: string]: R;
    };
    wrapped: typeof $do;
    pipe: typeof pipe;
}, {
    readonly $: readonly ["exactly", "value", "literal"];
    readonly NaN: readonly ["nan", "notANumber"];
    readonly Infinity: "infinity";
    readonly zero: "0";
    readonly emptyString: "";
    readonly json: "JSON";
    readonly yaml: "YAML";
    readonly parsedJson: readonly ["unjson", "unJSON", "parsedJSON"];
    readonly parsedYaml: readonly ["unyaml", "unYAML", "parsedYAML"];
    readonly lowerCase: "lowercase";
    readonly upperCase: readonly ["UPPERCASE", "ALLCAPS"];
    readonly snakeCase: "snake_case";
    readonly kebabCase: "kebab-case";
    readonly startCase: "Start Case";
    readonly first: readonly ["firstItem", "head"];
    readonly last: readonly ["lastItem", "tail"];
    readonly prop: readonly ["property", "its"];
}>;
declare const give: Aliasified<{
    itself: <T>(arg: T) => T;
    themselves: <T_1 extends any[]>(arrayArg: T_1) => T_1;
    $: typeof give$;
    undefined: (...args: any[]) => undefined;
    null: (...args: any[]) => null;
    true: (...args: any[]) => true;
    false: (...args: any[]) => false;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    zero: (...args: any[]) => 0;
    emptyString: (...args: any[]) => "";
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
    string: <T_2>(arg: T_2) => string;
    boolean: <T_3>(arg: T_3) => boolean;
    number: <T_4>(arg: T_4) => number;
    array: <T_5>(arg: T_5) => T_5[];
    keys: (arg: object) => string[];
    json: (arg: Jsonable) => string;
    yaml: (arg: Jsonable) => string;
    parsedJson: (arg: string) => Jsonable;
    parsedYaml: (arg: string) => Jsonable;
    lowerCase: (arg: string) => string;
    upperCase: (arg: string) => string;
    camelCase: (arg: string) => string;
    snakeCase: (arg: string) => string;
    kebabCase: (arg: string) => string;
    startCase: (arg: string) => string;
    format: (format: string) => (insert: string) => string;
    replace: (template: string | RegExp, replacement: string) => (arg: string) => string;
    first: <T_6>(arg: T_6[]) => T_6;
    last: <T_7>(arg: T_7[]) => T_7;
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    map: <Array_1 extends any[], TransformResult>(transform: (arg: Array_1 extends (infer Item)[] ? Item : never) => TransformResult) => (arg: Array_1) => TransformResult[];
    mapValues: <T_8, R>(transform: (arg: T_8) => R) => (arg: {
        [key: string]: T_8;
    }) => {
        [key: string]: R;
    };
    wrapped: typeof $do;
    pipe: typeof pipe;
}, {
    readonly $: readonly ["exactly", "value", "literal"];
    readonly NaN: readonly ["nan", "notANumber"];
    readonly Infinity: "infinity";
    readonly zero: "0";
    readonly emptyString: "";
    readonly json: "JSON";
    readonly yaml: "YAML";
    readonly parsedJson: readonly ["unjson", "unJSON", "parsedJSON"];
    readonly parsedYaml: readonly ["unyaml", "unYAML", "parsedYAML"];
    readonly lowerCase: "lowercase";
    readonly upperCase: readonly ["UPPERCASE", "ALLCAPS"];
    readonly snakeCase: "snake_case";
    readonly kebabCase: "kebab-case";
    readonly startCase: "Start Case";
    readonly first: readonly ["firstItem", "head"];
    readonly last: readonly ["lastItem", "tail"];
    readonly prop: readonly ["property", "its"];
}>;
declare const to: Aliasified<{
    itself: <T>(arg: T) => T;
    themselves: <T_1 extends any[]>(arrayArg: T_1) => T_1;
    $: typeof give$;
    undefined: (...args: any[]) => undefined;
    null: (...args: any[]) => null;
    true: (...args: any[]) => true;
    false: (...args: any[]) => false;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    zero: (...args: any[]) => 0;
    emptyString: (...args: any[]) => "";
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
    string: <T_2>(arg: T_2) => string;
    boolean: <T_3>(arg: T_3) => boolean;
    number: <T_4>(arg: T_4) => number;
    array: <T_5>(arg: T_5) => T_5[];
    keys: (arg: object) => string[];
    json: (arg: Jsonable) => string;
    yaml: (arg: Jsonable) => string;
    parsedJson: (arg: string) => Jsonable;
    parsedYaml: (arg: string) => Jsonable;
    lowerCase: (arg: string) => string;
    upperCase: (arg: string) => string;
    camelCase: (arg: string) => string;
    snakeCase: (arg: string) => string;
    kebabCase: (arg: string) => string;
    startCase: (arg: string) => string;
    format: (format: string) => (insert: string) => string;
    replace: (template: string | RegExp, replacement: string) => (arg: string) => string;
    first: <T_6>(arg: T_6[]) => T_6;
    last: <T_7>(arg: T_7[]) => T_7;
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    map: <Array_1 extends any[], TransformResult>(transform: (arg: Array_1 extends (infer Item)[] ? Item : never) => TransformResult) => (arg: Array_1) => TransformResult[];
    mapValues: <T_8, R>(transform: (arg: T_8) => R) => (arg: {
        [key: string]: T_8;
    }) => {
        [key: string]: R;
    };
    wrapped: typeof $do;
    pipe: typeof pipe;
}, {
    readonly $: readonly ["exactly", "value", "literal"];
    readonly NaN: readonly ["nan", "notANumber"];
    readonly Infinity: "infinity";
    readonly zero: "0";
    readonly emptyString: "";
    readonly json: "JSON";
    readonly yaml: "YAML";
    readonly parsedJson: readonly ["unjson", "unJSON", "parsedJSON"];
    readonly parsedYaml: readonly ["unyaml", "unYAML", "parsedYAML"];
    readonly lowerCase: "lowercase";
    readonly upperCase: readonly ["UPPERCASE", "ALLCAPS"];
    readonly snakeCase: "snake_case";
    readonly kebabCase: "kebab-case";
    readonly startCase: "Start Case";
    readonly first: readonly ["firstItem", "head"];
    readonly last: readonly ["lastItem", "tail"];
    readonly prop: readonly ["property", "its"];
}>;
declare const go: Aliasified<{
    itself: <T>(arg: T) => T;
    themselves: <T_1 extends any[]>(arrayArg: T_1) => T_1;
    $: typeof give$;
    undefined: (...args: any[]) => undefined;
    null: (...args: any[]) => null;
    true: (...args: any[]) => true;
    false: (...args: any[]) => false;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    zero: (...args: any[]) => 0;
    emptyString: (...args: any[]) => "";
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
    string: <T_2>(arg: T_2) => string;
    boolean: <T_3>(arg: T_3) => boolean;
    number: <T_4>(arg: T_4) => number;
    array: <T_5>(arg: T_5) => T_5[];
    keys: (arg: object) => string[];
    json: (arg: Jsonable) => string;
    yaml: (arg: Jsonable) => string;
    parsedJson: (arg: string) => Jsonable;
    parsedYaml: (arg: string) => Jsonable;
    lowerCase: (arg: string) => string;
    upperCase: (arg: string) => string;
    camelCase: (arg: string) => string;
    snakeCase: (arg: string) => string;
    kebabCase: (arg: string) => string;
    startCase: (arg: string) => string;
    format: (format: string) => (insert: string) => string;
    replace: (template: string | RegExp, replacement: string) => (arg: string) => string;
    first: <T_6>(arg: T_6[]) => T_6;
    last: <T_7>(arg: T_7[]) => T_7;
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    map: <Array_1 extends any[], TransformResult>(transform: (arg: Array_1 extends (infer Item)[] ? Item : never) => TransformResult) => (arg: Array_1) => TransformResult[];
    mapValues: <T_8, R>(transform: (arg: T_8) => R) => (arg: {
        [key: string]: T_8;
    }) => {
        [key: string]: R;
    };
    wrapped: typeof $do;
    pipe: typeof pipe;
}, {
    readonly $: readonly ["exactly", "value", "literal"];
    readonly NaN: readonly ["nan", "notANumber"];
    readonly Infinity: "infinity";
    readonly zero: "0";
    readonly emptyString: "";
    readonly json: "JSON";
    readonly yaml: "YAML";
    readonly parsedJson: readonly ["unjson", "unJSON", "parsedJSON"];
    readonly parsedYaml: readonly ["unyaml", "unYAML", "parsedYAML"];
    readonly lowerCase: "lowercase";
    readonly upperCase: readonly ["UPPERCASE", "ALLCAPS"];
    readonly snakeCase: "snake_case";
    readonly kebabCase: "kebab-case";
    readonly startCase: "Start Case";
    readonly first: readonly ["firstItem", "head"];
    readonly last: readonly ["lastItem", "tail"];
    readonly prop: readonly ["property", "its"];
}>;
type CommonTransforms = typeof commonTransforms;
type CommonTransformKey = keyof CommonTransforms;
declare function give$<T>(arg: T): (...args: any[]) => T;

type PipedFunctions<From, Via, To> = Via extends [infer Via1] ? [(from: From) => Via1, (via1: Via1) => To] : Via extends [infer Via1, ...infer ViaRest] ? [(from: From) => Via1, ...PipedFunctions<Via1, ViaRest, To>] : never;
declare function pipe<From, Via, To>(...fns: PipedFunctions<From, [Via], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, To>(...fns: PipedFunctions<From, [Via1, Via2], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, Via3, To>(...fns: PipedFunctions<From, [Via1, Via2, Via3], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, Via3, Via4, To>(...fns: PipedFunctions<From, [Via1, Via2, Via3, Via4], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, Via3, Via4, Via5, To>(...fns: PipedFunctions<From, [Via1, Via2, Via3, Via4, Via5], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, Via3, Via4, Via5, Via6, To>(...fns: PipedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, Via3, Via4, Via5, Via6, Via7, To>(...fns: PipedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6, Via7], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, To>(...fns: PipedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, Via9, To>(...fns: PipedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, Via9], To>): (from: From) => To;
declare function pipe<From, Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, Via9, Via10, To>(...fns: PipedFunctions<From, [Via1, Via2, Via3, Via4, Via5, Via6, Via7, Via8, Via9, Via10], To>): (from: From) => To;

type ShiftDirection = 'left' | 'right';
declare function shiftTo<Direction extends ShiftDirection>(direction: Direction): <Args extends any[]>(args: Args) => Direction extends "left" ? Args extends [any, ...infer Rest] ? [...Rest, undefined] : never : Args extends [...infer Rest_1, any] ? [undefined, ...Rest_1] : never;
declare const shift: {
    left: <Args extends any[]>(args: Args) => Args extends [any, ...infer Rest] ? [...Rest, undefined] : never;
    right: <Args_1 extends any[]>(args: Args_1) => Args_1 extends [...infer Rest_1, any] ? [undefined, ...Rest_1] : never;
};

interface CreateEnvResult<T> {
    env: T;
    missingEnvs: Partial<T>;
    presentEnvs: Partial<T>;
}
type CreateEnvOptions = {
    missingKeyError?: (key: string) => Error;
};
declare function createEnv<T>(descriptor: T, options?: CreateEnvOptions): CreateEnvResult<T>;
declare const envCase: (string: string) => string;
declare const unEnvCase: (string?: string | undefined) => string;
declare function envKeys<T extends Dict>(dict: T): T;
declare function unEnvKeys<T extends Dict>(dict: T): T;

declare function doWith<T, Result>(target: T, callback: (target: T) => Result, { finally: cleanMethodName }: {
    finally: string;
}): Result;

type PromiseHandlers<T> = {
    then?: (value: T) => void;
    catch?: (reason: any) => void;
};
type ResolvableConfig<T, IdIsOptional extends 'idIsOptional' | false = false> = {
    previousResolved?: UnixTimestamp;
    previousPromise?: Promise<T>;
    startResolved?: boolean;
    startResolvedWith?: T;
    prohibitResolve?: boolean;
} & PromiseHandlers<T> & (IdIsOptional extends 'idIsOptional' ? {
    id?: string;
} : {
    id: string;
});
declare class Resolvable<T = void> {
    inProgress: boolean;
    private _resolve;
    private _reject;
    promise: Promise<T>;
    private config;
    constructor(config?: ResolvableConfig<T, 'idIsOptional'>, slug?: string);
    constructor(slug: string);
    then(callback: (value: T) => void | Promise<void>): this;
    catch(callback: (reason: any) => void | Promise<void>): this;
    get resolved(): boolean;
    get previousResolved(): number | undefined;
    get everResolved(): boolean;
    get id(): string;
    get lastPromise(): Promise<T>;
    resolve(value?: T): void;
    reject(reason?: any): void;
    restart(value?: T): void;
    reset(value?: T): void;
    start(okayIfInProgress?: boolean): void;
    startIfNotInProgress(): void;
    restartAfterWait(): Promise<void>;
    static resolvedWith<T>(value: T): Resolvable<T>;
    static resolved(): Resolvable<void>;
    static after(occurrence: Promise<void> | Resolvable): Resolvable;
    static after(init: () => Promise<void> | Resolvable): Resolvable;
    static all<T>(resolvables: Resolvable<T>[]): Resolvable<T[]>;
}

declare function download(url: string, release: Resolvable, filename?: string): Promise<string>;
declare function downloadAsStream(url: string, release: Resolvable): Promise<fs.ReadStream>;

declare function ensure<T>(x: T | undefined | null, errorMessage?: string): T;
declare function ensure<T>(x: T | undefined, errorMessage?: string): T;
declare function ensure<T>(x: T | null, errorMessage?: string): T;
declare function ensure<T extends U, U>(x: U, typeguard: (x: U) => x is T, errorMessage?: string): T;
type CouldBeNullOrUndefined<T> = (T | undefined | null) | (T | undefined) | (T | null);
declare function assert<T>(x: CouldBeNullOrUndefined<T>, errorMessage?: string): asserts x is T;
interface EnsurePropertyOptions {
    requiredType?: string;
    validate?: (value: any) => boolean;
    messageIfInvalid?: string;
}
declare function ensureProperty<Result, Container = any>(obj: Container, key: string, optionsOrMessageIfInvalid?: EnsurePropertyOptions | string): Result;

type Handler<HandlerArg> = (arg: HandlerArg) => void;
type ParametricHandler<HandlerArg, Params extends any[]> = (arg: HandlerArg, ...params: Params) => void;
type Listener<Client, Event extends string, HandlerArg> = (event: Event, handler: Handler<HandlerArg>) => Client;
interface Client<Event extends string, HandlerArg> {
    on: Listener<this, Event, HandlerArg>;
    removeListener: Listener<this, Event, HandlerArg>;
}
declare const groupListeners: Record<string, GroupListener<any, any, any>>;
declare class GroupListener<Event extends string, HandlerArg, Params extends any[]> {
    private client;
    private event;
    private handler;
    private listeners;
    constructor(client: Client<Event, HandlerArg>, event: Event, handler: ParametricHandler<HandlerArg, Params>);
    add(...params: Params): void;
    removeAll(): void;
    static add<Event extends string, HandlerArg, Params extends any[]>(slug: string, client: Client<Event, HandlerArg>, event: Event, handler: ParametricHandler<HandlerArg, Params>): GroupListener<Event, HandlerArg, Params>;
    static removeAll(slug: string): void;
}

declare function humanize(str: string): string;
declare function labelize(values: string[]): {
    value: string;
    label: string;
}[];

declare function jsObjectString(obj: JsonableObject): string;

type Color = 'gray' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';
type Painter = (text: string) => string;
type ColorMap<T> = {
    [color in Color]: T;
};
type Paint = ((color: Color) => Painter) & ColorMap<Painter>;
declare const ansiPrefixes: ColorMap<string>;
declare const coloredEmojis: ColorMap<string>;
declare const ansiColors: Color[];
declare const paint: Paint;
type Index = number | string;
type LogIndices = {
    [index in Index]: boolean | LogIndices;
};
type LoggerInfo = {
    lastLogIndex: number;
    logAll?: boolean;
    logToFile?: boolean;
    logIndices: LogIndices;
    dontShrinkArrays?: boolean;
    logIfHeapIncreasedByMB?: number;
    lastHeapUsedMB?: number;
};
declare const loggerInfo: LoggerInfo;
declare function setLastLogIndex(index: number): void;
declare const serializer: {
    json: (arg: any) => string;
    yaml: (arg: any) => string;
    none: (arg: any) => any;
};
type SerializeAs = keyof typeof serializer;
type LogOptions = {
    color: Color;
    serializeAs: SerializeAs;
};
type LogFunction = (...args: any[]) => void;
type PossiblySerializedLogFunction = LogFunction & {
    [serialize in SerializeAs]: LogFunction;
};
type Log = PossiblySerializedLogFunction & {
    [color in Color]: PossiblySerializedLogFunction;
} & {
    always: Log;
};
declare function serializable(arg: any): any;
declare function withLogFile<T>(index: number | string, callback: (logFile: string) => T): T;
declare function serialize(arg: any, serializeAs: SerializeAs): string;
declare function getHeapUsedMB(): number;
declare function logger(index: number | string | 'always', defaultColor?: Color, defaultSerializeAs?: SerializeAs): Log;
declare function logger(index: number | string | 'always', defaultOptions?: LogOptions, addAlways?: boolean): Log;

declare function jsonClone<T>(obj: T): T & Jsonable;
declare function jsonEqual<T>(a: T, b: T): boolean;
declare function isJsonable(obj: any): obj is Jsonable;
declare function isJsonableObject(obj: any): obj is JsonableObject;

type Merge<Target extends object | ((...args: any[]) => any), Source extends object> = {
    [K in keyof Target | keyof Source]: K extends keyof Target ? K extends keyof Source ? Target[K] extends object ? Source[K] extends object ? Merge<Target[K], Source[K]> : never : never : Target[K] : K extends keyof Source ? Source[K] : never;
} & (Target extends ((...args: infer Args) => infer Returns) ? (...args: Args) => Returns : {});
declare function merge<Target extends object, Source extends object>(target: Target, getSource: (target: Target) => Source): Merge<Target, Source>;
declare function merge<Target extends object, Source extends object>(target: Target, source: Source): Merge<Target, Source>;
declare function merge<Target extends object, Source1 extends object, Source2 extends object>(target: Target, getSource1: (target: Target) => Source1, getSource2: (mergedTarget: Merge<Target, Source1>) => Source2): Merge<Merge<Target, Source1>, Source2>;
declare function merge<Target extends object, Source1 extends object, Source2 extends object>(target: Target, source1: Source1, source2: Source2): Merge<Merge<Target, Source1>, Source2>;

interface INpmLsOutput {
    dependencies: Record<string, {
        resolved?: string;
    }>;
}
type NpmLink = [string, string];
declare function getNpmLinks(): NpmLink[];
declare function viteConfigForNpmLinks(): IViteConfig;
interface IViteConfig {
    resolve?: {
        alias: Record<string, string>;
    };
    server?: {
        fs: {
            allow: string[];
        };
    };
}
declare function forceUpdateNpmLinks(): void;

declare function setReliableTimeout(callback: (actualTimePassed: number) => void, timeout: number): NodeJS.Timeout;

type Typed<T extends string | number> = {
    type: T;
};
type KindOf<T extends string | number> = {
    kind: T;
};
declare function toType<T extends string | number>(type: T): <O extends object>(object: O) => O & Typed<T>;
declare function isTyped<T extends string | number>(type: T): <O extends Typed<string | number>>(object: O) => object is O & Typed<T>;
declare function isKindOf<T extends string | number>(kind: T): <O extends {
    kind: string;
}>(object: O) => object is O & KindOf<T>;

declare function undefinedIfFalsey<T>(value: T): T | undefined;

export { $as, $do, $if, $throw, $thrower, $try, $with, AliasedKeys, AliasesDefinition, AliasesFor, Aliasified, ChainableKeys, ChainableTypes, Chainified, CheckKind, CheckState, Client, Color, ColorMap, CommonPredicateMap, CommonPredicateName, CommonPredicates, CommonTransformKey, CommonTransforms, CouldBeNullOrUndefined, CreateEnvOptions, CreateEnvResult, Dict, EnsurePropertyOptions, Evaluate, FunctionThatReturns, GroupListener, GuardedWithMap, Handler, INpmLsOutput, IViteConfig, Index, Jsonable, JsonableNonArray, JsonableObject, KindOf, Listener, Log, LogFunction, LogIndices, LogOptions, LoggerInfo, MapForType, Merge, MethodKey, Narrowed, NonTypeguard, Not, NpmLink, Paint, Painter, ParametricHandler, ParseSwitchOutput, ParseTransformOutput, PipedFunctions, PossiblySerializedLogFunction, Predicate, PredicateOutput, Primitive, PromiseHandlers, PushToStackOutput, Resolvable, ResolvableConfig, SerializeAs, ShiftDirection, Transform, TransformResult, Typed, Typeguard, TypeguardMap, UnixTimestamp, aint, aliasify, also, ansiColors, ansiPrefixes, assert, assign, assignTo, both, callIts, chainified, check, coloredEmojis, commonPredicates, commonTransforms, compileTimeError, conformsToTypeguardMap, createEnv, doWith, does, doesnt, download, downloadAsStream, either, ensure, ensureProperty, envCase, envKeys, evaluate, forceUpdateNpmLinks, functionThatReturns, getHeapUsedMB, getNpmLinks, getProp, give, give$, go, groupListeners, has, humanize, is, isJsonable, isJsonableObject, isKindOf, isLike, isPrimitive, isTyped, isTypeguardMap, isnt, its, jsObjectString, jsonClone, jsonEqual, labelize, lazily, logger, loggerInfo, merge, meta, not, paint, parseSwitch, parseTransform, pipe, please, pushToStack, respectively, serializable, serialize, serializer, setLastLogIndex, setReliableTimeout, shift, shiftTo, shouldNotBe, to, toType, transform, tuple, unEnvCase, unEnvKeys, undefinedIfFalsey, viteConfigForNpmLinks, withLogFile, wrap };
