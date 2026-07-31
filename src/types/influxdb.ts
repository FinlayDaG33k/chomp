export enum Precision {
  s,
  ms,
  us,
  ns,
}

export interface Api {
  url: string;
  auth: string;
  precision: Precision;
}
