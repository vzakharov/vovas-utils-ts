import _ from 'lodash';
import fs from 'fs';
import yaml from 'js-yaml';
import https from 'https';
import path from 'path';
import os from 'os';
import childProcess from 'child_process';

function aliasify(object, aliasesDefinition) {
  const retypedObject = object;
  for (const key in aliasesDefinition) {
    const aliases = aliasesDefinition[key];
    if (!aliases)
      continue;
    for (const alias of aliases) {
      retypedObject[alias] = object[key];
    }
  }
  return retypedObject;
}

function $do(fnOrKey, ...args) {
  return typeof fnOrKey === "string" ? (target) => target[fnOrKey](...args) : (target) => fnOrKey(target, ...args);
}
const wrap = $do;

function $throw(errorOrMessage) {
  throw typeof errorOrMessage === "string" ? new Error(errorOrMessage) : errorOrMessage;
}
function $thrower(errorOrMessage) {
  return (...args) => $throw(errorOrMessage);
}

function $try(fn, fallback = $throw, finallyCallback) {
  try {
    return fn();
  } catch (e) {
    return _.isFunction(fallback) ? fallback(e) : fallback;
  } finally {
    finallyCallback?.();
  }
}

function $with(...args) {
  return {
    do: (fn) => fn(...args)
  };
}

function isPrimitive(v) {
  const result = _.isString(v) || _.isNumber(v) || _.isBoolean(v) || _.isNull(v) || _.isUndefined(v);
  return result;
}
function functionThatReturns(value) {
  return (...args) => value;
}
function $as(what) {
  return _.isFunction(what) ? what : what;
}
function assign(target, source) {
  return Object.assign(target, source);
}
function tuple(...args) {
  return args;
}

function chainified($function, chainedParameterIndex, chainedKeys) {
  return chainedKeys.reduce(
    (output, key, index, keys) => {
      output[key] = (value) => (
        //
        assign(
          (...args) => $function(
            ...args.slice(0, chainedParameterIndex),
            {
              ...args[chainedParameterIndex],
              [key]: value
            },
            ...args.slice(chainedParameterIndex + 1)
          ),
          chainified(
            $function,
            chainedParameterIndex,
            keys.splice(index, 1)
          )
        )
      );
      return output;
    },
    {}
  );
}

const ansiPrefixes = {
  gray: "\x1B[90m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m"
};
const ansiColors = _.keys(ansiPrefixes);
const paint = (color) => (text) => ansiPrefixes[color] + text + "\x1B[0m";
Object.assign(paint, _.mapValues(ansiPrefixes, (prefix, color) => paint(color)));
function loadOrSaveLoggerInfo(save) {
  return $try(
    () => save ? (fs.writeFileSync("./logger.json", JSON.stringify(save, null, 2)), save) : fs.existsSync("./logger.json") ? JSON.parse(fs.readFileSync("./logger.json", "utf8")) : {},
    (error) => error instanceof TypeError ? save ? (localStorage.setItem("loggerInfo", JSON.stringify(save)), save) : JSON.parse(localStorage.getItem("loggerInfo") ?? "{}") : $throw(error)
  );
}
const loggerInfo = loadOrSaveLoggerInfo();
function setLastLogIndex(index) {
  loggerInfo.lastLogIndex = index;
  loadOrSaveLoggerInfo(loggerInfo);
}
const serializer = {
  json: (arg) => JSON.stringify(arg, null, 2),
  yaml: (arg) => yaml.dump(arg),
  none: (arg) => arg
};
function logger(index, defaultColorOrOptions, defaultSerializeAsOrAddAlways) {
  const defaultOptions = _.isPlainObject(defaultColorOrOptions) ? defaultColorOrOptions : {
    color: defaultColorOrOptions ?? "gray",
    serializeAs: defaultSerializeAsOrAddAlways ?? "yaml"
  };
  const addAlways = _.isBoolean(defaultSerializeAsOrAddAlways) ? defaultSerializeAsOrAddAlways : true;
  const { dontShrinkArrays } = defaultOptions;
  if (typeof index === "undefined") {
    logger("always").yellow("Warning: logger index is not set, this will not log anything. Set to 0 explicitly to remove this warning. Set to 'always' to always log.");
  }
  if (index && index !== "always" && index > loggerInfo.lastLogIndex) {
    setLastLogIndex(index);
  }
  function _log(options, ...args) {
    const { color, serializeAs } = _.defaults(options, defaultOptions);
    if (loggerInfo.logAll || index === "always" || index === loggerInfo.lastLogIndex) {
      args.forEach((arg) => {
        try {
          console.log(
            String(
              isPrimitive(arg) ? arg : _.isFunction(arg) ? arg.toString() : serializer[serializeAs](
                dontShrinkArrays ? arg : _.cloneDeepWith(arg, (value, key) => {
                  if (_.isArray(value) && value.length > 3) {
                    return _.sampleSize(value, 3);
                  }
                })
              )
            ).split("\n").map(paint[color]).join("\n")
          );
        } catch (error) {
          console.log(arg);
        }
      });
    }
  }
  const log = (...args) => _log(defaultOptions, ...args);
  for (const color of [void 0, ...Object.keys(paint)]) {
    for (const serializeAs of [void 0, "json", "yaml"]) {
      if (color || serializeAs)
        _.set(
          log,
          _.compact([color, serializeAs]),
          (...args) => _log({ color, serializeAs }, ...args)
        );
    }
  }
  if (addAlways)
    log.always = logger("always", defaultOptions, false);
  return log;
}

