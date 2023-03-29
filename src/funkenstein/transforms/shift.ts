import { merge } from "../../merge";

export type ShiftDirection = 'left' | 'right';

export type AllowedShiftArgs<Direction extends ShiftDirection, OutArgs extends any[]> =
  Direction extends 'left'
    ? [undefined, ...OutArgs]
    : [...OutArgs, undefined];

export type ShiftFunction<Direction extends ShiftDirection> = <OutArgs extends any[]>(direction: Direction) =>
  (
    ...args: AllowedShiftArgs<Direction, OutArgs>
  ) => OutArgs;

export type Shift = {
  <Direction extends ShiftDirection>(direction: Direction): ShiftFunction<Direction>;
} & {
  [Direction in ShiftDirection]: ShiftFunction<Direction>;
};

export const shift = merge(

  function <Direction extends ShiftDirection, OutArgs extends any[]>(direction: Direction) {
    return function (...args: AllowedShiftArgs<Direction, OutArgs>) {
      return direction === 'left'
        ? args.slice(1)
        : args.slice(0, -1);
    };
  }, shift => ({

    left: shift('left'),
    right: shift('right'),

  })

);

// shift('left')(undefined, 2, 3); // [2, 3]
// shift.right(1, 2, undefined); // [1, 2]
// shift('left')(1, 2, 3); // Error: Type '1' is not assignable to type 'undefined'.
// shift.right(1, 2, 3); // Error: Type '3' is not assignable to type 'undefined'.
