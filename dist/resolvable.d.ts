import { UnixTimestamp } from "./types.js";
export interface NewResolvableArgs {
    previousResolved?: UnixTimestamp;
    startResolved?: boolean;
}
export declare class Resolvable {
    inProgress: boolean;
    _resolve: () => void;
    _reject: (reason?: any) => void;
    promise: Promise<void>;
    previousResolved: UnixTimestamp | undefined;
    constructor({ previousResolved, startResolved }?: NewResolvableArgs);
    resolve(): void;
    reject(reason?: any): void;
    reset(): void;
}
