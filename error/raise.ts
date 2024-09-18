/**
 * Utility function that throws an error.
 * Band-aid for JS not supporting throwing in null-coalescing.
 *
 * @example Basic Usage
 * ```ts
 * import { raise } from "https://deno.land/x/chomp/error/raise.ts";
 *
 * const myVar = null ?? raise('Error Message');
 * ```
 *
 * @example Custom Error types
 * ```ts
 * import { raise } from "https://deno.land/x/chomp/error/raise.ts";
 *
 * const myVar = null ?? raise('Error Message', 'CustomError');
 *
 * // Will automatically append "Error" to the name
 * const myVar = null ?? raise('Error Message', 'Custom');
 * ```
 *
 * @example Custom Error (using Error-classes)
 * ```ts
 * import { raise } from "https://deno.land/x/chomp/error/raise.ts";
 *
 * class CustomError extends Error {
 *   constructor(public message: string) {
 *     super(message);
 *   }
 * }
 *
 * const myVar = null ?? raise('Error Message', CustomError);
 * ```
 *
 * @param err
 * @param type
 */
export function raise<CustomError extends Error>(err: string, type: string|(new (err: string) => CustomError)|'Error' = 'Error'): never {
  // Check if we want to throw a specific class
  if(typeof type === 'function' && type.prototype instanceof Error) {
    const e = new type(err);
    Error.captureStackTrace(e, raise);
    e.name = type.name;
    throw e;
  }

  // Initialize regular error
  // Then add our stacktrace
  const e = new Error(err);
  Error.captureStackTrace(e, raise);

  // Check if we want to change the name
  if(type !== "Error") e.name = (type as string).slice(-5).toLowerCase() !== "error" ? `${type}Error`: type as string;

  // Throw the error
  throw e;
}
