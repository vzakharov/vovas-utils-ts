export type Transform = (arg: any) => any;

export type TransformsFrom<Tfrm extends Transform> =
  Tfrm extends (arg: infer From) => any
    ? From
    : never;

export type TransformsTo<Tfrm extends Transform> =
  Tfrm extends (arg: any) => infer To
    ? To
    : never;