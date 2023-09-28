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

type StrictlyPartial<T> = {
    [K in string]: K extends keyof T ? T[K] : never;
};
declare function assign<T extends Record<string, any>, U extends Partial<T>>(object: T, newValuesOrCallback: U | ((object: T) => U)): Required<T> extends Required<U> ? T & U : never;
declare function mutate<T extends Record<string, any>, U extends Partial<T>>(object: T, newValuesOrCallback: U | ((object: T) => U)): asserts object is T & U;
declare function addProperties<T extends object, U extends object>(object: T, newValuesOrCallback: U | ((object: T) => U)): asserts object is T & U;

type Camelized<T, CamelizeStrings extends boolean = true> = T extends string ? CamelizeStrings extends true ? T extends `${infer U}_${infer V}` ? `${Lowercase<U>}${Capitalize<Camelized<V>>}` : Lowercase<T> : T : T extends object[] ? Camelized<T[number]>[] : T extends object ? {
    [K in keyof T as Camelized<K & string>]: Camelized<T[K], false>;
} : T;
declare const camelize: <T>(target: T) => Camelized<T, true>;
declare function isCamelCase<T>(target: T | Camelized<T>): target is Camelized<T>;

type Dict<T = any> = {
    [key: string]: T;
} | Promise<Dict>;
type UnixTimestamp = number;
type Primitive = string | number | boolean | null | undefined;
declare function isPrimitive(v: any): v is Primitive;
type JsonableObject = {
    [key: string]: Jsonable;
};
type KeyOfJsonable = keyof JsonableObject;
type JsonableNonArray = Primitive | JsonableObject;
type Jsonable = JsonableNonArray | Jsonable[];
type FunctionThatReturns<T> = (...args: any[]) => T;
declare function functionThatReturns<T>(value: T): FunctionThatReturns<T>;
declare function $as<AsWhat>(what: any): AsWhat;
declare function $as<AsWhat>(what: FunctionThatReturns<any>): FunctionThatReturns<AsWhat>;
declare function tuple<T extends any[]>(...args: T): T;
type StringKey<T> = Extract<keyof T, string>;

interface CreateEnvResult<T> {
    env: T;
    missingEnvs: Partial<T>;
    presentEnvs: Partial<T>;
}
type CreateEnvOptions = {
    missingKeyError?: (key: string) => Error;
};
declare function createEnv<T>(descriptor: Record<keyof T, string>, options?: CreateEnvOptions): CreateEnvResult<T>;
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
    finally?: () => void;
};
type ResolvableConfig<T, IdIsOptional extends 'idIsOptional' | false = false> = {
    previousResolved?: UnixTimestamp;
    previousPromise?: Promise<T>;
    startResolved?: T extends void ? boolean : undefined;
    startResolvedWith?: T extends void ? undefined : T;
    prohibitResolve?: boolean;
} & PromiseHandlers<T> & (IdIsOptional extends 'idIsOptional' ? {
    id?: string;
} : {
    id: string;
});
declare class Resolvable<T = void> {
    inProgress: boolean;
    rejected: boolean;
    private _resolve;
    private _reject;
    promise: Promise<T>;
    resolvedWith?: T extends void ? never : T;
    rejectedWith: any;
    private config;
    constructor(config?: ResolvableConfig<T, 'idIsOptional'>, slug?: string);
    constructor(slug: string);
    then(callback: (value: T) => void | Promise<void>): this;
    catch(callback: (reason: any) => void | Promise<void>): this;
    finally(callback: () => void | Promise<void>): this;
    get resolved(): boolean;
    get previousResolved(): number | undefined;
    get everResolved(): boolean;
    get id(): string;
    get lastPromise(): Promise<T>;
    resolve(value: T): void;
    resolveIfInProgress(value: T): void;
    reject(reason?: any): void;
    restart(value: T): void;
    reset(value: T): void;
    start(okayIfInProgress?: boolean): void;
    startIfNotInProgress(): void;
    restartAfterWait(): Promise<void>;
    static resolvedWith<U>(value: U): Resolvable<U>;
    static resolved(): Resolvable<void>;
    static after<T>(occurrence: Promise<T> | Resolvable<T>): Resolvable<T>;
    static after<T>(init: () => Promise<T> | Resolvable<T>): Resolvable<T>;
    static all<T>(resolvables: Resolvable<T>[]): Resolvable<T[]>;
}

declare function download(url: string, release: Resolvable, filename?: string): Promise<string>;
declare function downloadAsStream(url: string, release: Resolvable): Promise<fs.ReadStream>;

declare function ensure<T>(x: T | undefined | null, errorMessage?: string): T;
declare function ensure<T>(x: T | undefined, errorMessage?: string): T;
declare function ensure<T>(x: T | null, errorMessage?: string): T;
declare function ensure<T extends U, U>(x: U, typeguard: (x: U) => x is T, errorMessage?: string | ((x: U) => string)): T;
type CouldBeNullOrUndefined<T> = (T | undefined | null) | (T | undefined) | (T | null);
declare function assert<T>(x: CouldBeNullOrUndefined<T>, errorMessage?: string): asserts x is T;
interface EnsurePropertyOptions {
    requiredType?: string;
    validate?: (value: any) => boolean;
    messageIfInvalid?: string;
}
declare function ensureProperty<Result, Container = any>(obj: Container, key: string, optionsOrMessageIfInvalid?: EnsurePropertyOptions | string): Result;

type IteratorArgs<T extends object, R> = [
    object: T,
    callback: <K extends StringKey<T>>(value: T[K], key: K) => R
];
declare function forEach<T extends object>(...[object, callback]: IteratorArgs<T, void>): void;
declare function map<T extends object, R>(...[object, callback]: IteratorArgs<T, R>): R[];
declare function every<T extends object>(...[object, callback]: IteratorArgs<T, boolean>): boolean;
declare function any<T extends object>(...[object, callback]: IteratorArgs<T, boolean>): boolean;

type MethodKey<T, Args extends any[], Result> = {
    [K in keyof T]: T[K] extends (...args: Args) => Result ? K : never;
}[keyof T];
declare function $do<Arg1, Arg2, Result>(fn: (arg1: Arg1, arg2: Arg2) => Result, arg2: Arg2): (target: Arg1) => Result;
declare function $do<Arg1, Arg2, Result>(key: MethodKey<Arg1, [Arg2], Result>, arg2: Arg2): (target: Arg1) => Result;
declare function $do<Arg1, Arg2, Arg3, Result>(fn: (arg1: Arg1, arg2: Arg2, arg3: Arg3) => Result, arg2: Arg2, arg3: Arg3): (target: Arg1) => Result;
declare function $do<Arg1, Arg2, Arg3, Result>(key: MethodKey<Arg1, [Arg2, Arg3], Result>, arg2: Arg2, arg3: Arg3): (target: Arg1) => Result;
declare const wrap: typeof $do;

