import { Logger } from "../logging/logger.ts";

/**
 * Uppercase the first character of a string
 * 
 * @deprecated Please use Inflector.lcfirst() instead.
 * @param input
 */
export function lcfirst(input: string): string {
  Logger.debug('Usage of "util/lcfirst" is deprecated, please use "Inflector.lcfirst()" instead.');
  return input.charAt(0).toLowerCase() + input.slice(1);
}
