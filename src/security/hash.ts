import { Algorithms } from "../types/hash.ts";
import { DigestAlgorithm } from "jsr:@std/crypto@1.1.0/crypto";
import { crypto } from "jsr:@std/crypto@1.1.0/crypto";
import { encodeHex } from "jsr:@std/encoding@1.0.10";

/**
 * Create hashes
 *
 * **NOTE**: If you want to hash passwords, use the {@linkcode Password} class instead!
 */
export class Hash {
  private result!: ArrayBuffer;

  constructor(
    private input: string|ArrayBuffer|Uint8Array<ArrayBuffer>,
    private algo: Algorithms,
  ) {}

  /**
   * Digest the input
   *
   * @example Basic usage
   * ```ts
   * import { Hash } from "https://deno.land/x/chomp/security/hash.ts";
   *
   * const hash = new Hash("some data");
   * await hash.digest();
   * console.log(hash.hex());
   * ```
   *
   * @example Using BLAKE2B384
   * ```ts
   * import { Hash, Algorithms } from "https://deno.land/x/chomp/security/hash.ts";
   *
   * const hash = new Hash("some data", Algorithms.BLAKE2B384);
   * await hash.digest();
   * ```
   */
  public async digest() {
    // Check if we need to encode text into an array buffer
    if(typeof this.input === "string") this.input = new TextEncoder().encode(this.input);

    // Hash input
    this.result = await crypto.subtle.digest(this.algo as DigestAlgorithm, this.input);
  }

  /**
   * Digest the input
   *
   * @example Basic usage
   * ```ts
   * import { Hash } from "https://deno.land/x/chomp/security/hash.ts";
   *
   * const hash = new Hash("some data");
   * await hash.digest();
   * console.log(hash.hex());
   * ```
   */
  public hex() {
    return encodeHex(this.result);
  }
}