declare function $throw<T extends Error>(error: T): never;
declare function $throw(message: string): never;
declare function $throw<T extends Error>(errorOrMessage: T | string): never;
declare function $thrower<T extends Error>(errorOrMessage: T | string): FunctionThatReturns<never>;

declare function $try<T>(fn: () => T, fallbackValue: T, finallyCallback?: () => void): T;
declare function $try<T>(fn: () => T, fallback?: (error?: Error) => T, finallyCallback?: () => void): T;

declare function $with<Arg, Result>(arg: Arg, fn: (arg: Arg) => Result): Result;
declare function $with<Args extends any[]>(...args: Args): {
    do: <Result>(fn: (...args: Args) => Result) => Result;
};

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
declare function conformsToTypeguardMap<Keys extends string, TG extends TypeguardMap<Keys>>(typeguardMap: TG): <T>(object: T) => object is GuardedWithMap<TG> extends T ? GuardedWithMap<TG> : never;

type ChainableKeys<Function extends (...args: any[]) => any, ChainedParameterIndex extends number> = (keyof NonNullable<Parameters<Function>[ChainedParameterIndex]>);
type ChainableTypes<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]> = Pick<NonNullable<Parameters<Function>[ChainedParameterIndex]>, ChainedKeys[number]>;
type Chainified<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]> = {
    [Key in ChainedKeys[number]]: (value: ChainableTypes<Function, ChainedParameterIndex, [Key]>[Key]) => ((...args: Parameters<Function>) => ReturnType<Function>) & Chainified<Function, ChainedParameterIndex, Exclude<ChainedKeys, Key>>;
};
declare function chainified<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]>($function: Function, chainedParameterIndex: ChainedParameterIndex, chainedKeys: ChainedKeys): Chainified<Function, ChainedParameterIndex, ChainedKeys>;

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

declare function both<Arg, Guarded1 extends Arg, Guarded2 extends Guarded1>(typeguard1: Typeguard<Arg, Guarded1>, typeguard2: Typeguard<Guarded1, Guarded2>): Typeguard<Arg, Guarded2>;
declare function both<Arg>(predicate1: NonTypeguard<Arg>, predicate2: NonTypeguard<Arg>): NonTypeguard<Arg>;

declare function isFunction(maybeFn: any): maybeFn is (...args: any[]) => any;
declare function isFunction<Args extends any[], Result>(maybeFn: any): maybeFn is (...args: Args) => Result;

