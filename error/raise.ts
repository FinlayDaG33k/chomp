/**
 * Utility function that throws an error.
 * Band-aid for JS not supporting throwing in null-coalescing.
 *  
 * @param err
 * @param type
 */
// deno-lint-ignore no-explicit-any ban-types -- TODO
export function raise<TError extends Error>(err: string, type: string|(new (...args: any[]) => TError)|'Error' = 'Error'){
  // Check if we want to throw a regular error
  if(type === "Error") throw new Error(err);
  
  // Check if we want to throw a specific name only
  if(typeof type === "string") {
    if(type.slice(-5).toLowerCase() !== "error") type = `${type}Error`;
    const e = new Error(err);
    e.name = type as string;
    throw e;
  }
  
  // Check if we want to throw a specific error class
  if(type.prototype instanceof Error) throw new type(err);
}

//raise('Test', 'BlahError');
