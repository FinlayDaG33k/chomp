/**
 * Utility function that throws an error.
 * Band-aid for JS not supporting throwing in null-coalescing.
 *  
 * @param err
 * @param type
 */
export function raise<CustomError extends Error>(err: string, type: string|(new (err: string) => CustomError)|'Error' = 'Error'){
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