const log$1 = logger(28, "yellow");
function parseSwitch(kind, hasArgument, argument, switchStack) {
  log$1("parseSwitch", { kind, hasArgument, argument, switchStack });
  function $if2(predicate, transform2) {
    return transform2 ? pushToStack(
      kind,
      hasArgument,
      argument,
      predicate,
      transform2,
      switchStack
    ) : parseTransform(
      kind,
      hasArgument,
      argument,
      predicate,
      switchStack
    );
  }
  function $else(transform2) {
    const alwaysTrue = () => true;
    return pushToStack(
      "last",
      hasArgument,
      argument,
      alwaysTrue,
      transform2,
      switchStack
    );
  }
  return {
    if: $if2,
    ...kind !== "first" ? { else: $else } : {}
  };
}
function parseTransform(kind, hasArgument, argument, predicate, switchStack) {
  log$1("parseTransform", { kind, hasArgument, argument, predicate, switchStack });
  return {
    then: (transform2) => pushToStack(
      kind,
      hasArgument,
      argument,
      predicate,
      transform2,
      switchStack
    )
  };
}
function pushToStack(kind, hasArgument, argument, predicate, transform2, switchStack) {
  log$1("pushToStack", { kind, hasArgument, argument, predicate, transform: transform2, switchStack });
  switchStack.push([predicate, transform2]);
  return kind === "last" ? evaluate(
    hasArgument,
    argument,
    switchStack
  ) : parseSwitch(
    void 0,
    hasArgument,
    argument,
    switchStack
  );
}
function evaluate(hasArgument, argument, switchStack) {
  log$1("evaluate", { hasArgument, argument, switchStack });
  function evaluateForArgument(argument2) {
    for (const [predicate, transform2] of switchStack) {
      if (predicate(argument2)) {
        const result = transform2(argument2);
        log$1.green("Found matching predicate", { predicate, transform: transform2, result });
        return result;
      }
    }
    throw new Error(`No matching predicate found for argument ${argument2} (this should never happen)`);
  }
  return hasArgument ? evaluateForArgument(argument) : evaluateForArgument;
}
function check(...args) {
  const arg = args.length === 0 ? void 0 : args.length === 1 ? args[0] : args;
  return parseSwitch(
    "first",
    args.length > 0,
    arg,
    []
  );
}
const transform = check;
function $if(argument, predicate, transform2) {
  return pushToStack(
    "first",
    true,
    argument,
    predicate,
    transform2,
    []
  );
}

function lazily(func, ...args) {
  return args.length ? () => func(...args) : (...args2) => () => func(...args2);
}

function meta(fn) {
  const wrapper = (...args) => {
    const innerFn = fn(wrapper);
    return innerFn(...args);
  };
  return wrapper;
}

function both(...predicates) {
  return (arg) => predicates.every((predicate) => predicate(arg));
}

function isTypeguardMap(arg) {
  return _.isObject(arg) && _.every(arg, _.isFunction);
}
function conformsToTypeguardMap(typeguardMap) {
  return (object) => {
    return _.every(typeguardMap, (typeguard, key) => typeguard(object[key]));
  };
}

function isLike(sample) {
  return _.isObject(sample) ? conformsToTypeguardMap(sample) : () => false;
}

function not(predicate) {
  return (arg) => !predicate(arg);
}

