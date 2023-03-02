export default function ensure<T>(x: T | undefined | null, variableName?: string): T {
  if (typeof x === 'undefined' || x === null) {
    throw new Error(
      variableName ?
        `${variableName} is undefined.` :
        "A variable is undefined. Check the call stack to see which one."
    )
  }
  return x;
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
      throw new Error(`Property ${String(keyOfObj)} is undefined.`);
    }
    if ( requiredType && typeof obj[keyOfObj] !== requiredType ) {
      throw new Error(`Property ${String(keyOfObj)} is not of type ${requiredType}.`);
    } else if ( validate ) {
      if ( !validate(obj[keyOfObj]) ) {
        throw new Error(`Property ${String(keyOfObj)} is invalid.`);
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