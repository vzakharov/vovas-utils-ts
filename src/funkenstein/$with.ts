// export function $with<T, R>(arg: T, fn: (arg: T) => R): R {
//   return fn(arg);
// }

export function $with<T, R>(arg: T, fn: (arg: T) => R): R

export function $with<T, R>(arg: T): {

  do: (fn: (arg: T) => R) => R

}

export function $with<T, R>(arg: T, fn?: (arg: T) => R) {

  return typeof fn !== 'undefined'
    ? fn(arg)
    : {
      do: (fn: (arg: T) => R) => fn(arg)
    }

};