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

import fs from 'fs';
import yaml from 'js-yaml';
import _ from 'lodash';
import { $throw, $try } from './funkenstein';
import { isPrimitive } from './types.js';
import path from 'path';

// import paint from 'ansi-colors';
// export type LogColor = keyof typeof color;

export type Color = 'gray' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';

export type Painter = (text: string) => string;

export type ColorMap<T> = {
  [color in Color]: T;
}

export type Paint = ( (color: Color) => Painter ) & ColorMap<Painter>;

export const ansiPrefixes: ColorMap<string> = {
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

export const coloredEmojis: ColorMap<string> = {
  gray: '🐭',
  red: '🦊',
  green: '🐸',
  yellow: '🐤',
  blue: '🐬',
  magenta: '🦄',
  cyan: '🐳',
};

export const ansiColors = _.keys(ansiPrefixes) as Color[];

// export function paint(color: LogColor): Painter {
//   return (text: string) => ansiPrefixes[color] + text + '\x1b[0m';
// }
export const paint = (
  (
    color: Color) =>
      (text: string) => ansiPrefixes[color] + text + '\x1b[0m'
  ) as Paint;

Object.assign(paint, _.mapValues(ansiPrefixes, (prefix, color) => paint(color as Color)));

export type Index = number | string;

export type LogIndices = {
  [index in Index]: boolean | LogIndices;
};

export type LoggerInfo = {
  lastLogIndex: number;
  logAll?: boolean;
  logToFile?: boolean;
  logIndices: LogIndices;
}

function loadOrSaveLoggerInfo(save?: LoggerInfo): LoggerInfo {
  return $try(
    () =>
      save
        ? (
          fs.writeFileSync('./logger.json', JSON.stringify(save, null, 2)),
          save
        ) : fs.existsSync('./logger.json')
          ? JSON.parse(fs.readFileSync('./logger.json', 'utf8'))
          : {},
    (error: any) =>
      error instanceof TypeError // "existsSync is not a function"
        ? save
          ? (
            localStorage.setItem('loggerInfo', JSON.stringify(save)),
            save
          ) : JSON.parse(localStorage.getItem('loggerInfo') ?? '{}')
        : $throw(error)
  );
};

export const loggerInfo: LoggerInfo = loadOrSaveLoggerInfo();

export function setLastLogIndex(index: number) {
  loggerInfo.lastLogIndex = index;
  loadOrSaveLoggerInfo(loggerInfo);
}

export const serializer = {
  json: (arg: any) => JSON.stringify(arg, null, 2),
  yaml: (arg: any) => yaml.dump(arg),
  none: (arg: any) => arg,
};

export type SerializeAs = keyof typeof serializer;

export type LogOptions = {
  color: Color;
  serializeAs: SerializeAs;
  dontShrinkArrays?: boolean; // If not set, only 3 random elements will be logged from any arrays, including nested ones
};  

export type LogFunction = (...args: any[]) => void

export type PossiblySerializedLogFunction = LogFunction & {
  [serialize in SerializeAs]: LogFunction;
}

export type Log = PossiblySerializedLogFunction & {
  [color in Color]: PossiblySerializedLogFunction;
} & {
  always: Log;
}

export function serializable(arg: any): any {
  if ( _.isFunction(arg) )
    return "[Function]"
  if ( typeof arg === 'bigint' || typeof arg === 'symbol' )
    return arg.toString()
  if ( _.isArray(arg) )
    return arg.map(serializable)
  if ( _.isPlainObject(arg) )
    return _.mapValues(arg, serializable)
  return arg
}

export function withLogFile<T>(index: number | string, callback: (logFile: string) => T) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const logFile = path.join(tmpDir, `log-${new Date().toISOString().slice(0, 13)}00-${index}.log`);
  return callback(logFile);
}


export function logger(index: number | string | 'always', defaultColor?: Color, defaultSerializeAs?: SerializeAs): Log
export function logger(index: number | string | 'always', defaultOptions?: LogOptions, addAlways?: boolean): Log
export function logger(index: number | string | 'always', 
  defaultColorOrOptions?: Color | LogOptions,
  defaultSerializeAsOrAddAlways?: SerializeAs | boolean
): Log {

  const defaultOptions = (
    _.isPlainObject(defaultColorOrOptions)
      ? defaultColorOrOptions
      : {
        color: defaultColorOrOptions ?? 'gray',
        serializeAs: defaultSerializeAsOrAddAlways ?? 'yaml'
      } 
  ) as LogOptions;

  const addAlways = _.isBoolean(defaultSerializeAsOrAddAlways) ? defaultSerializeAsOrAddAlways : true;
  const { dontShrinkArrays } = defaultOptions;
  
  if ( typeof index === 'undefined' ) {
    // Fallback for non-typescript users
    logger('always').yellow("Warning: logger index is not set, this will not log anything. Set to 0 explicitly to remove this warning. Set to 'always' to always log.");
  }

  if ( index && index !== 'always' && _.isNumber(index) && index > loggerInfo.lastLogIndex ) {
    setLastLogIndex(index);
  }
  
  function _log(options: Partial<LogOptions>, ...args: any[]) {

    const { color, serializeAs } = _.defaults(options, defaultOptions);
    const { logAll, lastLogIndex, logToFile, logIndices } = loggerInfo;
    const mustLog = logAll || index === 'always' || index === lastLogIndex || _.get(logIndices, index) === true;
  
    if ( mustLog ) {

      args.forEach( arg => {
        arg = serializable(arg);
        try {
          console.log(
            getArgString(arg, serializeAs)
            .split('\n').map( paint[color] ).join('\n')
          )
        } catch (error) {
          console.log(arg);
        }
      });

      if ( logToFile ) {
        // Append the log message to the end of file named log-YYMMDD-HH00-[index].log, including timestamp and color emojis
        // Create the file and the tmp directory if it doesn't exist
        withLogFile(index, logFile =>
          fs.appendFileSync(logFile,
            `${new Date().toISOString()}\n` +
            coloredEmojis[color] + '\n' +
            // JSON.stringify(args, null, 2) + '\n\n'
            args.map(arg => getArgString(arg, 'json')).join('\n') + '\n\n'
          )
        );
      }

      function getArgString(arg: any, serializeAs: SerializeAs) {
        return String(
          isPrimitive(arg)
            ? arg
            : _.isFunction(arg)
              ? arg.toString()  
              : serializer[serializeAs](
                dontShrinkArrays ? arg : _.cloneDeepWith(arg, (value, key) => {
                  if ( _.isArray(value) && value.length > 3 ) {
                    return [
                      ..._.sampleSize(value, 3),
                      `... ${value.length - 3} more elements ...`
                    ];
                  } else if ( _.isFunction(value) ) {
                    return value.toString().slice(0, 30);
                  }
                })
              )
        )
      }

    };
    
  }

  const log = (...args: any[]) => _log(defaultOptions, ...args);
  for ( const color of [undefined, ...Object.keys(paint) as Color[]] ) {
     for ( const serializeAs of [undefined, 'json', 'yaml'] as const ) {
      if ( color || serializeAs)
        _.set( log,
            _.compact([color, serializeAs]),
            (...args: any[]) => _log({ color, serializeAs }, ...args)
        );
    }
  }

  if ( addAlways )
    log.always = logger('always', defaultOptions, false);

  return log as Log;

}