const commonPredicates = {
  undefined: (arg) => _.isUndefined(arg),
  null: (arg) => _.isNull(arg),
  string: (arg) => _.isString(arg),
  // string: <T>(arg: T): arg is T & string => _.isString(arg),
  emptyString: (arg) => arg === "",
  number: (arg) => _.isNumber(arg),
  zero: (arg) => arg === 0,
  boolean: (arg) => _.isBoolean(arg),
  false: (arg) => arg === false,
  true: (arg) => arg === true,
  function: (arg) => _.isFunction(arg),
  object: (arg) => _.isObject(arg),
  // object: <T>(arg: T): arg is T & object => _.isObject(arg),
  array: (arg) => _.isArray(arg),
  regexp: (arg) => _.isRegExp(arg),
  // regexp: <T>(arg: T): arg is T & RegExp => _.isRegExp(arg),
  itself: (arg) => true,
  primitive: (arg) => isPrimitive(arg),
  jsonable: (arg) => isJsonable(arg),
  jsonableObject: (arg) => isJsonableObject(arg),
  defined: (arg) => !_.isUndefined(arg),
  empty: (arg) => arg.length === 0,
  truthy: (arg) => !!arg,
  falsy: (arg) => !arg,
  // exactly: <T>(sample: T) => (arg: T) => _.isEqual(arg, sample),
  exactly: (sample) => (arg) => _.isEqual(arg, sample),
  above: (sample) => (arg) => arg > sample,
  below: (sample) => (arg) => arg < sample,
  atLeast: (sample) => (arg) => arg >= sample,
  atMost: (sample) => (arg) => arg <= sample,
  match: (sample) => (arg) => _.isMatch(arg, sample),
  like: isLike,
  typed: isTyped,
  anything: (...args) => true
};
const is = merge(commonPredicates, (is2) => ({
  not: {
    undefined: not(is2.undefined),
    null: not(is2.null),
    string: not(is2.string),
    emptyString: not(is2.emptyString),
    number: not(is2.number),
    zero: not(is2.zero),
    boolean: not(is2.boolean),
    false: not(is2.false),
    true: not(is2.true),
    function: not(is2.function),
    object: not(is2.object),
    array: not(is2.array),
    regexp: not(is2.regexp),
    itself: not(is2.itself),
    // funny ain't it?
    primitive: not(is2.primitive),
    jsonable: not(is2.jsonable),
    jsonableObject: not(is2.jsonableObject),
    defined: not(is2.defined),
    empty: not(is2.empty),
    truthy: not(is2.truthy),
    falsy: not(is2.falsy),
    exactly: (sample) => not(is2.exactly(sample)),
    above: (sample) => not(is2.above(sample)),
    below: (sample) => not(is2.below(sample)),
    atLeast: (sample) => not(is2.atLeast(sample)),
    atMost: (sample) => not(is2.atMost(sample)),
    like: (sample) => not(isLike(sample)),
    typed: (type) => not(isTyped(type)),
    match: (sample) => not(is2.match(sample)),
    // matching: (regex: RegExp) => not(is.matching(regex)),
    // describing: (string: string) => not(is.describing(string)),
    anything: not(is2.anything)
  }
  // TODO: Find a way to make the above work in TS without having to manually type it out.
}));
const does = is;
const isnt = is.not;
const aint = is.not;
const doesnt = does.not;

function either(...predicates) {
  return (arg) => predicates.some((predicate) => predicate(arg));
}

function its(key, predicateOrValue) {
  return _.isUndefined(predicateOrValue) ? (arg) => arg[key] : _.isFunction(predicateOrValue) ? (arg) => predicateOrValue(arg[key]) : (arg) => arg[key] === predicateOrValue;
}

function has(source) {
  return (target) => _.isMatch(target, source);
}

function respectively(...typeguards) {
  return (values) => {
    return values.every((value, index) => typeguards[index](value));
  };
}
function respectivelyReturn(...transforms) {
  return (values) => {
    return values.map((value, index) => transforms[index](value));
  };
}
respectively.return = respectivelyReturn;

function compileTimeError(item) {
  throw new Error(`This should not exist: ${item}`);
}
const shouldNotBe = compileTimeError;

function callIts(key, ...args) {
  return (object) => object[key](...args);
}

function getProp(key) {
  return (obj) => obj[key];
}

