import _ from 'lodash';
import fs from 'fs';
import yaml from 'js-yaml';

function $try(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    return _.isFunction(fallback) ? fallback() : fallback;
  }
}

function isPrimitive(v) {
  const result = _.isString(v) || _.isNumber(v) || _.isBoolean(v) || _.isNull(v) || _.isUndefined(v);
  return result;
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
const loggerInfo = {};
Object.defineProperty(loggerInfo, "lastLogIndex", {
  get() {
    try {
      return fs.existsSync("./logger.json") ? JSON.parse(fs.readFileSync("./logger.json", "utf8")).lastLogIndex : 0;
    } catch (e) {
      if (e instanceof TypeError) {
        return localStorage.getItem("lastLogIndex") || 0;
      }
      throw e;
    }
  },
  set(value) {
    try {
      fs.writeFileSync("./logger.json", JSON.stringify({
        ...loggerInfo,
        lastLogIndex: value
      }, null, 2));
    } catch (e) {
      if (e instanceof TypeError) {
        localStorage.setItem("lastLogIndex", value);
      }
      throw e;
    }
  }
});
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
    loggerInfo.lastLogIndex = index;
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

export { $try as $, ansiPrefixes as a, ansiColors as b, logger as c, isPrimitive as i, loggerInfo as l, paint as p, serializer as s };
