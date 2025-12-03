/**
 * Check whether the input is set and empty
 *
 * // TODO: Finish documentation
 *
 * @param input
 * @returns boolean
 */
export function empty(input: unknown): boolean {
  // Check if undefined
  if(input === undefined) return true;

  // Check if null
  if(input === null) return true;

  // Check if empty string
  if(input === "") return true;

  // Check if empty array
  if(Array.isArray(input) && input.length === 0) return true;

  // Check if empty object
  if(typeof input === "object" && Object.keys(input).length === 0) return true;

  // We have something inside
  return false;
}
