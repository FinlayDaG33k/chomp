import { Logger } from "../logging/logger.ts";

/**
 * Uppercase the first character of a string
 *
 * @deprecated Please use Inflector.ucfirst() instead.
 * @param input
 */
export function ucfirst(input: string): string {
  Logger.debug('Usage of "util/ucfirst" is deprecated, please use "Inflector.ucfirst()" instead.');
  return input.charAt(0).toUpperCase() + input.slice(1);
}
