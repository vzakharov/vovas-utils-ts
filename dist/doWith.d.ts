export declare function doWith<T, Result>(target: T, callback: (target: T) => Result, { finally: cleanMethodName }: {
    finally: string;
}): Result;
