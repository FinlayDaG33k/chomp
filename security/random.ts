/**
 * Create some randomness because I learned how to exit VIM.
 */
export class Random {
  /**
   * Generate random bytes.
   * These bytes are generated using the Web Crypto API, this is cryptographically secure.
   *
   * @example Basic Usage
   * ```ts
   * import { Random } from "https://deno.land/x/chomp/security/random.ts";
   *
   * // Generates 16 random bytes
   * const bytes = Random.bytes(16);
   * ```
   *
   * @param length Amount of bytes to be generated
   * @returns Uint8Array
   */
  public static bytes(length: number): Uint8Array {
    const buf = new Uint8Array(length);
    crypto.getRandomValues(buf);
    return buf;
  }

  /**
   * Generate a random string.
   * These strings are generated using the Web Crypto API, this is cryptographically secure.
   *
   * @example Basic Usage
   * ```ts
   * import { Random } from "https://deno.land/x/chomp/security/random.ts";
   *
   * // Generates a string with 16 characters
   * const str = await Random.string(16);
   * ```
   *
   * @param length Length of the string to be generated
   * @returns Promise<string>
   */
  public static async string(length: number): Promise<string> {
    const buf = await Random.bytes(length / 2);
    return Array.from(buf, (dec: number) => dec.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Inclusively generate a random integer between min and max.
   * If you want to use decimals, please use "{@linkcode Random.float()}" instead.
   *
   * By default, these integers are **NOT** cryptographically secure (for performance reasons).
   * Set the "secure" argument to "true" if you are using this for cryptographic purposes!
   *
   * @example Basic Usage
   * ```ts
   * import { Random } from "https://deno.land/x/chomp/security/random.ts";
   *
   * // Generate a random integer between 0 and 10
   * const num = await Random.integer(0, 10);
   * ```
   *
   * @example Cryptographically secure
   * ```ts
   * import { Random } from "https://deno.land/x/chomp/security/random.ts";
   *
   * // Generate a secure random integer between 0 and 10
   * const num = await Random.integer(0, 10, true);
   * ```
   *
   * @param min Minimum allowable integer
   * @param max Maximum allowable integer
   * @param secure Using this for cryptographic purposes?
   */
  public static integer(min = 0, max = 1, secure = false): number {
    // Strip decimals
    min = Math.ceil(min);
    max = Math.floor(max);

    // Generate a number using Random.float and floor that
    return Math.floor(Random.float(min, max, secure));
  }

  /**
   * Inclusively generate a random float between min and max.
   * If you do not want to use decimals, please use Random.integer() instead.
   *
   * By default, these floats are **NOT** cryptographically secure (for performance reasons).
   * Set the "secure" argument to "true" if you are using this for cryptographic purposes!
   *
   * @example Basic Usage
   * ```ts
   * import { Random } from "https://deno.land/x/chomp/security/random.ts";
   *
   * // Generate a random float between 0 and 1
   * const num = await Random.float(0, 1);
   * ```
   *
   * @example Cryptographically secure
   * ```ts
   * import { Random } from "https://deno.land/x/chomp/security/random.ts";
   *
   * // Generate a secure random float between 0 and 1
   * const num = await Random.float(0, 1, true);
   * ```
   *
   * @param min Minimum allowable float
   * @param max Maximum allowable float
   * @param secure Using this for cryptographic purposes?
   */
  public static float(min = 0, max = 1, secure = false): number {
    // Generate our randomness
    const random = secure ? crypto.getRandomValues(new Uint32Array(1))[0] / Math.pow(2, 32) : Math.random();

    // Limit and return
    return random * (max - min + 1) + min;
  }
}