declare function genericTypeguard<G>(predicate: ((arg: any) => arg is G) | ((arg: any) => boolean)): {
    <T>(arg: G | T): arg is G;
    <T_1>(arg: T_1): arg is T_1 & G;
    <T_2, H extends G>(arg: T_2 | H): arg is H;
    (arg: any): arg is G;
};
type GenericTypeguard<G> = ReturnType<typeof genericTypeguard<G>>;
declare function isExactly<T>(sample: T): {
    <T_1>(arg: T | T_1): arg is T;
    <T_2>(arg: T_2): arg is T_2 & T;
    <T_3, H extends T>(arg: T_3 | H): arg is H;
    (arg: any): arg is T;
};
declare function isInstanceOf<C extends new (...args: any[]) => any>(constructor: C): {
    <T>(arg: InstanceType<C> | T): arg is InstanceType<C>;
    <T_1>(arg: T_1): arg is T_1 & InstanceType<C>;
    <T_2, H extends InstanceType<C>>(arg: T_2 | H): arg is H;
    (arg: any): arg is InstanceType<C>;
};
declare const commonPredicates: {
    undefined: {
        <T>(arg: T | undefined): arg is undefined;
        <T_1>(arg: T_1): arg is T_1 & undefined;
        <T_2, H extends undefined>(arg: T_2 | H): arg is H;
        (arg: any): arg is undefined;
    };
    void: {
        <T_3>(arg: void | T_3): arg is void;
        <T_4>(arg: T_4): arg is T_4 & void;
        <T_5, H_1 extends void>(arg: T_5 | H_1): arg is H_1;
        (arg: any): arg is void;
    };
    null: {
        <T_6>(arg: T_6 | null): arg is null;
        <T_7>(arg: T_7): arg is T_7 & null;
        <T_8, H_2 extends null>(arg: T_8 | H_2): arg is H_2;
        (arg: any): arg is null;
    };
    nil: {
        <T_9>(arg: T_9 | null | undefined): arg is null | undefined;
        <T_10>(arg: T_10): arg is T_10 & (null | undefined);
        <T_11, H_3 extends null | undefined>(arg: T_11 | H_3): arg is H_3;
        (arg: any): arg is null | undefined;
    };
    string: {
        <T_12>(arg: string | T_12): arg is string;
        <T_13>(arg: T_13): arg is T_13 & string;
        <T_14, H_4 extends string>(arg: T_14 | H_4): arg is H_4;
        (arg: any): arg is string;
    };
    emptyString: {
        <T_12>(arg: string | T_12): arg is string;
        <T_13>(arg: T_13): arg is T_13 & string;
        <T_14, H_4 extends string>(arg: T_14 | H_4): arg is H_4;
        (arg: any): arg is string;
    };
    number: {
        <T_15>(arg: number | T_15): arg is number;
        <T_16>(arg: T_16): arg is T_16 & number;
        <T_17, H_5 extends number>(arg: T_17 | H_5): arg is H_5;
        (arg: any): arg is number;
    };
    zero: {
        <T_15>(arg: number | T_15): arg is number;
        <T_16>(arg: T_16): arg is T_16 & number;
        <T_17, H_5 extends number>(arg: T_17 | H_5): arg is H_5;
        (arg: any): arg is number;
    };
    boolean: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    false: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    true: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    function: typeof isFunction;
    promise: {
        <T_21>(arg: Promise<any> | T_21): arg is Promise<any>;
        <T_22>(arg: T_22): arg is T_22 & Promise<any>;
        <T_23, H_7 extends Promise<any>>(arg: T_23 | H_7): arg is H_7;
        (arg: any): arg is Promise<any>;
    };
    object: {
        <T_24>(arg: object | T_24): arg is object;
        <T_25>(arg: T_25): arg is T_25 & object;
        <T_26, H_8 extends object>(arg: T_26 | H_8): arg is H_8;
        (arg: any): arg is object;
    };
    array: typeof isArray;
    regexp: {
        <T_27>(arg: RegExp | T_27): arg is RegExp;
        <T_28>(arg: T_28): arg is T_28 & RegExp;
        <T_29, H_9 extends RegExp>(arg: T_29 | H_9): arg is H_9;
        (arg: any): arg is RegExp;
    };
    itself: <T_30>(arg: T_30) => arg is T_30;
    primitive: {
        <T_31>(arg: Primitive | T_31): arg is Primitive;
        <T_32>(arg: T_32): arg is T_32 & Primitive;
        <T_33, H_10 extends Primitive>(arg: T_33 | H_10): arg is H_10;
        (arg: any): arg is Primitive;
    };
    jsonable: {
        <T_34>(arg: Jsonable | T_34): arg is Jsonable;
        <T_35>(arg: T_35): arg is T_35 & Jsonable;
        <T_36, H_11 extends Jsonable>(arg: T_36 | H_11): arg is H_11;
        (arg: any): arg is Jsonable;
    };
    jsonableObject: {
        <T_37>(arg: JsonableObject | T_37): arg is JsonableObject;
        <T_38>(arg: T_38): arg is T_38 & JsonableObject;
        <T_39, H_12 extends JsonableObject>(arg: T_39 | H_12): arg is H_12;
        (arg: any): arg is JsonableObject;
    };
    defined: <T_40>(arg: T_40 | undefined) => arg is T_40;
    empty: <T_41 extends {
        length: number;
    }>(arg: T_41) => arg is T_41 & {
        length: 0;
    };
    truthy: <T_42>(arg: false | "" | 0 | T_42 | null | undefined) => arg is T_42;
    falsy: <T_43>(arg: false | "" | 0 | T_43 | null | undefined) => arg is false | "" | 0 | null | undefined;
    exactly: typeof isExactly;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    among: typeof isAmong;
    match: <T_44 extends object>(sample: T_44) => <U extends T_44>(arg: U) => boolean;
    like: typeof conformsToTypeguardMap;
    typed: typeof isTyped;
    camelCase: typeof isCamelCase;
    anything: (...args: any[]) => true;
};
type CommonPredicates = typeof commonPredicates;
type CommonPredicateName = keyof CommonPredicates;
type CommonPredicateMap = {
    [K in CommonPredicateName]: any;
};
declare const is: {
    string: {
        <T_12>(arg: string | T_12): arg is string;
        <T_13>(arg: T_13): arg is T_13 & string;
        <T_14, H_4 extends string>(arg: T_14 | H_4): arg is H_4;
        (arg: any): arg is string;
    };
    number: {
        <T_15>(arg: number | T_15): arg is number;
        <T_16>(arg: T_16): arg is T_16 & number;
        <T_17, H_5 extends number>(arg: T_17 | H_5): arg is H_5;
        (arg: any): arg is number;
    };
    boolean: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    undefined: {
        <T>(arg: T | undefined): arg is undefined;
        <T_1>(arg: T_1): arg is T_1 & undefined;
        <T_2, H extends undefined>(arg: T_2 | H): arg is H;
        (arg: any): arg is undefined;
    };
    object: {
        <T_24>(arg: object | T_24): arg is object;
        <T_25>(arg: T_25): arg is T_25 & object;
        <T_26, H_8 extends object>(arg: T_26 | H_8): arg is H_8;
        (arg: any): arg is object;
    };
    function: typeof isFunction;
    match: <T_44 extends object>(sample: T_44) => <U extends T_44>(arg: U) => boolean;
    void: {
        <T_3>(arg: void | T_3): arg is void;
        <T_4>(arg: T_4): arg is T_4 & void;
        <T_5, H_1 extends void>(arg: T_5 | H_1): arg is H_1;
        (arg: any): arg is void;
    };
    null: {
        <T_6>(arg: T_6 | null): arg is null;
        <T_7>(arg: T_7): arg is T_7 & null;
        <T_8, H_2 extends null>(arg: T_8 | H_2): arg is H_2;
        (arg: any): arg is null;
    };
    nil: {
        <T_9>(arg: T_9 | null | undefined): arg is null | undefined;
        <T_10>(arg: T_10): arg is T_10 & (null | undefined);
        <T_11, H_3 extends null | undefined>(arg: T_11 | H_3): arg is H_3;
        (arg: any): arg is null | undefined;
    };
    emptyString: {
        <T_12>(arg: string | T_12): arg is string;
        <T_13>(arg: T_13): arg is T_13 & string;
        <T_14, H_4 extends string>(arg: T_14 | H_4): arg is H_4;
        (arg: any): arg is string;
    };
    zero: {
        <T_15>(arg: number | T_15): arg is number;
        <T_16>(arg: T_16): arg is T_16 & number;
        <T_17, H_5 extends number>(arg: T_17 | H_5): arg is H_5;
        (arg: any): arg is number;
    };
    false: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    true: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    promise: {
        <T_21>(arg: Promise<any> | T_21): arg is Promise<any>;
        <T_22>(arg: T_22): arg is T_22 & Promise<any>;
        <T_23, H_7 extends Promise<any>>(arg: T_23 | H_7): arg is H_7;
        (arg: any): arg is Promise<any>;
    };
    array: typeof isArray;
    regexp: {
        <T_27>(arg: RegExp | T_27): arg is RegExp;
        <T_28>(arg: T_28): arg is T_28 & RegExp;
        <T_29, H_9 extends RegExp>(arg: T_29 | H_9): arg is H_9;
        (arg: any): arg is RegExp;
    };
    itself: <T_30>(arg: T_30) => arg is T_30;
    primitive: {
        <T_31>(arg: Primitive | T_31): arg is Primitive;
        <T_32>(arg: T_32): arg is T_32 & Primitive;
        <T_33, H_10 extends Primitive>(arg: T_33 | H_10): arg is H_10;
        (arg: any): arg is Primitive;
    };
    jsonable: {
        <T_34>(arg: Jsonable | T_34): arg is Jsonable;
        <T_35>(arg: T_35): arg is T_35 & Jsonable;
        <T_36, H_11 extends Jsonable>(arg: T_36 | H_11): arg is H_11;
        (arg: any): arg is Jsonable;
    };
    jsonableObject: {
        <T_37>(arg: JsonableObject | T_37): arg is JsonableObject;
        <T_38>(arg: T_38): arg is T_38 & JsonableObject;
        <T_39, H_12 extends JsonableObject>(arg: T_39 | H_12): arg is H_12;
        (arg: any): arg is JsonableObject;
    };
    defined: <T_40>(arg: T_40 | undefined) => arg is T_40;
    empty: <T_41 extends {
        length: number;
    }>(arg: T_41) => arg is T_41 & {
        length: 0;
    };
    truthy: <T_42>(arg: false | "" | 0 | T_42 | null | undefined) => arg is T_42;
    falsy: <T_43>(arg: false | "" | 0 | T_43 | null | undefined) => arg is false | "" | 0 | null | undefined;
    exactly: typeof isExactly;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    among: typeof isAmong;
    like: typeof conformsToTypeguardMap;
    typed: typeof isTyped;
    camelCase: typeof isCamelCase;
    anything: (...args: any[]) => true;
    not: {
        undefined: (arg: any) => arg is any;
        void: (arg: any) => arg is any;
        null: (arg: any) => arg is any;
        nil: (arg: any) => arg is any;
        string: (arg: any) => arg is any;
        emptyString: (arg: any) => arg is any;
        number: (arg: any) => arg is any;
        zero: (arg: any) => arg is any;
        boolean: (arg: any) => arg is any;
        false: (arg: any) => arg is any;
        true: (arg: any) => arg is any;
        function: (arg: any) => arg is any;
        promise: (arg: any) => arg is any;
        object: (arg: any) => arg is any;
        array: (arg: unknown) => arg is unknown;
        regexp: (arg: any) => arg is any;
        itself: <T>(arg: T) => arg is Exclude<T, T>;
        primitive: (arg: any) => arg is any;
        jsonable: (arg: any) => arg is any;
        jsonableObject: (arg: any) => arg is any;
        defined: <T_1>(arg: T_1 | undefined) => arg is Exclude<undefined, T_1> | Exclude<T_1, T_1>;
        empty: <T_2 extends {
            length: number;
        }>(arg: T_2) => arg is Exclude<T_2, T_2 & {
            length: 0;
        }>;
        truthy: <T_3>(arg: false | "" | 0 | T_3 | null | undefined) => arg is Exclude<undefined, T_3> | Exclude<null, T_3> | Exclude<false, T_3> | Exclude<"", T_3> | Exclude<0, T_3> | Exclude<T_3, T_3>;
        falsy: <T_4>(arg: false | "" | 0 | T_4 | null | undefined) => arg is Exclude<T_4, false | "" | 0 | null | undefined>;
        exactly: <T_5>(sample: T_5) => (arg: any) => arg is Exclude<any, T_5>;
        above: (sample: number) => (arg: number) => boolean;
        below: (sample: number) => (arg: number) => boolean;
        atLeast: (sample: number) => (arg: number) => boolean;
        atMost: (sample: number) => (arg: number) => boolean;
        among: (options: any[]) => (arg: any) => arg is never;
        like: (sample: TypeguardMap) => <T_6>(arg: T_6) => arg is Exclude<T_6, GuardedWithMap<TypeguardMap<string>> extends T_6 ? T_6 & GuardedWithMap<TypeguardMap<string>> : never>;
        typed: <T_7 extends string | number>(type: T_7) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_7>>;
        match: <T_8 extends object>(sample: T_8) => <U extends T_8>(arg: U) => boolean;
        camelCase: <T_9>(arg: T_9 | Camelized<T_9, true>) => arg is Exclude<T_9, Camelized<T_9, true>> | Exclude<Camelized<T_9, true>, Camelized<T_9, true>>;
        anything: (arg: any) => false;
    };
};
declare const does: {
    string: {
        <T_12>(arg: string | T_12): arg is string;
        <T_13>(arg: T_13): arg is T_13 & string;
        <T_14, H_4 extends string>(arg: T_14 | H_4): arg is H_4;
        (arg: any): arg is string;
    };
    number: {
        <T_15>(arg: number | T_15): arg is number;
        <T_16>(arg: T_16): arg is T_16 & number;
        <T_17, H_5 extends number>(arg: T_17 | H_5): arg is H_5;
        (arg: any): arg is number;
    };
    boolean: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    undefined: {
        <T>(arg: T | undefined): arg is undefined;
        <T_1>(arg: T_1): arg is T_1 & undefined;
        <T_2, H extends undefined>(arg: T_2 | H): arg is H;
        (arg: any): arg is undefined;
    };
    object: {
        <T_24>(arg: object | T_24): arg is object;
        <T_25>(arg: T_25): arg is T_25 & object;
        <T_26, H_8 extends object>(arg: T_26 | H_8): arg is H_8;
        (arg: any): arg is object;
    };
    function: typeof isFunction;
    match: <T_44 extends object>(sample: T_44) => <U extends T_44>(arg: U) => boolean;
    void: {
        <T_3>(arg: void | T_3): arg is void;
        <T_4>(arg: T_4): arg is T_4 & void;
        <T_5, H_1 extends void>(arg: T_5 | H_1): arg is H_1;
        (arg: any): arg is void;
    };
    null: {
        <T_6>(arg: T_6 | null): arg is null;
        <T_7>(arg: T_7): arg is T_7 & null;
        <T_8, H_2 extends null>(arg: T_8 | H_2): arg is H_2;
        (arg: any): arg is null;
    };
    nil: {
        <T_9>(arg: T_9 | null | undefined): arg is null | undefined;
        <T_10>(arg: T_10): arg is T_10 & (null | undefined);
        <T_11, H_3 extends null | undefined>(arg: T_11 | H_3): arg is H_3;
        (arg: any): arg is null | undefined;
    };
    emptyString: {
        <T_12>(arg: string | T_12): arg is string;
        <T_13>(arg: T_13): arg is T_13 & string;
        <T_14, H_4 extends string>(arg: T_14 | H_4): arg is H_4;
        (arg: any): arg is string;
    };
    zero: {
        <T_15>(arg: number | T_15): arg is number;
        <T_16>(arg: T_16): arg is T_16 & number;
        <T_17, H_5 extends number>(arg: T_17 | H_5): arg is H_5;
        (arg: any): arg is number;
    };
    false: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    true: {
        <T_18>(arg: boolean | T_18): arg is boolean;
        <T_19>(arg: T_19): arg is T_19 & boolean;
        <T_20, H_6 extends boolean>(arg: T_20 | H_6): arg is H_6;
        (arg: any): arg is boolean;
    };
    promise: {
        <T_21>(arg: Promise<any> | T_21): arg is Promise<any>;
        <T_22>(arg: T_22): arg is T_22 & Promise<any>;
        <T_23, H_7 extends Promise<any>>(arg: T_23 | H_7): arg is H_7;
        (arg: any): arg is Promise<any>;
    };
    array: typeof isArray;
    regexp: {
        <T_27>(arg: RegExp | T_27): arg is RegExp;
        <T_28>(arg: T_28): arg is T_28 & RegExp;
        <T_29, H_9 extends RegExp>(arg: T_29 | H_9): arg is H_9;
        (arg: any): arg is RegExp;
    };
    itself: <T_30>(arg: T_30) => arg is T_30;
    primitive: {
        <T_31>(arg: Primitive | T_31): arg is Primitive;
        <T_32>(arg: T_32): arg is T_32 & Primitive;
        <T_33, H_10 extends Primitive>(arg: T_33 | H_10): arg is H_10;
        (arg: any): arg is Primitive;
    };
    jsonable: {
        <T_34>(arg: Jsonable | T_34): arg is Jsonable;
        <T_35>(arg: T_35): arg is T_35 & Jsonable;
        <T_36, H_11 extends Jsonable>(arg: T_36 | H_11): arg is H_11;
        (arg: any): arg is Jsonable;
    };
    jsonableObject: {
        <T_37>(arg: JsonableObject | T_37): arg is JsonableObject;
        <T_38>(arg: T_38): arg is T_38 & JsonableObject;
        <T_39, H_12 extends JsonableObject>(arg: T_39 | H_12): arg is H_12;
        (arg: any): arg is JsonableObject;
    };
    defined: <T_40>(arg: T_40 | undefined) => arg is T_40;
    empty: <T_41 extends {
        length: number;
    }>(arg: T_41) => arg is T_41 & {
        length: 0;
    };
    truthy: <T_42>(arg: false | "" | 0 | T_42 | null | undefined) => arg is T_42;
    falsy: <T_43>(arg: false | "" | 0 | T_43 | null | undefined) => arg is false | "" | 0 | null | undefined;
    exactly: typeof isExactly;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    among: typeof isAmong;
    like: typeof conformsToTypeguardMap;
    typed: typeof isTyped;
    camelCase: typeof isCamelCase;
    anything: (...args: any[]) => true;
    not: {
        undefined: (arg: any) => arg is any;
        void: (arg: any) => arg is any;
        null: (arg: any) => arg is any;
        nil: (arg: any) => arg is any;
        string: (arg: any) => arg is any;
        emptyString: (arg: any) => arg is any;
        number: (arg: any) => arg is any;
        zero: (arg: any) => arg is any;
        boolean: (arg: any) => arg is any;
        false: (arg: any) => arg is any;
        true: (arg: any) => arg is any;
        function: (arg: any) => arg is any;
        promise: (arg: any) => arg is any;
        object: (arg: any) => arg is any;
        array: (arg: unknown) => arg is unknown;
        regexp: (arg: any) => arg is any;
        itself: <T>(arg: T) => arg is Exclude<T, T>;
        primitive: (arg: any) => arg is any;
        jsonable: (arg: any) => arg is any;
        jsonableObject: (arg: any) => arg is any;
        defined: <T_1>(arg: T_1 | undefined) => arg is Exclude<undefined, T_1> | Exclude<T_1, T_1>;
        empty: <T_2 extends {
            length: number;
        }>(arg: T_2) => arg is Exclude<T_2, T_2 & {
            length: 0;
        }>;
        truthy: <T_3>(arg: false | "" | 0 | T_3 | null | undefined) => arg is Exclude<undefined, T_3> | Exclude<null, T_3> | Exclude<false, T_3> | Exclude<"", T_3> | Exclude<0, T_3> | Exclude<T_3, T_3>;
        falsy: <T_4>(arg: false | "" | 0 | T_4 | null | undefined) => arg is Exclude<T_4, false | "" | 0 | null | undefined>;
        exactly: <T_5>(sample: T_5) => (arg: any) => arg is Exclude<any, T_5>;
        above: (sample: number) => (arg: number) => boolean;
        below: (sample: number) => (arg: number) => boolean;
        atLeast: (sample: number) => (arg: number) => boolean;
        atMost: (sample: number) => (arg: number) => boolean;
        among: (options: any[]) => (arg: any) => arg is never;
        like: (sample: TypeguardMap) => <T_6>(arg: T_6) => arg is Exclude<T_6, GuardedWithMap<TypeguardMap<string>> extends T_6 ? T_6 & GuardedWithMap<TypeguardMap<string>> : never>;
        typed: <T_7 extends string | number>(type: T_7) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_7>>;
        match: <T_8 extends object>(sample: T_8) => <U extends T_8>(arg: U) => boolean;
        camelCase: <T_9>(arg: T_9 | Camelized<T_9, true>) => arg is Exclude<T_9, Camelized<T_9, true>> | Exclude<Camelized<T_9, true>, Camelized<T_9, true>>;
        anything: (arg: any) => false;
    };
};
declare const isnt: {
    undefined: (arg: any) => arg is any;
    void: (arg: any) => arg is any;
    null: (arg: any) => arg is any;
    nil: (arg: any) => arg is any;
    string: (arg: any) => arg is any;
    emptyString: (arg: any) => arg is any;
    number: (arg: any) => arg is any;
    zero: (arg: any) => arg is any;
    boolean: (arg: any) => arg is any;
    false: (arg: any) => arg is any;
    true: (arg: any) => arg is any;
    function: (arg: any) => arg is any;
    promise: (arg: any) => arg is any;
    object: (arg: any) => arg is any;
    array: (arg: unknown) => arg is unknown;
    regexp: (arg: any) => arg is any;
    itself: <T>(arg: T) => arg is Exclude<T, T>;
    primitive: (arg: any) => arg is any;
    jsonable: (arg: any) => arg is any;
    jsonableObject: (arg: any) => arg is any;
    defined: <T_1>(arg: T_1 | undefined) => arg is Exclude<undefined, T_1> | Exclude<T_1, T_1>;
    empty: <T_2 extends {
        length: number;
    }>(arg: T_2) => arg is Exclude<T_2, T_2 & {
        length: 0;
    }>;
    truthy: <T_3>(arg: false | "" | 0 | T_3 | null | undefined) => arg is Exclude<undefined, T_3> | Exclude<null, T_3> | Exclude<false, T_3> | Exclude<"", T_3> | Exclude<0, T_3> | Exclude<T_3, T_3>;
    falsy: <T_4>(arg: false | "" | 0 | T_4 | null | undefined) => arg is Exclude<T_4, false | "" | 0 | null | undefined>;
    exactly: <T_5>(sample: T_5) => (arg: any) => arg is Exclude<any, T_5>;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    among: (options: any[]) => (arg: any) => arg is never;
    like: (sample: TypeguardMap) => <T_6>(arg: T_6) => arg is Exclude<T_6, GuardedWithMap<TypeguardMap<string>> extends T_6 ? T_6 & GuardedWithMap<TypeguardMap<string>> : never>;
    typed: <T_7 extends string | number>(type: T_7) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_7>>;
    match: <T_8 extends object>(sample: T_8) => <U extends T_8>(arg: U) => boolean;
    camelCase: <T_5>(arg: T_5 | Camelized<T_5, true>) => arg is Exclude<T_5, Camelized<T_5, true>> | Exclude<Camelized<T_5, true>, Camelized<T_5, true>>;
    anything: (arg: any) => false;
};
declare const aint: {
    undefined: (arg: any) => arg is any;
    void: (arg: any) => arg is any;
    null: (arg: any) => arg is any;
    nil: (arg: any) => arg is any;
    string: (arg: any) => arg is any;
    emptyString: (arg: any) => arg is any;
    number: (arg: any) => arg is any;
    zero: (arg: any) => arg is any;
    boolean: (arg: any) => arg is any;
    false: (arg: any) => arg is any;
    true: (arg: any) => arg is any;
    function: (arg: any) => arg is any;
    promise: (arg: any) => arg is any;
    object: (arg: any) => arg is any;
    array: (arg: unknown) => arg is unknown;
    regexp: (arg: any) => arg is any;
    itself: <T>(arg: T) => arg is Exclude<T, T>;
    primitive: (arg: any) => arg is any;
    jsonable: (arg: any) => arg is any;
    jsonableObject: (arg: any) => arg is any;
    defined: <T_1>(arg: T_1 | undefined) => arg is Exclude<undefined, T_1> | Exclude<T_1, T_1>;
    empty: <T_2 extends {
        length: number;
    }>(arg: T_2) => arg is Exclude<T_2, T_2 & {
        length: 0;
    }>;
    truthy: <T_3>(arg: false | "" | 0 | T_3 | null | undefined) => arg is Exclude<undefined, T_3> | Exclude<null, T_3> | Exclude<false, T_3> | Exclude<"", T_3> | Exclude<0, T_3> | Exclude<T_3, T_3>;
    falsy: <T_4>(arg: false | "" | 0 | T_4 | null | undefined) => arg is Exclude<T_4, false | "" | 0 | null | undefined>;
    exactly: <T_5>(sample: T_5) => (arg: any) => arg is Exclude<any, T_5>;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    among: (options: any[]) => (arg: any) => arg is never;
    like: (sample: TypeguardMap) => <T_6>(arg: T_6) => arg is Exclude<T_6, GuardedWithMap<TypeguardMap<string>> extends T_6 ? T_6 & GuardedWithMap<TypeguardMap<string>> : never>;
    typed: <T_7 extends string | number>(type: T_7) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_7>>;
    match: <T_8 extends object>(sample: T_8) => <U extends T_8>(arg: U) => boolean;
    camelCase: <T_5>(arg: T_5 | Camelized<T_5, true>) => arg is Exclude<T_5, Camelized<T_5, true>> | Exclude<Camelized<T_5, true>, Camelized<T_5, true>>;
    anything: (arg: any) => false;
};
declare const doesnt: {
    undefined: (arg: any) => arg is any;
    void: (arg: any) => arg is any;
    null: (arg: any) => arg is any;
    nil: (arg: any) => arg is any;
    string: (arg: any) => arg is any;
    emptyString: (arg: any) => arg is any;
    number: (arg: any) => arg is any;
    zero: (arg: any) => arg is any;
    boolean: (arg: any) => arg is any;
    false: (arg: any) => arg is any;
    true: (arg: any) => arg is any;
    function: (arg: any) => arg is any;
    promise: (arg: any) => arg is any;
    object: (arg: any) => arg is any;
    array: (arg: unknown) => arg is unknown;
    regexp: (arg: any) => arg is any;
    itself: <T>(arg: T) => arg is Exclude<T, T>;
    primitive: (arg: any) => arg is any;
    jsonable: (arg: any) => arg is any;
    jsonableObject: (arg: any) => arg is any;
    defined: <T_1>(arg: T_1 | undefined) => arg is Exclude<undefined, T_1> | Exclude<T_1, T_1>;
    empty: <T_2 extends {
        length: number;
    }>(arg: T_2) => arg is Exclude<T_2, T_2 & {
        length: 0;
    }>;
    truthy: <T_3>(arg: false | "" | 0 | T_3 | null | undefined) => arg is Exclude<undefined, T_3> | Exclude<null, T_3> | Exclude<false, T_3> | Exclude<"", T_3> | Exclude<0, T_3> | Exclude<T_3, T_3>;
    falsy: <T_4>(arg: false | "" | 0 | T_4 | null | undefined) => arg is Exclude<T_4, false | "" | 0 | null | undefined>;
    exactly: <T_5>(sample: T_5) => (arg: any) => arg is Exclude<any, T_5>;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    among: (options: any[]) => (arg: any) => arg is never;
    like: (sample: TypeguardMap) => <T_6>(arg: T_6) => arg is Exclude<T_6, GuardedWithMap<TypeguardMap<string>> extends T_6 ? T_6 & GuardedWithMap<TypeguardMap<string>> : never>;
    typed: <T_7 extends string | number>(type: T_7) => <O extends Typed<string | number>>(arg: O) => arg is Exclude<O, O & Typed<T_7>>;
    match: <T_8 extends object>(sample: T_8) => <U extends T_8>(arg: U) => boolean;
    camelCase: <T_5>(arg: T_5 | Camelized<T_5, true>) => arg is Exclude<T_5, Camelized<T_5, true>> | Exclude<Camelized<T_5, true>, Camelized<T_5, true>>;
    anything: (arg: any) => false;
};

