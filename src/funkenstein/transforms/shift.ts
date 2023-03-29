export type ShiftDirection = 'left' | 'right';

export function shiftTo<Direction extends ShiftDirection>(direction: Direction) {
  return function <Args extends any[]>(args: Args) {
    return (
      direction === 'left'
        ? [ ...args.slice(1), undefined ]
        : [ undefined, ...args.slice(0, -1) ]
    ) as Direction extends 'left' ?
      Args extends [any, ...infer Rest] ? [ ...Rest, undefined ] : never
    : Args extends [...infer Rest, any] ? [ undefined, ...Rest ] : never
  };
};

export const shift = {
  left: shiftTo('left'),
  right: shiftTo('right'),
};