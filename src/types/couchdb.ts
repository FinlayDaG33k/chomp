export type Auth = {
  username: string;
  password: string;
}

export type CouchRequest = {
  method: string;
  // deno-lint-ignore no-explicit-any -- TODO: Figure out proper type
  headers: any;
  body?: string;
}

export type CachedResponse = {
  etag: string;
  data: CouchResponse;
}

export type CouchFailure = [
  // Error data
    { error: string; reason: string; } | undefined,

  // No document
  undefined,

  // HTTP Status code
  number,
]

export type CouchSuccess = [
  // No error
  undefined,

  // Document
  // deno-lint-ignore no-explicit-any -- TODO: Figure out proper type
  DocumentHeader & any,

  // HTTP Status code
  number,
]

export type CouchResponse = CouchSuccess|CouchFailure;

export interface CouchOverrides {
  /**
   * Override the request method
   */
  method?: string;

  /**
   * Override the request E-Tag for caching
   */
  etag?: string;

  /**
   * Run request on root (ignoring database field).
   * Can be used to call endpoints on the node itself (eg. "_up").
   */
  root?: boolean;
}

export type DocumentHeader = {
  _id: string;
  _rev?: string;
}
