// The purpose of this util is to only prominently log the piece of code we're currently working on.
// This is done by keeping track of a "last log index" in a separate project file (json). Whenever we want to log something new, we first check the last log index and then create a new logging function with a higher index (the util automatically updates the json).
// So the common interface is to do:
// ```
// import { logger } from '~/utils/logger';
// const log = logger(1);
// // or logger(2), logger(3), etc. or logger('always') if we want to always log
// // or logger(1, 'green') if we want to log in green by default
// log('Hello world!');
// // or log.green('Hello world!'), where log modifiers are taken from the `ansi-colors` package
// // or log.always.green('Hello world!') if we want to override the default behavior and always log
// ```
// The util will only log the message if the index is equal to the last log index. This way, we can easily switch between logging different contexts by changing the index, without cluttering the console with logs from other contexts which are no longer relevant.
import _ from 'lodash';
import fs from 'fs';
export const ansiPrefixes = {
    gray: '\x1b[90m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};
export const ansiColors = _.keys(ansiPrefixes);
// export function paint(color: LogColor): Painter {
//   return (text: string) => ansiPrefixes[color] + text + '\x1b[0m';
// }
export const paint = ((color) => (text) => ansiPrefixes[color] + text + '\x1b[0m');
Object.assign(paint, _.mapValues(ansiPrefixes, (prefix, color) => paint(color)));
export const loggerInfo = {
// lastLogIndex
};
Object.defineProperty(loggerInfo, 'lastLogIndex', {
    get() {
        return process?.env
            ? fs.existsSync('./logger.json') ? JSON.parse(fs.readFileSync('./logger.json', 'utf8')).lastLogIndex : 0
            : localStorage
                ? localStorage.getItem('lastLogIndex') || 0
                : 0;
    },
    set(value) {
        if (process?.env) {
            fs.writeFileSync('./logger.json', JSON.stringify({ lastLogIndex: value }, null, 2));
        }
        else if (localStorage) {
            localStorage.setItem('lastLogIndex', value);
        }
    }
});
export function logger(index, defaultStyle = 'blue', addAlways = true) {
    if (typeof index === 'undefined') {
        logger('always').yellow("Warning: logger index is not set, this will not log anything. Set to 0 explicitly to remove this warning. Set to 'always' to always log.");
    }
    if (index && index !== 'always' && index > loggerInfo.lastLogIndex) {
        loggerInfo.lastLogIndex = index;
        fs.writeFileSync('./logger.json', JSON.stringify({ lastLogIndex: index }, null, 2));
    }
    function logWithStyle(style, ...args) {
        if (index === 'always' || index === loggerInfo.lastLogIndex) {
            let formatFunction = (arg) => arg;
            if (style) {
                let func = paint[style];
                if (typeof func !== 'function')
                    throw new Error(`"${style}" is not a valid style function.`);
                formatFunction = (arg) => func(arg);
            }
            console.log(...args.map(formatFunction));
        }
    }
    const log = logWithStyle.bind(null, defaultStyle);
    for (const style of Object.keys(paint)) {
        log[style] = (...args) => logWithStyle(style, ...args);
    }
    if (addAlways)
        log.always = logger('always', defaultStyle, false);
    return log;
}
