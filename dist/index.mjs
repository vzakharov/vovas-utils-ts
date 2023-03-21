import _ from 'lodash';
import fs from 'fs';
import https from 'https';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import childProcess from 'child_process';

function $throw(errorOrMessage) {
  throw typeof errorOrMessage === "string" ? new Error(errorOrMessage) : errorOrMessage;
}
function $thrower(errorOrMessage) {
  return () => $throw(errorOrMessage);
}

function getItemNames(itemStringOrArrayOrObject) {
  const itemNames = $switch(itemStringOrArrayOrObject).if(_.isString, _.castArray).if(_.isArray, (array) => array.map(_.toString)).if(_.isObject, _.keys).else($thrower("Expected string, array or object"));
  return itemNames;
}
function warp(value) {
  function recursion() {
    return {
      if: recursion,
      else() {
        return value;
      }
    };
  }
  return recursion();
}
function $if(argOrCondition, typeguardOrTypeOrTransform, transformOrNothing) {
  if (_.isBoolean(argOrCondition))
    return ifWithCondition(argOrCondition, typeguardOrTypeOrTransform);
  const arg = argOrCondition;
  const typeguardOrType = typeguardOrTypeOrTransform;
  const typeguard = _.isFunction(typeguardOrType) ? typeguardOrType : is(typeguardOrType);
  const transform = transformOrNothing;
  if (typeguard(arg)) {
    return warp(transform(arg));
  }
  return $switch(arg);
}
function ifWithCondition(condition, transform) {
  if (condition) {
    return warp(transform());
  }
  return {
    if(condition2, transform2) {
      return ifWithCondition(condition2, transform2);
    },
    else(transform2) {
      return transform2();
    }
  };
}
function $switch(arg) {
  function _if(typeguardOrType, transform) {
    return $if(
      arg,
      _.isFunction(typeguardOrType) ? typeguardOrType : is(typeguardOrType),
      transform
    );
  }
  return {
    if: _if,
    else(transform) {
      return transform(arg);
    }
  };
}
function isDefined(value) {
  return !_.isUndefined(value);
}
function $(value) {
  return (...args) => value;
}
function itself(value) {
  return value;
}
function themselves(values) {
  return values;
}
function guard(checker) {
  return checker;
}
function is(valueToCheck) {
  return function isNarrowType(value) {
    return value === valueToCheck;
  };
}
function map(transform) {
  return (items) => items.map(transform);
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

function go(callback, arg) {
  const recurse = (arg2) => go(callback, arg2);
  return callback(arg, recurse);
}
function goer(callback) {
  return (arg) => go(callback, arg);
}

function humanize(str) {
  return _.capitalize(_.startCase(str));
}
function labelize(values) {
  return values.map((value) => ({ value, label: humanize(value) }));
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
  if (typeof index === "undefined") {
    logger("always").yellow("Warning: logger index is not set, this will not log anything. Set to 0 explicitly to remove this warning. Set to 'always' to always log.");
  }
  if (index && index !== "always" && index > loggerInfo.lastLogIndex) {
    setLastLogIndex(index);
  }
  function _log(options, ...args) {
    const { color, serializeAs } = _.defaults(options, defaultOptions);
    if (loggerInfo.logAll || index === "always" || index === loggerInfo.lastLogIndex) {
      console.log(...args.map(
        (arg) => String(
          isPrimitive(arg) ? arg : _.isFunction(arg) ? arg.toString() : $try(() => serializer[serializeAs](arg), arg)
        ).split("\n").map(paint[color]).join("\n")
      ));
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

function jsonClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function jsonEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
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
  // constructor(previousResolved?: UnixTimestamp) {
  constructor({ previousResolved, startResolved, startResolvedWith } = {}) {
    this.inProgress = true;
    // _resolve: () => void = () => {};
    this._resolve = () => {
    };
    this._reject = () => {
    };
    // promise = new Promise<void>((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
    this.promise = new Promise((_resolve, _reject) => {
      Object.assign(this, { _resolve, _reject });
    });
    this.previousResolved = previousResolved;
    if (startResolved) {
      this.promise = Promise.resolve(ensure(startResolvedWith));
      this.inProgress = false;
    }
  }
  // resolve() {
  resolve(value) {
    this._resolve(value);
    this.inProgress = false;
  }
  reject(reason) {
    this._reject(reason);
    this.inProgress = false;
  }
  // reset() {
  reset(value) {
    this.resolve(value);
    Object.assign(this, new Resolvable({ previousResolved: Date.now() }));
  }
}

function reverseArgs(func) {
  return (...args) => func(...args.reverse());
}

function typed(type) {
  return (object) => Object.assign(object, { type });
}
function isTyped(type) {
  return function(object) {
    return object.type === type;
  };
}

function wrap(func, ...args) {
  return (target) => func(target, ...args);
}

export { $, $as, $if, $switch, $throw, $thrower, $try, Resolvable, ansiColors, ansiPrefixes, assert, createEnv, doWith, download, downloadAsStream, ensure, ensureProperty, envCase, envKeys, forceUpdateNpmLinks, functionThatReturns, getItemNames, getNpmLinks, go, goer, guard, humanize, is, isDefined, isPrimitive, isTyped, itself, jsObjectString, jsonClone, jsonEqual, labelize, logger, loggerInfo, map, paint, respectively, reverseArgs, serializer, setLastLogIndex, themselves, typed, unEnvCase, unEnvKeys, viteConfigForNpmLinks, wrap };
