'use strict';

const logger = require('./shared/vovas-utils.f71bc8c1.cjs');
const _ = require('lodash');
const fs = require('fs');
const https = require('https');
const path = require('path');
const os = require('os');
require('js-yaml');

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

function jsObjectString(obj) {
  const seen = [];
  const shared = [];
  function scanForShared(obj2) {
    if (logger.isPrimitive(obj2)) {
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
      if (logger.isPrimitive(obj2)) {
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

function throwError(error) {
  throw typeof error === "string" ? new Error(error) : error;
}

exports.$try = logger.$try;
exports.ansiColors = logger.ansiColors;
exports.ansiPrefixes = logger.ansiPrefixes;
exports.isPrimitive = logger.isPrimitive;
exports.logger = logger.logger;
exports.loggerInfo = logger.loggerInfo;
exports.paint = logger.paint;
exports.serializer = logger.serializer;
exports.Resolvable = Resolvable;
exports.assert = assert;
exports.createEnv = createEnv;
exports.doWith = doWith;
exports.download = download;
exports.downloadAsStream = downloadAsStream;
exports.ensure = ensure;
exports.ensureProperty = ensureProperty;
exports.envCase = envCase;
exports.envKeys = envKeys;
exports.go = go;
exports.goer = goer;
exports.humanize = humanize;
exports.jsObjectString = jsObjectString;
exports.jsonClone = jsonClone;
exports.jsonEqual = jsonEqual;
exports.labelize = labelize;
exports.throwError = throwError;
exports.unEnvCase = unEnvCase;
exports.unEnvKeys = unEnvKeys;
