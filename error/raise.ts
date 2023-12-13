/**
 * Utility function that literally just throws an error.
 * TODO: Allow passing custom error classes for better extendability.
 *
 * @param err
 * @param type
 */
export function raise(err: string, type: string|'Error' = 'Error'): never {
  // Check if we want to throw a regular error
  if(type === "Error") throw new Error(err);
  
  // Build a custom error and throw it
  if(type.slice(-5).toLowerCase() !== "error") type = `${type}Error`;
  const e = new Error(err);
  e.name = type;
  throw e;
}
