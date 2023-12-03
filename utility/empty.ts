/**
 * Check whether the input is set and empty
 *
 * @param input
 * @returns boolean
 */
export default function empty(input: string|any[]|null): boolean {
  if(!input) return true;
  if(typeof input === "string") return input === "";
  return input.length === 0;
}
