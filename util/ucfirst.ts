import { Logger } from "../logging/logger.ts";

export function ucfirst(input: string): string {
  Logger.debug('Usage of "util/ucfirst" is deprecated, please use "util/inflector#ucfirst" instead.');
  return input.charAt(0).toUpperCase() + input.slice(1);
}
