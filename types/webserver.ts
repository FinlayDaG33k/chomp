export interface ViewVariable {
  [key: string]: string | number | unknown;
}

export interface RequestParameters {
  [name: string]: string;
}

export interface QueryParameters {
  [name: string]: string;
}

export interface ResponseHeader {
  [key: string]: string;
}

export interface RegistryItem {
  [key: string]: any;
}

export interface HandlebarsCacheItem {
  // deno-lint-ignore ban-types -- TODO
  [key: string]: Function;
}

export interface Route {
  path: string;
  controller: string;
  action: string;
  method?: string;
}

/**
 * Tokenizer results.
 */
export interface LexToken {
  type:
    | "OPEN"
    | "CLOSE"
    | "PATTERN"
    | "NAME"
    | "CHAR"
    | "ESCAPED_CHAR"
    | "MODIFIER"
    | "END";
  index: number;
  value: string;
}

export interface RegexpToFunctionOptions {
  /**
   * Function for decoding strings for params.
   */
  decode?: (value: string, token: Key) => string;
}

/**
 * A match result contains data about the path match.
 */
export interface MatchResult<P extends object = object> {
  path: string;
  index: number;
  params: P;
}

/**
 * A match is either `false` (no match) or a match result.
 */
export type Match<P extends object = object> = false | MatchResult<P>;

/**
 * The match function takes a string and returns whether it matched the path.
 */
export type MatchFunction<P extends object = object> = (
  path: string,
) => Match<P>;


/**
 * Metadata about a key.
 */
export interface Key {
  name: string | number;
  prefix: string;
  suffix: string;
  pattern: string;
  modifier: string;
}

/**
 * A token is a string (nothing special) or key metadata (capture group).
 */
export type Token = string | Key;

export interface TokensToRegexpOptions {
  /**
   * When `true` the regexp will be case sensitive. (default: `false`)
   */
  sensitive?: boolean;
  /**
   * When `true` the regexp won't allow an optional trailing delimiter to match. (default: `false`)
   */
  strict?: boolean;
  /**
   * When `true` the regexp will match to the end of the string. (default: `true`)
   */
  end?: boolean;
  /**
   * When `true` the regexp will match from the beginning of the string. (default: `true`)
   */
  start?: boolean;
  /**
   * Sets the final character for non-ending optimistic matches. (default: `/`)
   */
  delimiter?: string;
  /**
   * List of characters that can also be "end" characters.
   */
  endsWith?: string;
  /**
   * Encode path tokens for use in the `RegExp`.
   */
  encode?: (value: string) => string;
}

/**
 * Supported `path-to-regexp` input types.
 */
export type Path = string | RegExp | Array<string | RegExp>;

export type PathFunction<P extends object = object> = (data?: P) => string;


export interface TokensToFunctionOptions {
  /**
   * When `true` the regexp will be case sensitive. (default: `false`)
   */
  sensitive?: boolean;
  /**
   * Function for encoding input strings for output.
   */
  encode?: (value: string, token: Key) => string;
  /**
   * When `false` the function can produce an invalid (unmatched) path. (default: `true`)
   */
  validate?: boolean;
}

export interface ParseOptions {
  /**
   * Set the default delimiter for repeat parameters. (default: `'/'`)
   */
  delimiter?: string;
  /**
   * List of characters to automatically consider prefixes when parsing.
   */
  prefixes?: string;
}
