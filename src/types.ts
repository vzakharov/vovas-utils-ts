export type Dict<T = any> = {
  [key: string]: T;
} | Promise<Dict>;