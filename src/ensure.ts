export function ensure<T>(x: T | undefined | null, errorMessage?: string): T
export function ensure<T>(x: T | undefined, errorMessage?: string): T 
export function ensure<T>(x: T | null, errorMessage?: string): T
export function ensure<T extends U, U>(x: U, typeguard: (x: U) => x is T, errorMessage?: string): T

export function ensure<T, U>(
  x: T | U, 
  typeguardOrErrorMessage?: ((x: T | U) => x is T) | string,
  errorMessage?: string
): T {
  if (typeof typeguardOrErrorMessage === 'string' || typeof typeguardOrErrorMessage === 'undefined') {
    errorMessage = typeguardOrErrorMessage;
    if (typeof x === 'undefined' || x === null) {
      throw new Error(
        errorMessage ?? "A variable is undefined. Check the call stack to see which one."
      )
    }
    return x as T;
  } else {
    const typeguard = typeguardOrErrorMessage;
    if (!typeguard(x)) {
      throw new Error(errorMessage ?? `Variable ${x} did not pass typeguard ${typeguard.name}.`);
    }
    return x;
  }
}

export type CouldBeNullOrUndefined<T> = ( T | undefined | null ) | ( T | undefined ) | ( T | null );

export function assert<T>(x: CouldBeNullOrUndefined<T>, variableName?: string): asserts x is T {
  ensure(x, variableName);
}

export interface EnsurePropertyOptions {
  requiredType?: string;
  validate?: (value: any) => boolean;
  messageIfInvalid?: string;
}

// export function ensureProperty<T = void>(
//   obj: any, key: string, messageIfInvalid?: string
// ): T;
// export function ensureProperty<T = void>(
//   obj: any, key: string, options: EnsurePropertyOptions
// ): T;
export function ensureProperty<Result, Container = any>(
  obj: Container, key: string, optionsOrMessageIfInvalid: EnsurePropertyOptions | string = {}
): Result {

  const keyOfObj = key as keyof Container;

  const options: EnsurePropertyOptions =
    typeof optionsOrMessageIfInvalid === 'string'
      ? { messageIfInvalid: optionsOrMessageIfInvalid }
      : optionsOrMessageIfInvalid;
  const { requiredType, validate, messageIfInvalid } = options;

  try {
    if ( typeof obj[keyOfObj] === 'undefined' ) {
      throw new Error(`Property ${String(keyOfObj)} is undefined: ${JSON.stringify(obj)}`);
    }
    if ( requiredType && typeof obj[keyOfObj] !== requiredType ) {
      throw new Error(`Property ${String(keyOfObj)} is not of type ${requiredType}: ${JSON.stringify(obj)}`);
    } else if ( validate ) {
      if ( !validate(obj[keyOfObj]) ) {
        throw new Error(`Property ${String(keyOfObj)} is invalid: ${JSON.stringify(obj)}`);
      }
    }
  } catch (e: any) {
    if ( messageIfInvalid ) {
      e.message += `\n${messageIfInvalid}`;
    }
    throw e;
  }
  return obj[keyOfObj] as Result;
}