import { NonTypeguard, Predicate, Typeguard } from "../typings";

export function either<Arg, Guarded1 extends Arg, Guarded2 extends Arg>(
  typeguard1: Typeguard<Arg, Guarded1>,
  typeguard2: Typeguard<Arg, Guarded2>
): Typeguard<Arg, Guarded1 | Guarded2>;

export function either<Arg>(
  predicate1: NonTypeguard<Arg>,
  predicate2: NonTypeguard<Arg>
): NonTypeguard<Arg>;

// Note: We're not implementing mixed typeguard/non-typeguard overloads, as, for `check` uses, it would mean that the further `if` checks would be type-narrowed, which is not what we want.
// TODO: Think of how to implement this in a way that doesn't break type-narrowing for `check` uses.

// implementation
export function either<Arg>(...predicates: Predicate<Arg>[]) {
  return (arg: Arg) => predicates.some(predicate => predicate(arg));
};