export type GoRecurse<TReturn, TArg> = (arg: TArg) => TReturn;
export type GoCallback<TReturn, TArg> = (recurse: GoRecurse<TReturn, TArg>, arg: TArg) => TReturn;
export declare function go<TReturn, TArg>(callback: GoCallback<TReturn, TArg>, arg: TArg): TReturn;
export declare function goer<TReturn, TArg>(callback: GoCallback<TReturn, TArg>): GoRecurse<TReturn, TArg>;