const commonTransforms = aliasify({
  // Value-ish transforms: e.g. `.else.itself` returns the original value without needing to wrap it in a function
  itself: (arg) => arg,
  themselves: (arrayArg) => arrayArg,
  $: give$,
  undefined: give$(void 0),
  null: give$(null),
  true: give$(true),
  false: give$(false),
  NaN: give$(NaN),
  Infinity: give$(Infinity),
  zero: give$(0),
  emptyString: give$(""),
  emptyArray: give$([]),
  emptyObject: give$({}),
  string: (arg) => `${arg}`,
  boolean: (arg) => !!arg,
  number: (arg) => Number(arg),
  array: (arg) => _.castArray(arg),
  keys: (arg) => _.keys(arg),
  json: (arg) => JSON.stringify(arg),
  yaml: (arg) => yaml.dump(arg),
  parsedJson: (arg) => JSON.parse(arg),
  parsedYaml: (arg) => yaml.load(arg),
  lowerCase: (arg) => arg.toLowerCase(),
  upperCase: (arg) => arg.toUpperCase(),
  camelCase: (arg) => _.camelCase(arg),
  snakeCase: (arg) => _.snakeCase(arg),
  kebabCase: (arg) => _.kebabCase(arg),
  startCase: (arg) => _.startCase(arg),
  format: (format) => (insert) => format.replace(/(?<!\\)%s/g, insert),
  replace: (template, replacement) => (arg) => arg.replace(template, replacement),
  first: (arg) => arg[0],
  last: (arg) => arg[arg.length - 1],
  prop: getProp,
  compileTimeError,
  // Function-ish transforms: e.g. `.else.throw("message")` throws an error with the given message
  error: $thrower,
  map: (transform) => (arg) => arg.map(transform),
  mapValues: (transform) => (arg) => _.mapValues(arg, transform),
  wrapped: $do,
  pipe
}, {
  $: ["exactly", "value", "literal"],
  NaN: ["nan", "notANumber"],
  Infinity: "infinity",
  zero: "0",
  emptyString: "",
  json: "JSON",
  yaml: "YAML",
  parsedJson: ["unjson", "unJSON", "parsedJSON"],
  parsedYaml: ["unyaml", "unYAML", "parsedYAML"],
  lowerCase: "lowercase",
  upperCase: ["UPPERCASE", "ALLCAPS"],
  snakeCase: "snake_case",
  kebabCase: "kebab-case",
  startCase: "Start Case",
  first: ["firstItem", "head"],
  last: ["lastItem", "tail"],
  prop: ["property", "its"]
});
const give = commonTransforms;
const to = commonTransforms;
const go = commonTransforms;
function give$(arg) {
  return () => arg;
}

function pipe(...fns) {
  return (from) => {
    let result = from;
    for (const fn of fns) {
      result = fn(result);
    }
    return result;
  };
}

function shiftTo(direction) {
  return function(args) {
    return direction === "left" ? [...args.slice(1), void 0] : [void 0, ...args.slice(0, -1)];
  };
}
const shift = {
  left: shiftTo("left"),
  right: shiftTo("right")
};

function ensure(x, variableName) {
  if (typeof x === "undefined" || x === null) {
    throw new Error(
      variableName ? `${variableName} is undefined.` : "A variable is undefined. Check the call stack to see which one."
    );
  }
  return x;
}
function assert(x, variableName) {
  ensure(x, variableName);
}
function ensureProperty(obj, key, optionsOrMessageIfInvalid = {}) {
  const keyOfObj = key;
  const options = typeof optionsOrMessageIfInvalid === "string" ? { messageIfInvalid: optionsOrMessageIfInvalid } : optionsOrMessageIfInvalid;
  const { requiredType, validate, messageIfInvalid } = options;
  try {
    if (typeof obj[keyOfObj] === "undefined") {
      throw new Error(`Property ${String(keyOfObj)} is undefined: ${JSON.stringify(obj)}`);
    }
    if (requiredType && typeof obj[keyOfObj] !== requiredType) {
      throw new Error(`Property ${String(keyOfObj)} is not of type ${requiredType}: ${JSON.stringify(obj)}`);
    } else if (validate) {
      if (!validate(obj[keyOfObj])) {
        throw new Error(`Property ${String(keyOfObj)} is invalid: ${JSON.stringify(obj)}`);
      }
    }
  } catch (e) {
    if (messageIfInvalid) {
      e.message += `
${messageIfInvalid}`;
    }
    throw e;
  }
  return obj[keyOfObj];
}

