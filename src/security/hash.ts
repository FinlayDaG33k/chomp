import { Algorithms } from "../types/hash.ts";
import { DigestAlgorithm } from "https://cdn.deno.land/std/versions/0.113.0/raw/_wasm_crypto/mod.ts";
import { crypto } from "https://deno.land/std@0.113.0/crypto/mod.ts";
import { encodeHex } from "jsr:@std/encoding@1.0.10";

/**
 * Create hashes
 *
 * **NOTE**: If you want to hash passwords, use the {@linkcode Password} class instead!
 */
export class Hash {
  private result!: ArrayBuffer;

  constructor(
    private input: string,
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
    this.result = await crypto.subtle.digest(this.algo as DigestAlgorithm, new TextEncoder().encode(this.input));
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
