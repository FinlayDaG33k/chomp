/**
 * Check if input has value, otherwise return a specified default
 *
 * @param input
 * @param defaultValue
 */
export function valueOrDefault(input: unknown, defaultValue: unknown): unknown {
  return input ?? defaultValue;
}
