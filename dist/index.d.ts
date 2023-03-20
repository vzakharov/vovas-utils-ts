import fs from 'fs';

declare function getItemNames(itemStringOrArrayOrObject: string | string[] | Record<string, any>): string[];
type Typeguard<Arg, TypedArg extends Arg> = ((arg: Arg) => arg is TypedArg) | ((arg: any) => arg is TypedArg);
type TypeguardOrType<Arg, TypedArg extends Arg> = Typeguard<Arg, TypedArg> | TypedArg;
type Transform<Arg, Result> = (arg: Arg) => Result;
type SwitchWithArg<Arg, Result> = {
    if<TypedArg extends Arg, IfResult>(typeguard: ((arg: Arg) => arg is TypedArg), transform: (arg: TypedArg) => IfResult): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>;
    if<TypedArg extends Arg, IfResult>(typeguard: ((arg: any) => arg is TypedArg), transform: (arg: TypedArg) => IfResult): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>;
    if<TypedArg extends Arg, IfResult>(type: TypedArg, transform: (arg: TypedArg) => IfResult): Switch<Exclude<Arg, TypedArg>, Result | IfResult, false>;
    else(transform: (arg: Arg) => Result): Result;
};
type SwitchWithCondition<Result> = {
    if: <Result>(condition: boolean, transform: () => Result) => SwitchWithCondition<Result>;
    else(transform: () => Result): Result;
};
type Switch<Arg, Result, ConditionBased extends boolean> = ConditionBased extends true ? SwitchWithCondition<Result> : SwitchWithArg<Arg, Result>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, typeguard: (arg: Arg) => arg is TypedArg, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult, false>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, typeguard: (arg: any) => arg is TypedArg, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult, false>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, typeguard: (arg: any) => arg is TypedArg, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult, false>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, type: TypedArg, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult, false>;
declare function $if<Result>(condition: boolean, transform: () => Result): Switch<never, Result, true>;
declare function $switch<Arg, Result = never>(arg: Arg): Switch<Arg, Result, false>;
declare function isDefined<T>(value: T | undefined): value is T;
declare function $<T>(value: T): (...args: any[]) => T;
declare function guard<BroadType, NarrowType extends BroadType>(checker: (value: BroadType) => boolean): (value: BroadType) => value is NarrowType;
declare function is<BroadType, NarrowType extends BroadType>(valueToCheck: BroadType): Typeguard<BroadType, NarrowType>;
declare function map<Item, Result>(transform: Transform<Item, Result>): (items: Item[]) => Result[];

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
type Return<F> = F extends (...args: any[]) => infer R ? R : never;
type Arg<F> = F extends (arg: infer Arg, ...args: any[]) => any ? Arg : never;
type Arg2<F> = F extends (arg: any, arg2: infer Arg2, ...args: any[]) => any ? Arg2 : never;
type Arg3<F> = F extends (arg: any, arg2: any, arg3: infer Arg3, ...args: any[]) => any ? Arg3 : never;
type Arg4<F> = F extends (arg: any, arg2: any, arg3: any, arg4: infer Arg4, ...args: any[]) => any ? Arg4 : never;
type Arg5<F> = F extends (arg: any, arg2: any, arg3: any, arg4: any, arg5: infer Arg5, ...args: any[]) => any ? Arg5 : never;
declare function $as<AsWhat>(what: any): AsWhat;
declare function $as<AsWhat>(what: FunctionThatReturns<any>): FunctionThatReturns<AsWhat>;

declare function $throw<T extends Error>(error: T): never;
declare function $throw(message: string): never;
declare function $throw<T extends Error>(errorOrMessage: T | string): never;
declare function $thrower<T extends Error>(errorOrMessage: T | string): FunctionThatReturns<never>;

declare function $try<T>(fn: () => T, fallbackValue: T, finallyCallback?: () => void): T;
declare function $try<T>(fn: () => T, fallback: (error?: Error) => T, finallyCallback?: () => void): T;

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

declare function reverseArgs<Func extends (arg: any, arg2: any) => any>(func: Func): (arg2: Arg2<Func>, arg: Arg<Func>) => Return<Func>;
declare function reverseArgs<Func extends (arg: any, arg2: any, arg3: any) => any>(func: Func): (arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func>) => Return<Func>;
declare function reverseArgs<Func extends (arg: any, arg2: any, arg3: any, arg4: any) => any>(func: Func): (arg4: Arg4<Func>, arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func>) => Return<Func>;
declare function reverseArgs<Func extends (arg: any, arg2: any, arg3: any, arg4: any, arg5: any) => any>(func: Func): (arg5: Arg5<Func>, arg4: Arg4<Func>, arg3: Arg3<Func>, arg2: Arg2<Func>, arg: Arg<Func>) => Return<Func>;

type HasType<T extends string> = {
    type: T;
};
type Typed<O extends object, T extends string> = O & HasType<T>;
declare function typed<T extends string>(type: T): <O extends object>(object: O) => Typed<O, T>;
declare function isTyped<T extends string>(type: T): <O extends object>(object: O) => object is Typed<O, T>;

declare function wrap<Func extends FunctionThatReturns<any>>(func: Func, arg2: Arg2<Func>): (arg: Arg<Func>) => Return<Func>;
declare function wrap<Func extends FunctionThatReturns<any>>(func: Func, arg2: Arg2<Func>, arg3: Arg3<Func>): (arg: Arg<Func>) => Return<Func>;
declare function wrap<Func extends FunctionThatReturns<any>>(func: Func, arg2: Arg2<Func>, arg3: Arg3<Func>, arg4: Arg4<Func>): (arg: Arg<Func>) => Return<Func>;
declare function wrap<Func extends FunctionThatReturns<any>>(func: Func, arg2: Arg2<Func>, arg3: Arg3<Func>, arg4: Arg4<Func>, arg5: Arg5<Func>): (arg: Arg<Func>) => Return<Func>;

export { $, $as, $if, $switch, $throw, $thrower, $try, Arg, Arg2, Arg3, Arg4, Arg5, Color, ColorMap, CreateEnvOptions, CreateEnvResult, Dict, EnsurePropertyOptions, FunctionThatReturns, GoCallback, GoRecurse, HasType, INpmLsOutput, IViteConfig, Jsonable, JsonableNonArray, JsonableObject, Log, LogFunction, LogOptions, LoggerInfo, NewResolvableArgs, NpmLink, Paint, Painter, PossiblySerializedLogFunction, Primitive, Resolvable, Return, SerializeAs, Switch, SwitchWithArg, SwitchWithCondition, Transform, Typed, Typeguard, TypeguardOrType, UnixTimestamp, ansiColors, ansiPrefixes, assert, createEnv, doWith, download, downloadAsStream, ensure, ensureProperty, envCase, envKeys, forceUpdateNpmLinks, functionThatReturns, getItemNames, getNpmLinks, go, goer, guard, humanize, is, isDefined, isPrimitive, isTyped, jsObjectString, jsonClone, jsonEqual, labelize, logger, loggerInfo, map, paint, reverseArgs, serializer, setLastLogIndex, typed, unEnvCase, unEnvKeys, viteConfigForNpmLinks, wrap };
