import { Logger } from "../logging/logger.ts";

export function lcfirst(input: string): string {
  Logger.debug('Usage of "util/lcfirst" is deprecated, please use "util/inflector#lcfirst" instead.');
  return input.charAt(0).toLowerCase() + input.slice(1);
}