declare function either<Arg, Guarded1 extends Arg, Guarded2 extends Arg>(typeguard1: Typeguard<Arg, Guarded1>, typeguard2: Typeguard<Arg, Guarded2>): Typeguard<Arg, Guarded1 | Guarded2>;
declare function either<Arg>(predicate1: NonTypeguard<Arg>, predicate2: NonTypeguard<Arg>): NonTypeguard<Arg>;

declare function everyItem<T>(typeguard: Typeguard<any, T>): Typeguard<any[], T[]>;
declare function everyItem<T>(arr: any[], typeguard: Typeguard<any, T>): arr is T[];

declare function has<T extends object, U extends {}>(source: Readonly<U>): (target: T) => target is T & U;

declare function isAmong<U extends readonly any[]>(options: U): (arg: any) => arg is U[number];

declare function isArray<T>(arg: any): arg is T[];
declare function isArray<T, U>(arg: T | U[]): arg is U[];
declare function isArray<T, U, V>(arg: T | U[] | V[]): arg is U[] | V[];

declare const isLike: typeof conformsToTypeguardMap;

declare function its<Key extends keyof Obj, Obj extends object>(key: Key): Transform<Obj, Obj[Key]>;
declare function its<Key extends keyof Obj, Guarded extends Obj[Key], Obj extends object>(key: Key, typeguard: Typeguard<Obj[Key], Guarded>): Typeguard<Obj, Obj & {
    [K in Key]: Guarded;
}>;
declare function its<Key extends keyof Obj, Obj extends object>(key: Key, predicate: NonTypeguard<Obj[Key]>): NonTypeguard<Obj>;
declare function its<Key extends keyof Obj, Value extends Obj[Key], Obj extends object>(key: Key, value: Value): Typeguard<Obj, Obj & {
    [K in Key]: Value;
}>;

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

