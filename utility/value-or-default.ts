/**
 * Check if input has value, otherwise return a specified default
 *
 * @param input
 * @param defaultValue
 */
export function valueOrDefault(input: unknown, defaultValue: unknown): unknown {
  // Check if undefined
  if(input === undefined) return defaultValue;

  // Check if null
  if(input === null) return defaultValue;

  // We have a value just return the input
  return input;
}
