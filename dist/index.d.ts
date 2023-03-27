import fs from 'fs';

type Merge<Target extends object | ((...args: any[]) => any), Source extends object> = {
    [K in keyof Target | keyof Source]: K extends keyof Target ? K extends keyof Source ? Target[K] extends object ? Source[K] extends object ? Merge<Target[K], Source[K]> : never : never : Target[K] : K extends keyof Source ? Source[K] : never;
} & (Target extends ((...args: infer Args) => infer Returns) ? (...args: Args) => Returns : {});
declare function merge<Target extends object, Source extends object>(target: Target, getSource: (target: Target) => Source): Merge<Target, Source>;
declare function merge<Target extends object, Source extends object>(target: Target, source: Source): Merge<Target, Source>;
declare function merge<Target extends object, Source1 extends object, Source2 extends object>(target: Target, getSource1: (target: Target) => Source1, getSource2: (mergedTarget: Merge<Target, Source1>) => Source2): Merge<Merge<Target, Source1>, Source2>;
declare function merge<Target extends object, Source1 extends object, Source2 extends object>(target: Target, source1: Source1, source2: Source2): Merge<Merge<Target, Source1>, Source2>;

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
type Aliasified<Object extends Record<string, any>, Definition extends AliasesDefinition<keyof Object>> = Merge<Object, AliasesFor<Object, Definition>>;
declare function aliasify<Object extends Record<string, any>, Definition extends AliasesDefinition<keyof Object>>(object: Object, aliasesDefinition: Definition): Aliasified<Object, Definition>;

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

declare function $throw<T extends Error>(error: T): never;
declare function $throw(message: string): never;
declare function $throw<T extends Error>(errorOrMessage: T | string): never;
declare function $thrower<T extends Error>(errorOrMessage: T | string): FunctionThatReturns<never>;

declare function $try<T>(fn: () => T, fallbackValue: T, finallyCallback?: () => void): T;
declare function $try<T>(fn: () => T, fallback: (error?: Error) => T, finallyCallback?: () => void): T;

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
declare function check<Argument>(argument: Argument): ParseSwitchOutput<'first', true, Argument, Argument, never>;
declare const transform: typeof check;
declare function $if<Argument, Guarded extends Argument, TransformResult>(argument: Argument, typeguard: Typeguard<Argument, Guarded>, transform: Transform<Guarded, TransformResult>): PushToStackOutput<'first', true, Argument, Exclude<Argument, Guarded>, TransformResult, never>;
declare function $if<Argument, TransformResult>(argument: Argument, predicate: NonTypeguard<Argument>, transform: Transform<Argument, TransformResult>): PushToStackOutput<'first', true, Argument, Argument, TransformResult, never>;

declare function lazily<Function extends (...args: any[]) => any>(func: Function, ...args: Parameters<Function>): () => ReturnType<Function>;
declare function lazily<Function extends (...args: any[]) => any>(func: Function): (...args: Parameters<Function>) => () => ReturnType<Function>;

