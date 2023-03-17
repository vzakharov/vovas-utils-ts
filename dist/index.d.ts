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
declare function $as<AsWhat>(what: any): AsWhat;
declare function $as<AsWhat>(what: FunctionThatReturns<any>): FunctionThatReturns<AsWhat>;

declare function getItemNames(itemStringOrArrayOrObject: string | string[] | Record<string, any>): string[];

type Typeguard<Arg, TypedArg extends Arg> = (arg: Arg) => arg is TypedArg;
type Transform<Arg, Result> = (arg: Arg) => Result;
type Switch<Arg, Result> = {
    if: If<Arg, Result>;
    case: If<Arg, Result>;
    else(transform: Transform<Arg, Result>): Result;
    default(transform: Transform<Arg, Result>): Result;
};
type If<Arg, Result> = <TypedArg extends Arg>(typeguard: Typeguard<Arg, TypedArg>, transform: Transform<TypedArg, Result>) => Switch<Exclude<Arg, TypedArg>, Result>;
declare function $if<Arg, TypedArg extends Arg, IfResult>(arg: Arg, typeguard: Typeguard<Arg, TypedArg>, transform: Transform<TypedArg, IfResult>): Switch<Exclude<Arg, TypedArg>, IfResult>;
declare function $switch<Arg, Result>(arg: Arg): {
    if: <TypedArg extends Arg, IfResult extends Result>(typeguard: Typeguard<Arg, TypedArg>, transform: Transform<TypedArg, IfResult>) => Switch<Exclude<Arg, TypedArg>, IfResult>;
    case: <TypedArg extends Arg, IfResult extends Result>(typeguard: Typeguard<Arg, TypedArg>, transform: Transform<TypedArg, IfResult>) => Switch<Exclude<Arg, TypedArg>, IfResult>;
    else: (transform: Transform<Arg, Result>) => Result;
    default: (transform: Transform<Arg, Result>) => Result;
};
declare function bypass<Arg, Result>(result: Result): Switch<Arg, Result>;
declare function isDefined<T>(value: T): value is Exclude<T, undefined>;
declare function $<T>(value: T): FunctionThatReturns<T>;

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

type HasType<T extends string> = {
    type: T;
};
type Typed<O extends object, T extends string> = O & HasType<T>;
declare function typed<T extends string>(type: T): <O extends object>(object: O) => Typed<O, T>;
declare function isTyped<T extends string>(type: T): <O extends object>(object: O) => object is Typed<O, T>;

export { $, $as, $if, $switch, $throw, $thrower, $try, Color, ColorMap, CreateEnvOptions, CreateEnvResult, Dict, EnsurePropertyOptions, FunctionThatReturns, GoCallback, GoRecurse, HasType, INpmLsOutput, IViteConfig, If, Jsonable, JsonableNonArray, JsonableObject, Log, LogFunction, LogOptions, LoggerInfo, NewResolvableArgs, NpmLink, Paint, Painter, PossiblySerializedLogFunction, Primitive, Resolvable, SerializeAs, Switch, Transform, Typed, Typeguard, UnixTimestamp, ansiColors, ansiPrefixes, assert, bypass, createEnv, doWith, download, downloadAsStream, ensure, ensureProperty, envCase, envKeys, forceUpdateNpmLinks, getItemNames, getNpmLinks, go, goer, humanize, isDefined, isPrimitive, isTyped, jsObjectString, jsonClone, jsonEqual, labelize, logger, loggerInfo, paint, serializer, setLastLogIndex, typed, unEnvCase, unEnvKeys, viteConfigForNpmLinks };