function createEnv(descriptor, options = {}) {
  const env = {};
  const missingEnvs = {};
  const presentEnvs = {};
  for (const key of Object.getOwnPropertyNames(descriptor)) {
    const keyOfT = key;
    const description = descriptor[keyOfT];
    const ENV_KEY = _.snakeCase(key).toUpperCase();
    try {
      env[keyOfT] = ensureProperty(process.env, ENV_KEY, description);
      if (presentEnvs)
        presentEnvs[keyOfT] = env[keyOfT];
    } catch (e) {
      if (missingEnvs)
        missingEnvs[keyOfT] = description;
      Object.defineProperty(env, keyOfT, {
        get() {
          throw options.missingKeyError?.(ENV_KEY) ?? new Error(`Missing env ${ENV_KEY} (${description})`);
        },
        configurable: true
      });
      console.log(`WARNING: Missing env ${ENV_KEY} (${description}). Not throwing error until it is attempted to be used.`);
    }
  }
  return { env, missingEnvs, presentEnvs };
}
const envCase = (string) => _.snakeCase(string).toUpperCase();
const unEnvCase = _.camelCase;
function envKeys(dict) {
  return _.mapKeys(dict, (value, key) => envCase(key));
}
function unEnvKeys(dict) {
  return _.mapKeys(dict, (value, key) => unEnvCase(key));
}

function doWith(target, callback, { finally: cleanMethodName }) {
  try {
    return callback(target);
  } finally {
    ensureProperty(target, cleanMethodName)();
  }
}

async function download(url, filename) {
  const filePath = path.join(os.tmpdir(), filename ?? path.basename(url));
  const file = fs.createWriteStream(filePath);
  const request = https.get(url, (response) => response.pipe(file));
  await new Promise((resolve, reject) => {
    file.on("finish", resolve);
    [file, request].forEach((stream) => stream.on("error", reject));
  });
  console.log(`Downloaded ${url} to ${filePath}`);
  return filePath;
}
function downloadAsStream(url) {
  return download(url).then(fs.createReadStream);
}

const groupListeners = {};
class GroupListener {
  constructor(client, event, handler) {
    this.client = client;
    this.event = event;
    this.handler = handler;
    this.listeners = [];
  }
  add(...params) {
    const handler = (arg) => this.handler(arg, ...params);
    this.listeners.push([this.event, handler]);
    this.client.on(this.event, handler);
  }
  removeAll() {
    this.listeners.forEach((listener) => this.client.removeListener(...listener));
  }
  static add(slug, client, event, handler) {
    return groupListeners[slug] ?? (groupListeners[slug] = new GroupListener(client, event, handler));
  }
  static removeAll(slug) {
    groupListeners[slug]?.removeAll();
    delete groupListeners[slug];
  }
}

function humanize(str) {
  return _.capitalize(_.startCase(str));
}
function labelize(values) {
  return values.map((value) => ({ value, label: humanize(value) }));
}

function jsObjectString(obj) {
  const seen = [];
  const shared = [];
  function scanForShared(obj2) {
    if (isPrimitive(obj2)) {
      return;
    }
    if (seen.includes(obj2)) {
      if (!shared.includes(obj2)) {
        shared.push(obj2);
      }
      return;
    }
    seen.push(obj2);
    (_.isArray(obj2) ? obj2 : _.values(obj2)).forEach(scanForShared);
  }
  scanForShared(obj);
  const getIndent = (count) => "  ".repeat(count);
  let indentCount = 0;
  function stringify(obj2, disableShared) {
    indentCount++;
    const indent = getIndent(indentCount);
    let value = (() => {
      if (isPrimitive(obj2)) {
        return typeof obj2 === "string" ? JSON.stringify(obj2) : String(obj2);
      }
      if (_.isArray(obj2)) {
        return `[${obj2.map((item) => stringify(item, disableShared)).join(", ")}]`;
      }
      if (!disableShared) {
        const sharedIndex = shared.indexOf(obj2);
        if (sharedIndex !== -1) {
          return `shared[${sharedIndex}]`;
        }
      }
      const keys = _.keys(obj2);
      if (keys.length === 0) {
        return "{}";
      }
      return `{
${keys.map((key) => `${indent}${key}: ${stringify(obj2[key], disableShared)}`).join(",\n")}
${getIndent(indentCount - 1)}}`;
    })();
    indentCount--;
    return value;
  }
  return `const shared = ${stringify(shared, true)};

export default ${stringify(obj)};`;
}

function jsonClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function jsonEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function isJsonable(obj) {
  try {
    return jsonEqual(obj, jsonClone(obj));
  } catch (e) {
    return false;
  }
}
function isJsonableObject(obj) {
  return isJsonable(obj) && _.isPlainObject(obj);
}