declare function thisable<This, Args extends any[], Return>(fn: (own: This, ...args: Args) => Return): (this: This, ...args: Args) => Return;

declare function also<T>(value: T, handler: (value: T) => void): T;
declare function also<T>(handler: (value: T) => void): <U extends T>(value: U) => U;
declare function alsoLog(prefix: string, doLog?: boolean): <T>(value: T) => T;

declare function assignTo<T extends object, P extends keyof T>(object: T, property: P): <V extends T[P]>(value: V) => V;

declare function callIts<Key extends PropertyKey, Args extends any[]>(key: Key, ...args: Args): <Object extends Record<Key, (...args: Args) => any>>(object: Object) => ReturnType<Object[Key]>;
declare const please: typeof callIts;

declare function callWith<Args extends any[]>(...args: Args): <Fn extends (...args: Args) => T, T>(fn: Fn) => T;

declare function compileTimeError(item: never): never;
declare const shouldNotBe: typeof compileTimeError;

declare function getProp<Object extends object, Key extends keyof Object>(key: Key): (obj: Object) => Object[Key];

declare const commonTransforms: Aliasified<{
    itself: (<T>(arg: T) => T) & {
        if: <T_1, G extends T_1>(typeguard: (arg: T_1) => arg is G) => {
            else: (defaultValue: G) => (arg: T_1) => G;
        };
    };
    themselves: <T_2 extends any[]>(arrayArg: T_2) => T_2;
    $: typeof give$;
    undefined: (...args: any[]) => undefined;
    null: (...args: any[]) => null;
    true: (...args: any[]) => true;
    false: (...args: any[]) => false;
    booleanTrue: (...args: any[]) => boolean;
    booleanFalse: (...args: any[]) => boolean;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    zero: (...args: any[]) => 0;
    emptyString: (...args: any[]) => "";
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
    string: <T_3>(arg: T_3) => string;
    boolean: <T_4>(arg: T_4) => boolean;
    number: <T_5>(arg: T_5) => number;
    array: <T_6>(arg: T_6) => T_6[];
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
    first: <T_7>(arg: T_7[]) => T_7;
    last: <T_8>(arg: T_8[]) => T_8;
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    map: <Array_1 extends any[], TransformResult>(transform: (arg: Array_1 extends (infer Item)[] ? Item : never) => TransformResult) => (arg: Array_1) => TransformResult[];
    mapValues: <T_9, R>(transform: (arg: T_9) => R) => (arg: {
        [key: string]: T_9;
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
    itself: (<T>(arg: T) => T) & {
        if: <T_1, G extends T_1>(typeguard: (arg: T_1) => arg is G) => {
            else: (defaultValue: G) => (arg: T_1) => G;
        };
    };
    themselves: <T_2 extends any[]>(arrayArg: T_2) => T_2;
    $: typeof give$;
    undefined: (...args: any[]) => undefined;
    null: (...args: any[]) => null;
    true: (...args: any[]) => true;
    false: (...args: any[]) => false;
    booleanTrue: (...args: any[]) => boolean;
    booleanFalse: (...args: any[]) => boolean;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    zero: (...args: any[]) => 0;
    emptyString: (...args: any[]) => "";
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
    string: <T_3>(arg: T_3) => string;
    boolean: <T_4>(arg: T_4) => boolean;
    number: <T_5>(arg: T_5) => number;
    array: <T_6>(arg: T_6) => T_6[];
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
    first: <T_7>(arg: T_7[]) => T_7;
    last: <T_8>(arg: T_8[]) => T_8;
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    map: <Array_1 extends any[], TransformResult>(transform: (arg: Array_1 extends (infer Item)[] ? Item : never) => TransformResult) => (arg: Array_1) => TransformResult[];
    mapValues: <T_9, R>(transform: (arg: T_9) => R) => (arg: {
        [key: string]: T_9;
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
    itself: (<T>(arg: T) => T) & {
        if: <T_1, G extends T_1>(typeguard: (arg: T_1) => arg is G) => {
            else: (defaultValue: G) => (arg: T_1) => G;
        };
    };
    themselves: <T_2 extends any[]>(arrayArg: T_2) => T_2;
    $: typeof give$;
    undefined: (...args: any[]) => undefined;
    null: (...args: any[]) => null;
    true: (...args: any[]) => true;
    false: (...args: any[]) => false;
    booleanTrue: (...args: any[]) => boolean;
    booleanFalse: (...args: any[]) => boolean;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    zero: (...args: any[]) => 0;
    emptyString: (...args: any[]) => "";
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
    string: <T_3>(arg: T_3) => string;
    boolean: <T_4>(arg: T_4) => boolean;
    number: <T_5>(arg: T_5) => number;
    array: <T_6>(arg: T_6) => T_6[];
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
    first: <T_7>(arg: T_7[]) => T_7;
    last: <T_8>(arg: T_8[]) => T_8;
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    map: <Array_1 extends any[], TransformResult>(transform: (arg: Array_1 extends (infer Item)[] ? Item : never) => TransformResult) => (arg: Array_1) => TransformResult[];
    mapValues: <T_9, R>(transform: (arg: T_9) => R) => (arg: {
        [key: string]: T_9;
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
    itself: (<T>(arg: T) => T) & {
        if: <T_1, G extends T_1>(typeguard: (arg: T_1) => arg is G) => {
            else: (defaultValue: G) => (arg: T_1) => G;
        };
    };
    themselves: <T_2 extends any[]>(arrayArg: T_2) => T_2;
    $: typeof give$;
    undefined: (...args: any[]) => undefined;
    null: (...args: any[]) => null;
    true: (...args: any[]) => true;
    false: (...args: any[]) => false;
    booleanTrue: (...args: any[]) => boolean;
    booleanFalse: (...args: any[]) => boolean;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    zero: (...args: any[]) => 0;
    emptyString: (...args: any[]) => "";
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
    string: <T_3>(arg: T_3) => string;
    boolean: <T_4>(arg: T_4) => boolean;
    number: <T_5>(arg: T_5) => number;
    array: <T_6>(arg: T_6) => T_6[];
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
    first: <T_7>(arg: T_7[]) => T_7;
    last: <T_8>(arg: T_8[]) => T_8;
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    map: <Array_1 extends any[], TransformResult>(transform: (arg: Array_1 extends (infer Item)[] ? Item : never) => TransformResult) => (arg: Array_1) => TransformResult[];
    mapValues: <T_9, R>(transform: (arg: T_9) => R) => (arg: {
        [key: string]: T_9;
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

declare const itself: (<T>(arg: T) => T) & {
    if: <T_1, G extends T_1>(typeguard: (arg: T_1) => arg is G) => {
        else: (defaultValue: G) => (arg: T_1) => G;
    };
};

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

declare function ifGeneric<T>(value: T): {
    <G, U, V>(typeguard: (value: T) => value is T & G, ifTrue: (value: G) => U, ifFalse: (value: Exclude<T, G>) => V): T extends G ? U : V;
    <G_1 extends T, U_1, V_1>(typeguard: (value: T) => value is G_1, ifTrue: (value: G_1) => U_1, ifFalse: (value: Exclude<T, G_1>) => V_1): T extends G_1 ? U_1 : V_1;
};

declare function jsObjectString(obj: JsonableObject): string;

declare function jsonClone<T>(obj: T): T & Jsonable;
declare function jsonEqual<T>(a: T, b: T): boolean;
declare function isJsonable(obj: any): obj is Jsonable;
declare function isJsonableObject(obj: any): obj is JsonableObject;

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

declare function mapKeysDeep(obj: Record<string, any>, fn: (key: string) => string): Record<string, any>;

type Merge<Target extends object | ((...args: any[]) => any), Source extends object> = {
    [K in keyof Target | keyof Source]: K extends keyof Target ? K extends keyof Source ? Target[K] extends object ? Source[K] extends object ? Merge<Target[K], Source[K]> : never : never : Target[K] : K extends keyof Source ? Source[K] : never;
} & (Target extends ((...args: infer Args) => infer Returns) ? (...args: Args) => Returns : {});
declare function merge<Target extends object, Source extends object>(target: Target, getSource: (target: Target) => Source): Merge<Target, Source>;
declare function merge<Target extends object, Source extends object>(target: Target, source: Source): Merge<Target, Source>;
declare function merge<Target extends object, Source1 extends object, Source2 extends object>(target: Target, getSource1: (target: Target) => Source1, getSource2: (mergedTarget: Merge<Target, Source1>) => Source2): Merge<Merge<Target, Source1>, Source2>;
declare function merge<Target extends object, Source1 extends object, Source2 extends object>(target: Target, source1: Source1, source2: Source2): Merge<Merge<Target, Source1>, Source2>;

type Class<T = {}, Args extends any[] = any[]> = new (...args: Args) => T;
declare class MixinBuilder<Base, Args extends any[]> {
    private Base;
    constructor(Base: Class<Base, Args>);
    mixin<Mixin>(MixinFactory: (BaseClass: Class<Base, Args>) => Class<Mixin, Args>): MixinBuilder<Base & Mixin, Args>;
    create(...args: Args): Base;
}
declare function mixinable<Base, Args extends any[]>(BaseClass: Class<Base, Args>): MixinBuilder<Base, Args>;

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

declare function objectWithKeys<Key extends string, ReturnType>(keys: Key[] | readonly Key[], initializer: (key: Key) => ReturnType): { [key in Key]: ReturnType; };

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

export { $as, $do, $if, $throw, $thrower, $try, $with, AliasedKeys, AliasesDefinition, AliasesFor, Aliasified, Camelized, ChainableKeys, ChainableTypes, Chainified, CheckKind, CheckState, Class, Client, Color, ColorMap, CommonPredicateMap, CommonPredicateName, CommonPredicates, CommonTransformKey, CommonTransforms, CouldBeNullOrUndefined, CreateEnvOptions, CreateEnvResult, Dict, EnsurePropertyOptions, Evaluate, FunctionThatReturns, GenericTypeguard, GroupListener, GuardedWithMap, Handler, INpmLsOutput, IViteConfig, Index, IteratorArgs, Jsonable, JsonableNonArray, JsonableObject, KeyOfJsonable, KindOf, Listener, Log, LogFunction, LogIndices, LogOptions, LoggerInfo, MapForType, Merge, MethodKey, MixinBuilder, Narrowed, NonTypeguard, Not, NpmLink, Paint, Painter, ParametricHandler, ParseSwitchOutput, ParseTransformOutput, PipedFunctions, PossiblySerializedLogFunction, Predicate, PredicateOutput, Primitive, PromiseHandlers, PushToStackOutput, Resolvable, ResolvableConfig, SerializeAs, ShiftDirection, StrictlyPartial, StringKey, Transform, TransformResult, Typed, Typeguard, TypeguardMap, UnixTimestamp, addProperties, aint, aliasify, also, alsoLog, ansiColors, ansiPrefixes, any, assert, assign, assignTo, both, callIts, callWith, camelize, chainified, check, coloredEmojis, commonPredicates, commonTransforms, compileTimeError, conformsToTypeguardMap, createEnv, doWith, does, doesnt, download, downloadAsStream, either, ensure, ensureProperty, envCase, envKeys, evaluate, every, everyItem, forEach, forceUpdateNpmLinks, functionThatReturns, genericTypeguard, getHeapUsedMB, getNpmLinks, getProp, give, give$, go, groupListeners, has, humanize, ifGeneric, is, isAmong, isArray, isCamelCase, isExactly, isFunction, isInstanceOf, isJsonable, isJsonableObject, isKindOf, isLike, isPrimitive, isTyped, isTypeguardMap, isnt, its, itself, jsObjectString, jsonClone, jsonEqual, labelize, lazily, logger, loggerInfo, map, mapKeysDeep, merge, meta, mixinable, mutate, not, objectWithKeys, paint, parseSwitch, parseTransform, pipe, please, pushToStack, respectively, serializable, serialize, serializer, setLastLogIndex, setReliableTimeout, shift, shiftTo, shouldNotBe, thisable, to, toType, transform, tuple, unEnvCase, unEnvKeys, undefinedIfFalsey, viteConfigForNpmLinks, withLogFile, wrap };
