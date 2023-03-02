import { Dict } from "./types.js";
export interface CreateEnvResult<T> {
    env: T;
    missingEnvs?: Partial<T>;
    presentEnvs?: Partial<T>;
}
export type CreateEnvOptions = {
    missingKeyError?: (key: string) => Error;
};
export declare function createEnv<T>(descriptor: T, options?: CreateEnvOptions): CreateEnvResult<T>;
export declare const envCase: (string: string) => string;
export declare const unEnvCase: (string?: string | undefined) => string;
export declare const envKeys: <T extends Dict>(dict: T) => T;
export declare const unEnvKeys: <T extends Dict>(dict: T) => T;
