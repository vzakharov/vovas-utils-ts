import { config } from 'dotenv';
config();
// console.log("Environment variables:", process.env);

import _ from "lodash";
import { Dict, ServerError } from "~~/utils/types";
import { ensureProperty } from "~~/utils/ensure";

export interface CreateEnvOptions<T> {
  missingEnvs?: Partial<T>;
  presentEnvs?: Partial<T>;
}

export default function createEnv<T>(descriptor: T, options: CreateEnvOptions<T> = {}): T {

  const { missingEnvs, presentEnvs } = options;
  const env: T = {} as T;
  for ( const key of Object.getOwnPropertyNames(descriptor) ) {
    const keyOfT = key as keyof T;
    const description = descriptor[keyOfT] as string;
    const envKey = _.snakeCase(key).toUpperCase();
    try {
      env[keyOfT] = ensureProperty(process.env, envKey, description);
      if ( presentEnvs )
        presentEnvs[keyOfT] = env[keyOfT];
    } catch (e: any) {
      if ( missingEnvs )
        missingEnvs[keyOfT] = description as any;
      Object.defineProperty(env, keyOfT, {
        get() {
          throw new ServerError(500, `Missing env ${envKey}`, { type: 'missingEnv' });
        }
      });
      console.log(`WARNING: Missing env ${envKey} (${description}). Not throwing error until it is attempted to be used.`);
    }
  }

  return env as T;
}

export const envCase = (string: string) => _.snakeCase(string).toUpperCase();
export const unEnvCase = _.camelCase;

function keyConverter<T extends Dict>(converter: (key: string) => string): (dict: T) => T {
  return (dict: T) => _.mapKeys(dict, (value, key) => converter(key)) as T;
}

export const envKeys: <T extends Dict>(dict: T) => T = keyConverter(envCase);
export const unEnvKeys: <T extends Dict>(dict: T) => T = keyConverter(unEnvCase);