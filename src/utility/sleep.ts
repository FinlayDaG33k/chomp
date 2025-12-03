/**
 * Sleep (non-blocking) for a defined amount of milliseconds.
 * There generally should not be a reason to use it outside testing purposes.
 *
 * @example Basic usage
 * ```ts
 * // ... Do something
 * await sleep(5_000);
 * // ... Do more
 * ```
 */
export function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
