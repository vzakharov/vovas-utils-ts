
export function ensured<T, G extends T>(typeguard: (arg: T) => arg is G) {
  return {
    else: (fallback: G) => (arg: T) => typeguard(arg) ? arg : fallback
  };
};