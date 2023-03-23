import fs from 'fs';

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

declare const fetchWith: Chainified<typeof fetch, 1, ("method" | "headers" | "body")[]>;
declare const get: ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) & Chainified<typeof fetch, 1, ("method" | "headers" | "body")[]>;
declare const post: ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) & Chainified<typeof fetch, 1, ("method" | "headers" | "body")[]>;
declare const postJson: (body: Jsonable) => ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) & Chainified<typeof fetch, 1, ("method" | "headers" | "body")[]>;
declare const authorizedFetch: (Authorization: string) => ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) & Chainified<typeof fetch, 1, ("method" | "headers" | "body")[]>;
type ChainableKeys<Function extends (...args: any[]) => any, ChainedParameterIndex extends number> = (keyof NonNullable<Parameters<Function>[ChainedParameterIndex]>);
type ChainableTypes<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]> = Pick<NonNullable<Parameters<Function>[ChainedParameterIndex]>, ChainedKeys[number]>;
type Chainified<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]> = {
    [Key in ChainedKeys[number]]: (value: ChainableTypes<Function, ChainedParameterIndex, [Key]>[Key]) => ((...args: Parameters<Function>) => ReturnType<Function>) & Chainified<Function, ChainedParameterIndex, Exclude<ChainedKeys, Key>>;
};
declare function chainified<Function extends (...args: any[]) => any, ChainedParameterIndex extends number, ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[]>($function: Function, chainedParameterIndex: ChainedParameterIndex, chainedKeys: ChainedKeys): Chainified<Function, ChainedParameterIndex, ChainedKeys>;

declare function getItemNames(itemStringOrArrayOrObject: string | string[] | Record<string, any>): string[];
type Typeguard<BroadType, NarrowType extends BroadType> = ((arg: BroadType) => arg is NarrowType) | ((arg: any) => arg is NarrowType);
type TypeguardOrType<BroadType, NarrowType extends BroadType> = Typeguard<BroadType, NarrowType> | NarrowType;
type BroadType<TG extends TypeguardOrType<any, any>> = TG extends Typeguard<infer BroadType, any> ? BroadType : any;
type NarrowType<TG extends TypeguardOrType<any, any>> = TG extends Typeguard<any, infer NarrowType> ? NarrowType : TG;
type Transform<Arg, Result> = (arg: Arg) => Result;
type SwitchWithArg<Arg, Result> = {
    if<TypedArg extends Arg, IfResult>(typeguard: ((arg: Arg) => arg is TypedArg), transform: (arg: TypedArg) => IfResult): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>;
    if<TypedArg extends Arg, IfResult>(typeguard: ((arg: any) => arg is TypedArg), transform: (arg: TypedArg) => IfResult): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>;
    if<TypedArg extends Arg, IfResult>(type: TypedArg, transform: (arg: TypedArg) => IfResult): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>;
    else<ElseResult>(transform: (arg: Arg) => ElseResult): Result | ElseResult;
};
type SwitchWithCondition<Result> = {
    if<IfResult>(condition: boolean, transform: () => IfResult): SwitchWithCondition<Result | IfResult>;
    else<ElseResult>(transform: () => ElseResult): ElseResult | Result;
};
type Switch<Arg, Result, ConditionBased extends boolean> = ConditionBased extends true ? SwitchWithCondition<Result> : SwitchWithArg<Arg, Result>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, typeguard: (arg: Arg) => arg is TypedArg, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult, false>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, typeguard: (arg: any) => arg is TypedArg, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult, false>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, typeguard: (arg: any) => arg is TypedArg, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult, false>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, type: TypedArg, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult, false>;
declare function $if<Result>(condition: boolean, transform: () => Result): Switch<never, Result, true>;
declare function check<Arg, Result = never>(arg: Arg): Switch<Arg, Result, false>;
declare function isDefined<T>(value: T | undefined): value is T;
declare function $<T>(value: T): (...args: any[]) => T;
declare function itself<T>(value: T): T;
declare function themselves<T extends any[]>(values: T): T;
declare function guard<BroadType, NarrowType extends BroadType>(checker: (value: BroadType) => boolean): (value: BroadType) => value is NarrowType;
declare function is<BroadType, NarrowType extends BroadType>(valueToCheck: BroadType): Typeguard<BroadType, NarrowType>;
declare function map<Item, Result>(transform: Transform<Item, Result>): (items: Item[]) => Result[];

declare function has<T extends object, U extends {}>(source: Readonly<U>): (target: T) => target is T & U;

declare function lazily<Function extends (...args: any[]) => any>(func: Function, ...args: Parameters<Function>): () => ReturnType<Function>;
declare function lazily<Function extends (...args: any[]) => any>(func: Function): (...args: Parameters<Function>) => () => ReturnType<Function>;

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

declare function shouldNotBe(item: never): never;

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

export { $, $as, $if, $throw, $thrower, $try, BroadType, ChainableKeys, ChainableTypes, Chainified, Color, ColorMap, CreateEnvOptions, CreateEnvResult, Dict, EnsurePropertyOptions, FunctionThatReturns, GoCallback, GoRecurse, HasType, INpmLsOutput, IViteConfig, Jsonable, JsonableNonArray, JsonableObject, Log, LogFunction, LogOptions, LoggerInfo, Merge, NarrowType, NewResolvableArgs, NpmLink, Paint, Painter, PossiblySerializedLogFunction, Primitive, Resolvable, SerializeAs, Switch, SwitchWithArg, SwitchWithCondition, Transform, Typed, Typeguard, TypeguardOrType, UnixTimestamp, ansiColors, ansiPrefixes, assert, assign, authorizedFetch, chainified, check, createEnv, doWith, download, downloadAsStream, ensure, ensureProperty, envCase, envKeys, fetchWith, forceUpdateNpmLinks, functionThatReturns, get, getItemNames, getNpmLinks, go, goer, guard, has, humanize, is, isDefined, isJsonable, isJsonableObject, isPrimitive, isTyped, itself, jsObjectString, jsonClone, jsonEqual, labelize, lazily, logger, loggerInfo, map, merge, paint, post, postJson, respectively, serializer, setLastLogIndex, shouldNotBe, themselves, toType, unEnvCase, unEnvKeys, viteConfigForNpmLinks, wrap };
