import _ from "lodash";
import { Dict } from "./types.js";
import { ensureProperty } from "./ensure.js";

export interface CreateEnvResult<T> {
  env: T;
  missingEnvs?: Partial<T>;
  presentEnvs?: Partial<T>;
}

export type CreateEnvOptions = {
  missingKeyError?: (key: string) => Error;
}

export default function createEnv<T>(descriptor: T, options: CreateEnvOptions = {}): CreateEnvResult<T> {

  const env: T = {} as T;
  const missingEnvs: Partial<T> = {};
  const presentEnvs: Partial<T> = {};
  for ( const key of Object.getOwnPropertyNames(descriptor) ) {
    const keyOfT = key as keyof T;
    const description = descriptor[keyOfT] as string;
    const ENV_KEY = _.snakeCase(key).toUpperCase();
    try {
      env[keyOfT] = ensureProperty(process.env, ENV_KEY, description);
      if ( presentEnvs )
        presentEnvs[keyOfT] = env[keyOfT];
    } catch (e: any) {
      if ( missingEnvs )
        missingEnvs[keyOfT] = description as any;
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

export const envCase = (string: string) => _.snakeCase(string).toUpperCase();
export const unEnvCase = _.camelCase;

function keyConverter<T extends Dict>(converter: (key: string) => string): (dict: T) => T {
  return (dict: T) => _.mapKeys(dict, (value, key) => converter(key)) as T;
}

export const envKeys: <T extends Dict>(dict: T) => T = keyConverter(envCase);
export const unEnvKeys: <T extends Dict>(dict: T) => T = keyConverter(unEnvCase);