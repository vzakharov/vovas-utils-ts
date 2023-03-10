import { UnixTimestamp } from "./types.js";
export interface NewResolvableArgs<T> {
    previousResolved?: UnixTimestamp;
    startResolved?: boolean;
    startResolvedWith?: T;
}
export declare class Resolvable<T = void> {
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
