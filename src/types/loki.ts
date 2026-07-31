export interface LokiStream {
  // deno-lint-ignore no-explicit-any -- TODO
  stream: any;
  values: Array<Array<string>>;
}
