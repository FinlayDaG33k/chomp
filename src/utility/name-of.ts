/**
 * Get the name of a passes argument
 *
 * TODO: Give this a cleaner API
 *
 * @example
 * ```ts
 * import { nameOf } from "https://deno.land/x/chomp/utility/name-of.ts";
 *
 * const myArgument = true;
 * const name = nameOf({ myArgument });
 * ```
 *
 * @param variable
 */
export const nameOf = (variable: Record<string, unknown>) => Object.keys(variable)[0];
