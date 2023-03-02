import _ from "lodash";
import { ensureProperty } from "./ensure.js";
export function createEnv(descriptor, options = {}) {
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
        }
        catch (e) {
            if (missingEnvs)
                missingEnvs[keyOfT] = description;
            Object.defineProperty(env, keyOfT, {
                get() {
                    throw options.missingKeyError?.(ENV_KEY) ?? new Error(`Missing env ${ENV_KEY}`);
                }
            });
            console.log(`WARNING: Missing env ${ENV_KEY} (${description}). Not throwing error until it is attempted to be used.`);
        }
    }
    return { env, missingEnvs, presentEnvs };
}
export const envCase = (string) => _.snakeCase(string).toUpperCase();
export const unEnvCase = _.camelCase;
function keyConverter(converter) {
    // return (dict: T) => _.mapKeys(dict, (value, key) => converter(key)) as T;
    return (dict) => _.mapKeys(dict, (value, key) => converter(key));
}
export const envKeys = keyConverter(envCase);
export const unEnvKeys = keyConverter(unEnvCase);
