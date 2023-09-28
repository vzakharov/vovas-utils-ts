export function itself<T>(arg: T): T {
  return arg;
};

export function itselfIf<T, G extends T>(typeguard: (arg: T) => arg is G) {
  return {
    else: (defaultValue: G) => (arg: T) => typeguard(arg) ? arg : defaultValue
  };
};