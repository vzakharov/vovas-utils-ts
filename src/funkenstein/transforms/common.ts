import yaml from "js-yaml";
import _ from "lodash";
import { $thrower } from "../$throw";
import { aliasify, Jsonable, $do, merge } from "../..";
import { getProp } from "./getProp";
import { compileTimeError } from "./compileTimeError";

export const commonTransforms = aliasify({

  // Value-ish transforms: e.g. `.else.itself` returns the original value without needing to wrap it in a function

  itself: <T>(arg: T): T => arg,
  themselves: <T extends any[]>(arrayArg: T): T => arrayArg,

  $: give$,

  undefined: give$(undefined as undefined),
  null: give$(null as null),
  true: give$(true as const),
  false: give$(false as const),
  NaN: give$(NaN),
  Infinity: give$(Infinity),
  zero: give$(0 as const),
  emptyString: give$("" as const),
  emptyArray: give$([] as const), 
  emptyObject: give$({} as const),

  string: <
    T extends { toString(): string}
  >(arg: T): string => arg.toString(),
  boolean: <T>(arg: T): boolean => !!arg,
  number: <T>(arg: T): number => Number(arg),
  array: <T>(arg: T): T[] => _.castArray(arg),
  keys: (arg: object) => _.keys(arg),
  
  json: (arg: Jsonable) => JSON.stringify(arg),
  yaml: (arg: Jsonable) => yaml.dump(arg),

  parsedJson: (arg: string) => JSON.parse(arg) as Jsonable,
  parsedYaml: (arg: string) => yaml.load(arg) as Jsonable,

  lowerCase: (arg: string) => arg.toLowerCase(),
  upperCase: (arg: string) => arg.toUpperCase(),
  camelCase: (arg: string) => _.camelCase(arg),
  snakeCase: (arg: string) => _.snakeCase(arg),
  kebabCase: (arg: string) => _.kebabCase(arg),
  startCase: (arg: string) => _.startCase(arg),

  formatted: (format: string) => (insert: string) => format.replace(/(?<!\\)%s/g, insert),

  first: <T>(arg: T[]): T => arg[0],
  last: <T>(arg: T[]): T => arg[arg.length - 1],

  prop: getProp,
  
  compileTimeError,

  // Function-ish transforms: e.g. `.else.throw("message")` throws an error with the given message

  error: $thrower,

  mapped: <T, R>(transform: (arg: T) => R) => (arg: T[]): R[] => arg.map(transform),
  valueMapped: <T, R>(transform: (arg: T) => R) => (arg: { [key: string]: T }): { [key: string]: R } => _.mapValues(arg, transform),

  wrapped: $do

}, {

  $: [ 'exactly', 'value', 'literal' ],
  NaN: [ 'nan', 'notANumber' ],
  Infinity: 'infinity',
  zero: '0',
  emptyString: '',
  json: 'JSON',
  yaml: 'YAML',
  parsedJson: [ 'unjson', 'unJSON', 'parsedJSON' ],
  parsedYaml: [ 'unyaml', 'unYAML', 'parsedYAML' ],

  lowerCase: "lowercase",
  upperCase: [ "UPPERCASE", "ALLCAPS" ],
  snakeCase: "snake_case",
  kebabCase: "kebab-case",
  startCase: "Start Case",

  first: [ "firstItem", "head" ],
  last: [ "lastItem", "tail" ],

} as const );

export const give = commonTransforms;
export const to = commonTransforms;

export type CommonTransforms = typeof commonTransforms;

export type CommonTransformKey = keyof CommonTransforms;

export function give$<T>(arg: T): (...args: any[]) => T {
  return () => arg;
}