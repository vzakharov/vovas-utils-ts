export type Color = 'gray' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';
export type Painter = (text: string) => string;
export type ColorMap<T> = {
    [color in Color]: T;
};
export type Paint = ((color: Color) => Painter) & ColorMap<Painter>;
export declare const ansiPrefixes: ColorMap<string>;
export declare const ansiColors: Color[];
export declare const paint: Paint;
export declare const loggerInfo: {
    lastLogIndex: number;
};
export declare const serializer: {
    json: (arg: any) => string;
    yaml: (arg: any) => string;
    none: (arg: any) => any;
};
export type SerializeAs = keyof typeof serializer;
export type LogOptions = {
    color: Color;
    serializeAs: SerializeAs;
};
export type LogFunction = (...args: any[]) => void;
export type PossiblySerializedLogFunction = LogFunction & {
    [serialize in SerializeAs]: LogFunction;
};
export type Log = PossiblySerializedLogFunction & {
    [color in Color]: PossiblySerializedLogFunction;
} & {
    always: Log;
};
export declare function logger(index?: number | 'always', defaultColor?: Color, defaultSerializeAs?: SerializeAs): Log;
export declare function logger(index?: number | 'always', defaultOptions?: LogOptions, addAlways?: boolean): Log;
