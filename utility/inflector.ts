import { Cache } from "../core/cache.ts";
import { Configure } from "../core/configure.ts";

/**
 * Quickly inflect text in common ways.
 * Idea and code primarily based on CakePHP's code.
 *
 * You can change the expiry time using the `chomp_inflector_cache_ttl` configuration key.
 * Otherwise this will default to `+10 minutes`.
 *
 * // TODO: Finish documentation
 */
export class Inflector {
  /**
   * Return input string with first character uppercased.
   *
   * @param input
   */
  public static ucfirst(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  /**
   * Return input string with first character lowercased.
   *
   * @param input
   */
  public static lcfirst(input: string): string {
    return input.charAt(0).toLowerCase() + input.slice(1);
  }

  /**
   * Turn a string into PascalCase.
   *
   * @param input
   * @param delimiter Optional delimiter by which to split the string
   */
  public static pascalize(input: string, delimiter: string = "_"): string {
    // Try to look up in cache
    const type = `pascalize${delimiter}`;
    let result = Inflector._cache(type, input);

    // Inflect on cache miss and add to cache
    if(!result) {
      // Humanize then remove spaces
      result = this
        .humanize(input, delimiter)
        .replaceAll(" ", "");

      // Add to Cache
      Inflector._cache(type, input, result);
    }

    return result;
  }

  /**
   * Turn a string into camelCase
   *
   * @param input
   * @param delimiter Optional delimiter by which to split the string
   */
  public static camelize(input: string, delimiter: string = "_"): string {
    return this.lcfirst(this.pascalize(input, delimiter));
  }

  /**
   * Return the input lower_case_delimited_string as "A Human Readable String".
   * (Underscores are replaced by spaces and capitalized following words.)
   *
   * @param input
   * @param delimiter
   */
  public static humanize(input: string, delimiter: string = "_"): string {
    // Try to look up in cache
    const type = `humanize${delimiter}`;
    let result = Inflector._cache(type, input);

    // Inflect on cache miss and add to cache
    if(!result) {
      // Split our string into tokens
      const tokens: string[] = input
        .split(delimiter);

      // Uppercase each of the tokens
      for (let i = 0; i < tokens.length; i++) {
        tokens[i] = this.ucfirst(tokens[i]);
      }

      // Join tokens
      result = tokens.join(" ");

      // Add to cache
      Inflector._cache(type, input, result);
    }

    // Join tokens into a string and return
    return result;
  }

  /**
   * Returns the input CamelCasedString as a dashed-string and replace underscores with dashes
   *
   * @param input
   */
  public static dasherize(input: string): string {
    return Inflector.delimit(input.replaceAll('_', '-'), '-');
  }

  /**
   * Expects a CamelCasedInputString, and produces a lower_case_delimited_string
   *
   * @param input
   * @param delimiter
   */
  public static delimit(input: string, delimiter: string = '_'): string {
    // Try to look up in cache
    const type = `delimit${delimiter}`;
    let result = Inflector._cache(type, input);

    // Inflect on cache miss and add to cache
    if(!result) {
      // Inflect
      result = input
        .replaceAll(/(?<=\w)([A-Z])/g, delimiter + '$1')
        .toLowerCase();

      // Add to cache
      Inflector._cache(type, input, result);
    }

    return result;
  }

  /**
   * Cache inflected valued and return if already available
   *
   * @param type Inflection type
   * @param key Original value
   * @param value Inflected value to cache
   * @returns Inflected value on cache hit or false on cache miss
   * @private
   */
  private static _cache(type: string, key: string, value: string|false = false): string|false {
    // Build cache key
    const cacheKey = `chomp inflector ${type} "${key}"`;

    // Add to cache
    if(value !== false) {
      Cache.set(cacheKey, value, Configure.get('chomp_inflector_cache_ttl', '+10 minutes'));
      return value;
    }

    // Try to get from cache
    const cached = Cache.get(cacheKey, true) as string|null;
    if(cached !== null) return cached;

    // No result
    return false;
  }
}