declare const commonPredicates: {
    undefined: <T>(arg: T | undefined) => arg is undefined;
    null: <T_1>(arg: T_1 | null) => arg is null;
    string: <T_2>(arg: string | T_2) => arg is string;
    emptyString: <T_3>(arg: "" | T_3) => arg is "";
    number: <T_4>(arg: number | T_4) => arg is number;
    zero: <T_5>(arg: 0 | T_5) => arg is 0;
    boolean: <T_6>(arg: boolean | T_6) => arg is boolean;
    false: <T_7>(arg: false | T_7) => arg is false;
    true: <T_8>(arg: true | T_8) => arg is true;
    function: <T_9>(arg: T_9 | ((...args: any[]) => any)) => arg is (...args: any[]) => any;
    object: <T_10>(arg: object | T_10) => arg is object;
    array: <T_11>(arg: any[] | T_11) => arg is any[];
    primitive: <T_12>(arg: Primitive | T_12) => arg is Primitive;
    jsonable: <T_13>(arg: Jsonable | T_13) => arg is Jsonable;
    jsonableObject: <T_14>(arg: JsonableObject | T_14) => arg is JsonableObject;
    defined: <T_15>(arg: T_15 | undefined) => arg is T_15;
    empty: <T_16 extends {
        length: number;
    }>(arg: T_16) => arg is T_16 & {
        length: 0;
    };
    truthy: <T_17>(arg: false | "" | 0 | T_17 | null | undefined) => arg is T_17;
    falsy: <T_18>(arg: false | "" | 0 | T_18 | null | undefined) => arg is false | "" | 0 | null | undefined;
    exactly: <T_19>(sample: T_19) => (arg: T_19) => boolean;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    like: <T_20 extends object, U extends object>(sample: U) => (arg: T_20) => arg is T_20 & U;
    anything: (...args: any[]) => true;
};
type CommonPredicates = typeof commonPredicates;
type CommonPredicateName = keyof CommonPredicates;
type CommonPredicateMap = {
    [K in CommonPredicateName]: any;
};
declare const is: {
    not: {
        undefined: <T>(arg: T | undefined) => arg is Exclude<T, undefined>;
        null: <T_1>(arg: T_1 | null) => arg is Exclude<T_1, null>;
        string: <T_2>(arg: string | T_2) => arg is Exclude<T_2, string>;
        emptyString: <T_3>(arg: "" | T_3) => arg is Exclude<T_3, "">;
        number: <T_4>(arg: number | T_4) => arg is Exclude<T_4, number>;
        zero: <T_5>(arg: 0 | T_5) => arg is Exclude<T_5, 0>;
        boolean: <T_6>(arg: boolean | T_6) => arg is Exclude<T_6, boolean>;
        false: <T_7>(arg: false | T_7) => arg is Exclude<T_7, false>;
        true: <T_8>(arg: true | T_8) => arg is Exclude<T_8, true>;
        function: <T_9>(arg: T_9 | ((...args: any[]) => any)) => arg is Exclude<T_9, (...args: any[]) => any>;
        object: <T_10>(arg: object | T_10) => arg is Exclude<T_10, object>;
        array: <T_11>(arg: any[] | T_11) => arg is Exclude<T_11, any[]>;
        primitive: <T_12>(arg: Primitive | T_12) => arg is Exclude<T_12, Primitive>;
        jsonable: <T_13>(arg: Jsonable | T_13) => arg is Exclude<T_13, Jsonable>;
        jsonableObject: <T_14>(arg: JsonableObject | T_14) => arg is Exclude<T_14, JsonableObject>;
        defined: <T_15>(arg: T_15 | undefined) => arg is Exclude<undefined, T_15> | Exclude<T_15, T_15>;
        empty: <T_16 extends {
            length: number;
        }>(arg: T_16) => arg is Exclude<T_16, T_16 & {
            length: 0;
        }>;
        truthy: <T_17>(arg: false | "" | 0 | T_17 | null | undefined) => arg is Exclude<undefined, T_17> | Exclude<null, T_17> | Exclude<false, T_17> | Exclude<"", T_17> | Exclude<0, T_17> | Exclude<T_17, T_17>;
        falsy: <T_18>(arg: false | "" | 0 | T_18 | null | undefined) => arg is Exclude<T_18, false | "" | 0 | null | undefined>;
        exactly: <T_19>(sample: T_19) => (arg: T_19) => boolean;
        above: (sample: number) => (arg: number) => boolean;
        below: (sample: number) => (arg: number) => boolean;
        atLeast: (sample: number) => (arg: number) => boolean;
        atMost: (sample: number) => (arg: number) => boolean;
        like: <U extends object>(sample: U) => (arg: object) => arg is Exclude<object, object & U>;
        anything: (arg: any) => false;
    };
    undefined: <T>(arg: T | undefined) => arg is undefined;
    null: <T_1>(arg: T_1 | null) => arg is null;
    string: <T_2>(arg: string | T_2) => arg is string;
    emptyString: <T_3>(arg: "" | T_3) => arg is "";
    number: <T_4>(arg: number | T_4) => arg is number;
    zero: <T_5>(arg: 0 | T_5) => arg is 0;
    boolean: <T_6>(arg: boolean | T_6) => arg is boolean;
    false: <T_7>(arg: false | T_7) => arg is false;
    true: <T_8>(arg: true | T_8) => arg is true;
    function: <T_9>(arg: T_9 | ((...args: any[]) => any)) => arg is (...args: any[]) => any;
    object: <T_10>(arg: object | T_10) => arg is object;
    array: <T_11>(arg: any[] | T_11) => arg is any[];
    primitive: <T_12>(arg: Primitive | T_12) => arg is Primitive;
    jsonable: <T_13>(arg: Jsonable | T_13) => arg is Jsonable;
    jsonableObject: <T_14>(arg: JsonableObject | T_14) => arg is JsonableObject;
    defined: <T_15>(arg: T_15 | undefined) => arg is T_15;
    empty: <T_16 extends {
        length: number;
    }>(arg: T_16) => arg is T_16 & {
        length: 0;
    };
    truthy: <T_17>(arg: false | "" | 0 | T_17 | null | undefined) => arg is T_17;
    falsy: <T_18>(arg: false | "" | 0 | T_18 | null | undefined) => arg is false | "" | 0 | null | undefined;
    exactly: <T_19>(sample: T_19) => (arg: T_19) => boolean;
    above: (sample: number) => (arg: number) => boolean;
    below: (sample: number) => (arg: number) => boolean;
    atLeast: (sample: number) => (arg: number) => boolean;
    atMost: (sample: number) => (arg: number) => boolean;
    like: <T_20 extends object, U extends object>(sample: U) => (arg: T_20) => arg is T_20 & U;
    anything: (...args: any[]) => true;
};

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

