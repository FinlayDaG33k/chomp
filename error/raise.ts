/**
 * Utility function that literally just throws an error.
 *
 * @param err
 * @param type
 */
export function raise(err: string, type: string|Function|'Error' = 'Error'): never {
  // Check if we want to throw a regular error
  if(type === "Error") throw new Error(err);
  
  // Check if we want to throw a specific error class
  if(typeof type === "function") throw new type(err);
  
  // Build a custom error and throw it
  if(type.slice(-5).toLowerCase() !== "error") type = `${type}Error`;
  const e = new Error(err);
  e.name = type;
  throw e;
}
