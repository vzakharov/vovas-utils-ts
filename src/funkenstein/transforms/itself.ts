export const itself = Object.assign(
  <T>(arg: T): T => arg, {
    if: <T, G extends T>( typeguard: (arg: T) => arg is G ) => ({
      else: ( defaultValue: G ) => (arg: T) => typeguard(arg) ? arg : defaultValue
    })
  }
);