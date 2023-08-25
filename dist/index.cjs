'use strict';

const _ = require('lodash');
const fs = require('fs');
const https = require('https');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const childProcess = require('child_process');

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

function assign(object, newValuesOrCallback) {
  return Object.assign(
    object,
    is.function(newValuesOrCallback) ? newValuesOrCallback(object) : newValuesOrCallback
  );
}
function mutate(object, newValuesOrCallback) {
  assign(object, newValuesOrCallback);
}
function addProperties(object, newValuesOrCallback) {
  Object.assign(
    object,
    is.function(newValuesOrCallback) ? newValuesOrCallback(object) : newValuesOrCallback
  );
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

function genericTypeguard(predicate) {
  function typeguard(arg) {
    return predicate(arg);
  }
  return typeguard;
}
function isExactly(sample) {
  return genericTypeguard((arg) => _.isEqual(arg, sample));
}
function isInstanceOf(constructor) {
  return genericTypeguard((arg) => arg instanceof constructor);
}
const commonPredicates = {
  undefined: genericTypeguard(_.isUndefined),
  null: genericTypeguard(_.isNull),
  nil: genericTypeguard(_.isNil),
  string: genericTypeguard(_.isString),
  emptyString: isExactly(""),
  number: genericTypeguard(_.isNumber),
  zero: isExactly(0),
  boolean: genericTypeguard(_.isBoolean),
  false: isExactly(false),
  true: isExactly(true),
  function: genericTypeguard(_.isFunction),
  promise: isInstanceOf(Promise),
  object: genericTypeguard(_.isObject),
  array: isArray,
  regexp: genericTypeguard(_.isRegExp),
  itself: (arg) => true,
  primitive: genericTypeguard(isPrimitive),
  jsonable: genericTypeguard(isJsonable),
  jsonableObject: genericTypeguard(isJsonableObject),
  defined: (arg) => !_.isUndefined(arg),
  empty: (arg) => arg.length === 0,
  truthy: (arg) => !!arg,
  falsy: (arg) => !arg,
  exactly: isExactly,
  above: (sample) => (arg) => arg > sample,
  below: (sample) => (arg) => arg < sample,
  atLeast: (sample) => (arg) => arg >= sample,
  atMost: (sample) => (arg) => arg <= sample,
  among: isAmong,
  match: (sample) => (arg) => _.isMatch(arg, sample),
  like: isLike,
  typed: isTyped,
  camelCase: isCamelCase,
  anything: (...args) => true
};
const is = merge(commonPredicates, (is2) => ({
  not: {
    undefined: not(is2.undefined),
    null: not(is2.null),
    nil: not(is2.nil),
    string: not(is2.string),
    emptyString: not(is2.emptyString),
    number: not(is2.number),
    zero: not(is2.zero),
    boolean: not(is2.boolean),
    false: not(is2.false),
    true: not(is2.true),
    function: not(is2.function),
    promise: not(is2.promise),
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
    among: (options) => not(is2.among(options)),
    like: (sample) => not(isLike(sample)),
    typed: (type) => not(isTyped(type)),
    match: (sample) => not(is2.match(sample)),
    camelCase: not(is2.camelCase),
    anything: not(is2.anything)
  }
  // TODO: Find a way to make the above work in TS without having to manually type it out.
}));
const does = is;
const isnt = is.not;
const aint = is.not;
const doesnt = does.not;

function $with(...args) {
  return args.length === 2 && is.function(args[1]) ? args[1](args[0]) : {
    do: (fn) => fn(...args)
  };
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
function tuple(...args) {
  return args;
}

function ensure(x, typeguardOrErrorMessage, errorMessage) {
  if (typeof typeguardOrErrorMessage === "string" || typeof typeguardOrErrorMessage === "undefined") {
    errorMessage = typeguardOrErrorMessage;
    if (typeof x === "undefined" || x === null) {
      throw new Error(
        errorMessage ?? "A variable is undefined. Check the call stack to see which one."
      );
    }
    return x;
  } else {
    const typeguard = typeguardOrErrorMessage;
    if (!typeguard(x)) {
      if (is.function(errorMessage)) {
        errorMessage = errorMessage(x);
      }
      throw new Error(errorMessage ?? `Variable ${x} did not pass typeguard ${typeguard.name}.`);
    }
    return x;
  }
}
function assert(x, errorMessage) {
  ensure(x, errorMessage);
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

const ansiPrefixes = {
  gray: "\x1B[90m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m"
};
const coloredEmojis = {
  gray: "\u{1F42D}",
  red: "\u{1F98A}",
  green: "\u{1F438}",
  yellow: "\u{1F424}",
  blue: "\u{1F42C}",
  magenta: "\u{1F984}",
  cyan: "\u{1F433}"
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
function serializable(arg) {
  if (_.isFunction(arg))
    return "[Function]";
  if (typeof arg === "bigint" || typeof arg === "symbol")
    return arg.toString();
  if (_.isArray(arg))
    return arg.map(serializable);
  if (_.isPlainObject(arg))
    return _.mapValues(arg, serializable);
  return arg;
}
function withLogFile(index, callback) {
  const tmpDir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const logFile = path.join(tmpDir, `${index}.${( new Date()).toISOString().slice(0, 13)}00.log`);
  return callback(logFile);
}
function serialize(arg, serializeAs) {
  const { dontShrinkArrays } = loggerInfo;
  return String(
    isPrimitive(arg) ? arg : _.isFunction(arg) ? arg.toString() : serializer[serializeAs](
      dontShrinkArrays ? arg : _.cloneDeepWith(arg, (value) => {
        if (_.isArray(value) && value.length > 3) {
          return [
            ..._.sampleSize(value, 3),
            `... ${value.length - 3} more elements ...`
          ];
        } else if (_.isFunction(value)) {
          return value.toString().slice(0, 30);
        }
      })
    )
  );
}
function getHeapUsedMB() {
  return process.memoryUsage().heapUsed / 1024 / 1024;
}
function checkHeapIncrease() {
  const heapUsed = getHeapUsedMB();
  const heapIncrease = heapUsed - (loggerInfo.lastHeapUsedMB ?? 0);
  const delta = Math.abs(heapIncrease);
  const mustLog = delta >= ensure(
    loggerInfo.logIfHeapIncreasedByMB,
    "monitorHeapIncrease called although logIfHeapIncreasedByMB is not defined"
  );
  if (mustLog) {
    const [color, word] = heapIncrease > 0 ? ["magenta", "increased"] : ["cyan", "decreased"];
    console.log(paint[color](`Memory usage ${word} by ${delta.toFixed(1)} MB, now at ${heapUsed.toFixed(1)} MB`));
    loggerInfo.lastHeapUsedMB = heapUsed;
  }
}
function logger(index, defaultColorOrOptions, defaultSerializeAsOrAddAlways) {
  const defaultOptions = _.isPlainObject(defaultColorOrOptions) ? defaultColorOrOptions : {
    color: defaultColorOrOptions ?? "gray",
    serializeAs: defaultSerializeAsOrAddAlways ?? "yaml"
  };
  const addAlways = _.isBoolean(defaultSerializeAsOrAddAlways) ? defaultSerializeAsOrAddAlways : true;
  if (typeof index === "undefined") {
    logger("always").yellow("Warning: logger index is not set, this will not log anything. Set to 0 explicitly to remove this warning. Set to 'always' to always log.");
  }
  if (index && index !== "always" && _.isNumber(index) && index > loggerInfo.lastLogIndex) {
    setLastLogIndex(index);
  }
  function _log(options, ...args) {
    const { color, serializeAs } = _.defaults(options, defaultOptions);
    const { logAll, lastLogIndex, logToFile, logIndices, logIfHeapIncreasedByMB: reportHeapIncreaseByMB } = loggerInfo;
    const mustLog = logAll || index === "always" || index === lastLogIndex || _.get(logIndices, index) === true;
    if (!mustLog)
      return;
    args.forEach((arg) => {
      arg = serializable(arg);
      try {
        console.log(
          serialize(arg, serializeAs).split("\n").map(paint[color]).join("\n")
        );
      } catch (error) {
        console.log(arg);
      }
    });
    if (logToFile) {
      withLogFile(
        index,
        (logFile) => fs.appendFileSync(
          logFile,
          `${( new Date()).toISOString()}
` + coloredEmojis[color] + "\n" + $try(
            () => args.map((arg) => serialize(arg, serializeAs)).join("\n") + "\n\n",
            JSON.stringify(args, null, 2) + "\n\n"
          )
        )
      );
    }
    if (reportHeapIncreaseByMB) {
      checkHeapIncrease();
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

const log$3 = logger(28, "yellow");
function parseSwitch(kind, hasArgument, argument, switchStack) {
  log$3("parseSwitch", { kind, hasArgument, argument, switchStack });
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
  log$3("parseTransform", { kind, hasArgument, argument, predicate, switchStack });
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
  log$3("pushToStack", { kind, hasArgument, argument, predicate, transform: transform2, switchStack });
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
  log$3("evaluate", { hasArgument, argument, switchStack });
  function evaluateForArgument(argument2) {
    for (const [predicate, transform2] of switchStack) {
      if (predicate(argument2)) {
        const result = transform2(argument2);
        log$3.green("Found matching predicate", { predicate, transform: transform2, result });
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

function either(...predicates) {
  return (arg) => predicates.some((predicate) => predicate(arg));
}

function everyItem(...args) {
  if (args.length === 1) {
    return (arr) => arr.every(args[0]);
  } else {
    return args[0].every(args[1]);
  }
}

function has(source) {
  return (target) => _.isMatch(target, source);
}

function isAmong(options) {
  return (arg) => options.includes(arg);
}

function isArray(arg) {
  return Array.isArray(arg);
}

function its(key, predicateOrValue) {
  return _.isUndefined(predicateOrValue) ? (arg) => arg[key] : _.isFunction(predicateOrValue) ? (arg) => predicateOrValue(arg[key]) : (arg) => arg[key] === predicateOrValue;
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

function thisable(fn) {
  return function(...args) {
    return fn(this, ...args);
  };
}
const sayHello = thisable((own) => {
  console.log(`Hello, ${own.name}!`);
});
const person = {
  name: "John",
  sayHello
};
person.sayHello();

function also(handler) {
  return (value) => (handler(value), value);
}

function assignTo(object, property) {
  return (value) => object[property] = value;
}

function compileTimeError(item) {
  throw new Error(`This should not exist: ${item}`);
}
const shouldNotBe = compileTimeError;

function callIts(key, ...args) {
  return (object) => object[key](...args);
}
const please = callIts;

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

const camelize = (target) => is.string(target) ? target.replace(/_([a-z])/g, (__, char) => char.toUpperCase()) : is.array(target) ? target.map(camelize) : is.object(target) ? _.mapKeys(target, (__, key) => camelize(key)) : target;
function isCamelCase(target) {
  return JSON.stringify(target) === JSON.stringify(camelize(target));
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

const log$2 = logger("vovas-utils.download");
async function download(url, release, filename) {
  const basename = path.basename(url);
  const [name, extension] = basename.match(/(.*)\.([^.]*)$/)?.slice(1) ?? [];
  const filePath = path.join(os.tmpdir(), filename ?? [_.uniqueId(name + "_"), extension].join("."));
  const file = fs.createWriteStream(filePath);
  const request = https.get(url, (response) => response.pipe(file));
  await new Promise((resolve, reject) => {
    file.on("finish", resolve);
    [file, request].forEach((stream) => stream.on("error", reject));
  });
  log$2.green(`Downloaded ${url} to ${filePath} (${fs.statSync(filePath).size} bytes)`);
  release.promise.then(
    () => fs.rm(filePath, () => log$2.magenta(`Deleted ${filePath}`))
  );
  return filePath;
}
async function downloadAsStream(url, release) {
  const path2 = await download(url, release);
  return fs.createReadStream(path2);
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

function ifGeneric(value) {
  return function(typeguard, ifTrue, ifFalse) {
    return typeguard(value) ? ifTrue(value) : ifFalse(value);
  };
}
function stringNumberDial(value) {
  return ifGeneric(value)(
    is.string,
    (value2) => parseInt(value2 + "0"),
    (value2) => (value2 + 1).toString()
  );
}
stringNumberDial("1") + 1;
stringNumberDial(1).toUpperCase();

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

function mapKeysDeep(obj, fn) {
  return _(obj).mapValues((value) => {
    if (_.isPlainObject(value)) {
      return mapKeysDeep(value, fn);
    }
    return value;
  }).mapKeys((__, key) => fn(key)).value();
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

const log$1 = logger("vovas-utils.npmLinks", "yellow");
function getNpmLinks() {
  const npmLsOutput = JSON.parse(
    childProcess.execSync("npm ls --depth=0 --link=true --json=true").toString()
  );
  log$1("npmLsOutput:\n", npmLsOutput);
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
  log$1("npmLinks:\n", npmLinks);
  const viteConfig = npmLinks.reduce((vite, packageName) => {
    log$1("Adding alias for", packageName, "to vite config");
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
    log$1.green("Resulting vite config:", vite);
    return toMerge;
  }, {});
  return viteConfig;
}
function forceUpdateNpmLinks() {
  getNpmLinks().forEach(([packageName]) => {
    log$1(`Forcing update of npm-linked package ${packageName}`);
    childProcess.execSync(`yarn add --force ${packageName}`);
    log$1.green(`Successfully updated npm-linked package ${packageName}`);
  });
}

function objectWithKeys(keys, initializer) {
  return _.fromPairs(
    keys.map(
      (key) => [key, initializer(key)]
    )
  );
}

const log = logger("vovas-utils.resolvable");
class Resolvable {
  constructor(slugOrConfig = {}, nothingOrSlug = "resolvable") {
    this.inProgress = true;
    this._resolve = () => {
    };
    this._reject = () => {
    };
    this.promise = new Promise((_resolve, _reject) => {
      Object.assign(this, { _resolve, _reject });
    });
    const [slug, config] = is.string(slugOrConfig) ? [slugOrConfig, {}] : [nothingOrSlug, slugOrConfig];
    const id = config.id ?? _.uniqueId(slug + "-");
    this.config = {
      ...is.string(slugOrConfig) ? {} : slugOrConfig,
      id
    };
    const { previousResolved, startResolved, startResolvedWith, then, catch: _catch } = config;
    if (startResolved) {
      this.resolve(ensure(startResolvedWith, "startResolvedWith is required when startResolved is true"));
      this.inProgress = false;
    }
    if (then)
      this.then(then);
    if (_catch)
      this.catch(_catch);
  }
  then(callback) {
    if (this.config.then && this.config.then !== callback)
      throw new Error(`Cannot set multiple then callbacks on a Resolvable (${this.id})`);
    this.config.then = callback;
    this.promise.then((value) => (log(`Calling then callback for Resolvable (${this.id}) with value:`, value), callback(value)));
    return this;
  }
  catch(callback) {
    if (this.config.catch && this.config.catch !== callback)
      throw new Error(`Cannot set multiple catch callbacks on a Resolvable (${this.id})`);
    this.config.catch = callback;
    this.promise.catch((reason) => (log(`Calling catch callback for Resolvable (${this.id}) with reason:`, reason), callback(reason)));
    return this;
  }
  // TODO: Abstractify then/catch(/finally?) into a single function
  get resolved() {
    return !this.inProgress;
  }
  get previousResolved() {
    return this.config.previousResolved;
  }
  get everResolved() {
    return this.resolved || !!this.previousResolved;
  }
  get id() {
    return this.config.id;
  }
  get lastPromise() {
    return this.config.previousPromise ?? this.promise;
  }
  resolve(value) {
    if (this.resolved)
      throw new Error("Cannot resolve a Resolvable that is already resolved.");
    if (this.config.prohibitResolve)
      throw new Error("This Resolvable is configured to prohibit resolve. Set config.prohibitResolve to false to allow resolve.");
    this._resolve(value);
    this.resolvedWith = value;
    this.inProgress = false;
    this.config.previousPromise = this.promise;
    this.config.previousResolved = Date.now();
    log(`Resolved ${this.id} with`, value);
  }
  resolveIfInProgress(value) {
    this.inProgress && this.resolve(value);
  }
  reject(reason) {
    this._reject(reason);
    this.inProgress = false;
  }
  restart(value) {
    this.resolve(value);
    this.start();
  }
  // reset as an alias for backwards compatibility
  reset(value) {
    this.restart(value);
  }
  start(okayIfInProgress = false) {
    if (this.inProgress)
      if (okayIfInProgress)
        return log.always.yellow(`Resolvable ${this.id} is already in progress. Skipping start.`);
      else
        throw new Error(`Resolvable ${this.id} is already in progress. Cannot start.`);
    Object.assign(this, new Resolvable({
      ...this.config,
      startResolved: false
    }));
  }
  startIfNotInProgress() {
    if (!this.inProgress)
      this.start();
  }
  async restartAfterWait() {
    while (this.inProgress)
      await this.promise;
    this.start();
  }
  static resolvedWith(value) {
    return new Resolvable({
      startResolved: true,
      startResolvedWith: value
    }, "resolvedWith");
  }
  static resolved() {
    return new Resolvable({ startResolved: true }, "resolved");
  }
  static after(occurrenceOrInit) {
    const occurrence = is.function(occurrenceOrInit) ? $try(
      occurrenceOrInit,
      (error) => Promise.reject(error)
    ) : occurrenceOrInit;
    const resolvable = new Resolvable({
      prohibitResolve: true
    }, "after");
    log(`Created resolvable ${resolvable.id}, resolving after ${occurrence}`);
    occurrence.then(() => {
      log(`Resolvable ${resolvable.id} is now allowed to resolve`);
      resolvable.config.prohibitResolve = false;
      resolvable.resolve();
    }).catch((error) => {
      log.always.red(`Resolvable ${resolvable.id} rejected with`, error.toString().split("\n")[0]);
      resolvable.reject(error);
    });
    return resolvable;
  }
  static all(resolvables) {
    const allResolvable = new Resolvable({
      prohibitResolve: true
    }, "all");
    const values = [];
    let leftUnresolved = resolvables.length;
    log(`Created resolvable ${allResolvable.id}, resolving after resolvables ${_.map(resolvables, "id")}`);
    resolvables.forEach((resolvable, index) => {
      resolvable.promise.then((value) => {
        values[index] = value;
        log(`Resolvable ${resolvable.id} resolved with`, value);
      }).catch((error) => {
        log.always.red(`Resolvable ${resolvable.id} rejected with`, error.toString().split("\n")[0]);
      }).finally(() => {
        leftUnresolved && leftUnresolved--;
        log(`${leftUnresolved} resolvables left unresolved`);
        if (!leftUnresolved) {
          log("No more unresolved resolvables, resolving allResolvable", allResolvable.id, "with", values);
          allResolvable.config.prohibitResolve = false;
          allResolvable.resolve(values);
        }
      });
    });
    return allResolvable;
  }
  // static get(id?: string) {
  //   return id ? resolvables[id] : resolvables;
  // };
}

function setReliableTimeout(callback, timeout) {
  const startTime = Date.now();
  return setTimeout(() => {
    const actualTimePassed = Date.now() - startTime;
    callback(actualTimePassed);
  }, timeout);
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

function undefinedIfFalsey(value) {
  return value || void 0;
}

exports.$as = $as;
exports.$do = $do;
exports.$if = $if;
exports.$throw = $throw;
exports.$thrower = $thrower;
exports.$try = $try;
exports.$with = $with;
exports.GroupListener = GroupListener;
exports.Resolvable = Resolvable;
exports.addProperties = addProperties;
exports.aint = aint;
exports.aliasify = aliasify;
exports.also = also;
exports.ansiColors = ansiColors;
exports.ansiPrefixes = ansiPrefixes;
exports.assert = assert;
exports.assign = assign;
exports.assignTo = assignTo;
exports.both = both;
exports.callIts = callIts;
exports.camelize = camelize;
exports.chainified = chainified;
exports.check = check;
exports.coloredEmojis = coloredEmojis;
exports.commonPredicates = commonPredicates;
exports.commonTransforms = commonTransforms;
exports.compileTimeError = compileTimeError;
exports.conformsToTypeguardMap = conformsToTypeguardMap;
exports.createEnv = createEnv;
exports.doWith = doWith;
exports.does = does;
exports.doesnt = doesnt;
exports.download = download;
exports.downloadAsStream = downloadAsStream;
exports.either = either;
exports.ensure = ensure;
exports.ensureProperty = ensureProperty;
exports.envCase = envCase;
exports.envKeys = envKeys;
exports.evaluate = evaluate;
exports.everyItem = everyItem;
exports.forceUpdateNpmLinks = forceUpdateNpmLinks;
exports.functionThatReturns = functionThatReturns;
exports.genericTypeguard = genericTypeguard;
exports.getHeapUsedMB = getHeapUsedMB;
exports.getNpmLinks = getNpmLinks;
exports.getProp = getProp;
exports.give = give;
exports.give$ = give$;
exports.go = go;
exports.groupListeners = groupListeners;
exports.has = has;
exports.humanize = humanize;
exports.ifGeneric = ifGeneric;
exports.is = is;
exports.isAmong = isAmong;
exports.isArray = isArray;
exports.isCamelCase = isCamelCase;
exports.isExactly = isExactly;
exports.isInstanceOf = isInstanceOf;
exports.isJsonable = isJsonable;
exports.isJsonableObject = isJsonableObject;
exports.isKindOf = isKindOf;
exports.isLike = isLike;
exports.isPrimitive = isPrimitive;
exports.isTyped = isTyped;
exports.isTypeguardMap = isTypeguardMap;
exports.isnt = isnt;
exports.its = its;
exports.jsObjectString = jsObjectString;
exports.jsonClone = jsonClone;
exports.jsonEqual = jsonEqual;
exports.labelize = labelize;
exports.lazily = lazily;
exports.logger = logger;
exports.loggerInfo = loggerInfo;
exports.mapKeysDeep = mapKeysDeep;
exports.merge = merge;
exports.meta = meta;
exports.mutate = mutate;
exports.not = not;
exports.objectWithKeys = objectWithKeys;
exports.paint = paint;
exports.parseSwitch = parseSwitch;
exports.parseTransform = parseTransform;
exports.pipe = pipe;
exports.please = please;
exports.pushToStack = pushToStack;
exports.respectively = respectively;
exports.serializable = serializable;
exports.serialize = serialize;
exports.serializer = serializer;
exports.setLastLogIndex = setLastLogIndex;
exports.setReliableTimeout = setReliableTimeout;
exports.shift = shift;
exports.shiftTo = shiftTo;
exports.shouldNotBe = shouldNotBe;
exports.thisable = thisable;
exports.to = to;
exports.toType = toType;
exports.transform = transform;
exports.tuple = tuple;
exports.unEnvCase = unEnvCase;
exports.unEnvKeys = unEnvKeys;
exports.undefinedIfFalsey = undefinedIfFalsey;
exports.viteConfigForNpmLinks = viteConfigForNpmLinks;
exports.withLogFile = withLogFile;
exports.wrap = wrap;
