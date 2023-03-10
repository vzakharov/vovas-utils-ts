export declare function ensure<T>(x: T | undefined | null, variableName?: string): T;
export declare function assert<T>(x: T | undefined | null, variableName?: string): asserts x is T;
export interface EnsurePropertyOptions {
    requiredType?: string;
    validate?: (value: any) => boolean;
    messageIfInvalid?: string;
}
export declare function ensureProperty<Result, Container = any>(obj: Container, key: string, optionsOrMessageIfInvalid?: EnsurePropertyOptions | string): Result;
