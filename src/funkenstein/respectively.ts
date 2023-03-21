import { Typeguard } from "./$switch";

export function respectively<BroadType1, NarrowType1 extends BroadType1, BroadType2, NarrowType2 extends BroadType2>(
  typeguard1: Typeguard<BroadType1, NarrowType1>,
  typeguard2: Typeguard<BroadType2, NarrowType2>
): Typeguard<[BroadType1, BroadType2], [NarrowType1, NarrowType2]>;

export function respectively<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3>(
  tg1: Typeguard<BT1, NT1>, tg2: Typeguard<BT2, NT2>, tg3: Typeguard<BT3, NT3>
): Typeguard<[BT1, BT2, BT3], [NT1, NT2, NT3]>;

export function respectively<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3, BT4, NT4 extends BT4>(
  tg1: Typeguard<BT1, NT1>, tg2: Typeguard<BT2, NT2>, tg3: Typeguard<BT3, NT3>, tg4: Typeguard<BT4, NT4>
): Typeguard<[BT1, BT2, BT3, BT4], [NT1, NT2, NT3, NT4]>;

export function respectively<BT1, NT1 extends BT1, BT2, NT2 extends BT2, BT3, NT3 extends BT3, BT4, NT4 extends BT4, BT5, NT5 extends BT5>(
  tg1: Typeguard<BT1, NT1>, tg2: Typeguard<BT2, NT2>, tg3: Typeguard<BT3, NT3>, tg4: Typeguard<BT4, NT4>, tg5: Typeguard<BT5, NT5>
): Typeguard<[BT1, BT2, BT3, BT4, BT5], [NT1, NT2, NT3, NT4, NT5]>;

export function respectively(...typeguards: Typeguard<any, any>[]): Typeguard<any[], any[]> {
  return (values: any[]): values is any[] => {
    return values.every((value, index) => typeguards[index](value));
  }
};