declare function getProp<T extends object>(key: keyof T): (obj: T) => T[keyof T];

declare function compileTimeError(item: never): never;

declare const give: {
    "": (...args: any[]) => "";
    string: (arg: any) => string;
    undefined: (...args: any[]) => undefined;
    map: <T, R>(transform: (arg: T) => R) => (arg: T[]) => R[];
    keys: (arg: object) => string[];
    first: <T_1>(arg: T_1[]) => T_1;
    last: <T_2>(arg: T_2[]) => T_2;
    null: (...args: any[]) => null;
    emptyString: (...args: any[]) => "";
    zero: (...args: any[]) => 0;
    false: (...args: any[]) => false;
    true: (...args: any[]) => true;
    array: <T_3>(arg: T_3) => T_3[];
    exactly: typeof $;
    itself: <T_4>(arg: T_4) => T_4;
    themselves: <T_5 extends any[]>(arrayArg: T_5) => T_5;
    $: typeof $;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
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
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    0: (...args: any[]) => 0;
    value: typeof $;
    literal: typeof $;
    nan: (...args: any[]) => number;
    notANumber: (...args: any[]) => number;
    infinity: (...args: any[]) => number;
    JSON: (arg: Jsonable) => string;
    YAML: (arg: Jsonable) => string;
    unjson: (arg: string) => Jsonable;
    unJSON: (arg: string) => Jsonable;
    parsedJSON: (arg: string) => Jsonable;
    unyaml: (arg: string) => Jsonable;
    unYAML: (arg: string) => Jsonable;
    parsedYAML: (arg: string) => Jsonable;
    lowercase: (arg: string) => string;
    UPPERCASE: (arg: string) => string;
    ALLCAPS: (arg: string) => string;
    snake_case: (arg: string) => string;
    "kebab-case": (arg: string) => string;
    "Start Case": (arg: string) => string;
    firstItem: <T_1>(arg: T_1[]) => T_1;
    head: <T_1>(arg: T_1[]) => T_1;
    lastItem: <T_2>(arg: T_2[]) => T_2;
    tail: <T_2>(arg: T_2[]) => T_2;
};
declare const to: {
    "": (...args: any[]) => "";
    string: (arg: any) => string;
    undefined: (...args: any[]) => undefined;
    map: <T, R>(transform: (arg: T) => R) => (arg: T[]) => R[];
    keys: (arg: object) => string[];
    first: <T_1>(arg: T_1[]) => T_1;
    last: <T_2>(arg: T_2[]) => T_2;
    null: (...args: any[]) => null;
    emptyString: (...args: any[]) => "";
    zero: (...args: any[]) => 0;
    false: (...args: any[]) => false;
    true: (...args: any[]) => true;
    array: <T_3>(arg: T_3) => T_3[];
    exactly: typeof $;
    itself: <T_4>(arg: T_4) => T_4;
    themselves: <T_5 extends any[]>(arrayArg: T_5) => T_5;
    $: typeof $;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
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
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    0: (...args: any[]) => 0;
    value: typeof $;
    literal: typeof $;
    nan: (...args: any[]) => number;
    notANumber: (...args: any[]) => number;
    infinity: (...args: any[]) => number;
    JSON: (arg: Jsonable) => string;
    YAML: (arg: Jsonable) => string;
    unjson: (arg: string) => Jsonable;
    unJSON: (arg: string) => Jsonable;
    parsedJSON: (arg: string) => Jsonable;
    unyaml: (arg: string) => Jsonable;
    unYAML: (arg: string) => Jsonable;
    parsedYAML: (arg: string) => Jsonable;
    lowercase: (arg: string) => string;
    UPPERCASE: (arg: string) => string;
    ALLCAPS: (arg: string) => string;
    snake_case: (arg: string) => string;
    "kebab-case": (arg: string) => string;
    "Start Case": (arg: string) => string;
    firstItem: <T_1>(arg: T_1[]) => T_1;
    head: <T_1>(arg: T_1[]) => T_1;
    lastItem: <T_2>(arg: T_2[]) => T_2;
    tail: <T_2>(arg: T_2[]) => T_2;
};
declare const get: {
    "": (...args: any[]) => "";
    string: (arg: any) => string;
    undefined: (...args: any[]) => undefined;
    map: <T, R>(transform: (arg: T) => R) => (arg: T[]) => R[];
    keys: (arg: object) => string[];
    first: <T_1>(arg: T_1[]) => T_1;
    last: <T_2>(arg: T_2[]) => T_2;
    null: (...args: any[]) => null;
    emptyString: (...args: any[]) => "";
    zero: (...args: any[]) => 0;
    false: (...args: any[]) => false;
    true: (...args: any[]) => true;
    array: <T_3>(arg: T_3) => T_3[];
    exactly: typeof $;
    itself: <T_4>(arg: T_4) => T_4;
    themselves: <T_5 extends any[]>(arrayArg: T_5) => T_5;
    $: typeof $;
    NaN: (...args: any[]) => number;
    Infinity: (...args: any[]) => number;
    emptyArray: (...args: any[]) => readonly [];
    emptyObject: (...args: any[]) => {};
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
    prop: typeof getProp;
    compileTimeError: typeof compileTimeError;
    error: typeof $thrower;
    0: (...args: any[]) => 0;
    value: typeof $;
    literal: typeof $;
    nan: (...args: any[]) => number;
    notANumber: (...args: any[]) => number;
    infinity: (...args: any[]) => number;
    JSON: (arg: Jsonable) => string;
    YAML: (arg: Jsonable) => string;
    unjson: (arg: string) => Jsonable;
    unJSON: (arg: string) => Jsonable;
    parsedJSON: (arg: string) => Jsonable;
    unyaml: (arg: string) => Jsonable;
    unYAML: (arg: string) => Jsonable;
    parsedYAML: (arg: string) => Jsonable;
    lowercase: (arg: string) => string;
    UPPERCASE: (arg: string) => string;
    ALLCAPS: (arg: string) => string;
    snake_case: (arg: string) => string;
    "kebab-case": (arg: string) => string;
    "Start Case": (arg: string) => string;
    firstItem: <T_1>(arg: T_1[]) => T_1;
    head: <T_1>(arg: T_1[]) => T_1;
    lastItem: <T_2>(arg: T_2[]) => T_2;
    tail: <T_2>(arg: T_2[]) => T_2;
};
type CommonTransforms = typeof give;
type CommonTransformKey = keyof CommonTransforms;
declare function $<T>(arg: T): (...args: any[]) => T;

