import c from 'ansi-colors';
export type LoggerStyle = keyof typeof c;
export declare const loggerInfo: {
    lastLogIndex: any;
};
export type LogFunction = (...args: any[]) => void;
export type Log = LogFunction & {
    [style in LoggerStyle]: LogFunction;
} & {
    always: Log;
};
export declare function logger(index?: number | 'always', defaultStyle?: LoggerStyle, addAlways?: boolean): Log;
