/**
 * Utility function that literally just throws an error
 *
 * @param err
 */
export function raise(err: string): never {
  throw new Error(err);
}
