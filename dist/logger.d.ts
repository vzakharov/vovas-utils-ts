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
export type LogFunction = (...args: any[]) => void;
export type Log = LogFunction & {
    [style in Color]: LogFunction;
} & {
    always: Log;
};
export declare function logger(index?: number | 'always', defaultStyle?: Color, addAlways?: boolean): Log;
