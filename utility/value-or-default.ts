/**
 * Check if input has value, otherwise return a specified default
 *
 * @param input
 * @param defaultValue
 */
export function valueOrDefault<T>(input: T|undefined|null, defaultValue: T|null = null): T {
  return input ?? defaultValue as T;
}
