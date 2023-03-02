export type Dict<T = any> = {
  [key: string]: T;
} | Promise<Dict>;

export type UnixTimestamp = number;