function merge(target, ...sources) {
  let result = target;
  for (const source of sources) {
    if (_.isFunction(source)) {
      result = _.merge(result, source(result));
    } else {
      result = _.merge(result, source);
    }
  }
  return result;
}

const log = logger(23, "yellow");
function getNpmLinks() {
  const npmLsOutput = JSON.parse(
    childProcess.execSync("npm ls --depth=0 --link=true --json=true").toString()
  );
  log("npmLsOutput:\n", npmLsOutput);
  const npmLinks = Object.entries(
    _.mapValues(
      npmLsOutput.dependencies,
      (dependency) => dependency.resolved?.replace(/^file:/, "") ?? ""
    )
  ).filter(([_2, resolvedPath]) => resolvedPath);
  return npmLinks;
}
function viteConfigForNpmLinks() {
  const npmLinks = getNpmLinks();
  log("npmLinks:\n", npmLinks);
  const viteConfig = npmLinks.reduce((vite, packageName) => {
    log("Adding alias for", packageName, "to vite config");
    const [alias, relativePath] = Array.isArray(packageName) ? packageName : [packageName, packageName];
    const resolvedPath = path.resolve(__dirname, `${relativePath}/src`);
    const toMerge = _.merge(vite, {
      resolve: {
        alias: {
          [alias]: resolvedPath
        }
      },
      // Allow vite to access files outside of the project root
      server: {
        fs: {
          allow: [
            ...vite.server?.fs?.allow ?? [],
            resolvedPath
          ]
        }
      }
    });
    log.green("Resulting vite config:", vite);
    return toMerge;
  }, {});
  return viteConfig;
}
function forceUpdateNpmLinks() {
  getNpmLinks().forEach(([packageName]) => {
    log(`Forcing update of npm-linked package ${packageName}`);
    childProcess.execSync(`yarn add --force ${packageName}`);
    log.green(`Successfully updated npm-linked package ${packageName}`);
  });
}

class Resolvable {
  constructor(config = {}) {
    this.config = config;
    this.inProgress = true;
    this._resolve = () => {
    };
    this._reject = () => {
    };
    this.promise = new Promise((_resolve, _reject) => {
      Object.assign(this, { _resolve, _reject });
    });
    const { previousResolved, startResolved, startResolvedWith, then } = this.config;
    this.previousResolved = previousResolved;
    if (startResolved) {
      this.promise = Promise.resolve(ensure(startResolvedWith));
      this.inProgress = false;
    }
    if (then)
      this.promise.then(then);
  }
  resolve(value) {
    this._resolve(value);
    this.inProgress = false;
    this.previousResolved = Date.now();
  }
  reject(reason) {
    this._reject(reason);
    this.inProgress = false;
  }
  reset(value) {
    this.resolve(value);
    this.start();
  }
  start() {
    if (this.inProgress)
      throw new Error("Cannot start a Resolvable that is already in progress.");
    Object.assign(this, new Resolvable({
      ...this.config,
      startResolved: false
    }));
  }
  async restartAfterWait() {
    while (this.inProgress)
      await this.promise;
    this.start();
  }
}

function toType(type) {
  return (object) => Object.assign(object, { type });
}
function isTyped(type) {
  return function(object) {
    return object.type === type;
  };
}
function isKindOf(kind) {
  return function(object) {
    return object.kind === kind;
  };
}

export { $as, $do, $if, $throw, $thrower, $try, $with, GroupListener, Resolvable, aint, aliasify, ansiColors, ansiPrefixes, assert, assign, both, callIts, chainified, check, commonPredicates, commonTransforms, compileTimeError, conformsToTypeguardMap, createEnv, doWith, does, doesnt, download, downloadAsStream, either, ensure, ensureProperty, envCase, envKeys, evaluate, forceUpdateNpmLinks, functionThatReturns, getNpmLinks, getProp, give, give$, go, groupListeners, has, humanize, is, isJsonable, isJsonableObject, isKindOf, isLike, isPrimitive, isTyped, isTypeguardMap, isnt, its, jsObjectString, jsonClone, jsonEqual, labelize, lazily, logger, loggerInfo, merge, meta, not, paint, parseSwitch, parseTransform, pipe, pushToStack, respectively, serializer, setLastLogIndex, shift, shiftTo, shouldNotBe, to, toType, transform, tuple, unEnvCase, unEnvKeys, viteConfigForNpmLinks, wrap };