declare function wrap<Function extends (arg1: any, arg2: any) => any>(fn: Function, arg2: Parameters<Function>[1]): (target: Parameters<Function>[0]) => ReturnType<Function>;
declare function wrap<Function extends (arg1: any, arg2: any, arg3: any) => any>(fn: Function, arg2: Parameters<Function>[1], arg3: Parameters<Function>[2]): (target: Parameters<Function>[0]) => ReturnType<Function>;

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

declare function download(url: string, filename?: string): Promise<string>;
declare function downloadAsStream(url: string): Promise<fs.ReadStream>;

declare function ensure<T>(x: T | undefined | null, variableName?: string): T;
declare function assert<T>(x: T | undefined | null, variableName?: string): asserts x is T;
interface EnsurePropertyOptions {
    requiredType?: string;
    validate?: (value: any) => boolean;
    messageIfInvalid?: string;
}
declare function ensureProperty<Result, Container = any>(obj: Container, key: string, optionsOrMessageIfInvalid?: EnsurePropertyOptions | string): Result;

type GoRecurse<TReturn, TArg> = (arg: TArg) => TReturn;
type GoCallback<TReturn, TArg> = (arg: TArg, recurse: GoRecurse<TReturn, TArg>) => TReturn;
declare function go<TReturn, TArg>(callback: GoCallback<TReturn, TArg>, arg: TArg): TReturn;
declare function goer<TReturn, TArg>(callback: GoCallback<TReturn, TArg>): GoRecurse<TReturn, TArg>;

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
declare const ansiColors: Color[];
declare const paint: Paint;
type LoggerInfo = {
    lastLogIndex: number;
    logAll?: boolean;
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
declare function logger(index?: number | 'always', defaultColor?: Color, defaultSerializeAs?: SerializeAs): Log;
declare function logger(index?: number | 'always', defaultOptions?: LogOptions, addAlways?: boolean): Log;

declare function jsonClone<T>(obj: T): T & Jsonable;
declare function jsonEqual<T>(a: T, b: T): boolean;
declare function isJsonable(obj: any): obj is Jsonable;
declare function isJsonableObject(obj: any): obj is JsonableObject;

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

interface NewResolvableArgs<T> {
    previousResolved?: UnixTimestamp;
    startResolved?: boolean;
    startResolvedWith?: T;
}
declare class Resolvable<T = void> {
    inProgress: boolean;
    _resolve: (value?: T | PromiseLike<T>) => void;
    _reject: (reason?: any) => void;
    promise: Promise<T>;
    previousResolved: UnixTimestamp | undefined;
    constructor({ previousResolved, startResolved, startResolvedWith }?: NewResolvableArgs<T>);
    resolve(value?: T | PromiseLike<T>): void;
    reject(reason?: any): void;
    reset(value?: T | PromiseLike<T>): void;
}

type HasType<T extends string | number> = {
    type: T;
};
type Typed<O extends object, T extends string | number> = O & HasType<T>;
declare function toType<T extends string | number>(type: T): <O extends object>(object: O) => Typed<O, T>;
declare function isTyped<T extends string | number>(type: T): <O extends object>(object: O) => object is Typed<O, T>;

export { $, $as, $if, $throw, $thrower, $try, AliasedKeys, AliasesDefinition, AliasesFor, Aliasified, ChainableKeys, ChainableTypes, Chainified, CheckKind, CheckState, Color, ColorMap, CommonPredicateMap, CommonPredicateName, CommonPredicates, CommonTransformKey, CommonTransforms, CreateEnvOptions, CreateEnvResult, Dict, EnsurePropertyOptions, Evaluate, FunctionThatReturns, GoCallback, GoRecurse, HasType, INpmLsOutput, IViteConfig, Jsonable, JsonableNonArray, JsonableObject, Log, LogFunction, LogOptions, LoggerInfo, Merge, NewResolvableArgs, Not, NpmLink, Paint, Painter, ParseSwitchOutput, ParseTransformOutput, PossiblySerializedLogFunction, Primitive, PushToStackOutput, Resolvable, SerializeAs, Typed, UnixTimestamp, aliasify, ansiColors, ansiPrefixes, assert, assign, chainified, check, commonPredicates, createEnv, doWith, download, downloadAsStream, ensure, ensureProperty, envCase, envKeys, evaluate, forceUpdateNpmLinks, functionThatReturns, get, getNpmLinks, getProp, give, go, goer, has, humanize, is, isJsonable, isJsonableObject, isPrimitive, isTyped, jsObjectString, jsonClone, jsonEqual, labelize, lazily, logger, loggerInfo, merge, not, paint, parseSwitch, parseTransform, pushToStack, respectively, serializer, setLastLogIndex, to, toType, transform, unEnvCase, unEnvKeys, viteConfigForNpmLinks, wrap };
