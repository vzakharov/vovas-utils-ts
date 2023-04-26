export function ensure<T>(x: T | undefined | null, variableName?: string): T
export function ensure<T>(x: T | undefined, variableName?: string): T 
export function ensure<T>(x: T | null, variableName?: string): T
export function ensure<T, U>(x: T | U, typeguard: (x: T | U) => x is T): T
// export function ensure<T>(x: T | undefined | null, variableName?: string): T {
export function ensure<T, U>(x: T | U, typeguardOrVariableName?: ((x: T | U) => x is T) | string): T {
  if (typeof typeguardOrVariableName === 'string' || typeof typeguardOrVariableName === 'undefined') {
    const variableName = typeguardOrVariableName;
    if (typeof x === 'undefined' || x === null) {
      throw new Error(
        variableName ?
          `${variableName} is undefined.` :
          "A variable is undefined. Check the call stack to see which one."
      )
    }
    return x as T;
  } else {
    const typeguard = typeguardOrVariableName;
    if (!typeguard(x)) {
      throw new Error("Value does not match typeguard.")
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