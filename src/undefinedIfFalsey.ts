export function undefinedIfFalsey<T>( value: T ): T | undefined {
  return value || undefined;
}