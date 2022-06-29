import { DigestAlgorithm } from "https://cdn.deno.land/std/versions/0.113.0/raw/_wasm_crypto/mod.ts";
import { crypto } from "https://deno.land/std@0.113.0/crypto/mod.ts";

/**
 * List of algorithms supported by this library
 */
export enum Algorithms {
  SHA384 = 'SHA-384',
  SHA3_224 = 'SHA3-224',
  SHA3_256 = 'SHA3-256',
  SHA3_384 = 'SHA3-384',
  SHA3_512 = 'SHA3-512',
  SHAKE128 = 'SHAKE128',
  SHAKE256 = 'SHAKE256',
  BLAKE2B256 = 'BLAKE2B-256',
  BLAKE2B384 = "BLAKE2B-384",
  BLAKE2B = "BLAKE2B",
  BLAKE2S = "BLAKE2S",
  BLAKE3 = "BLAKE3",
  KECCAK224 = "KECCAK-224",
  KECCAK256 = "KECCAK-256",
  KECCAK384 = "KECCAK-384",
  KECCAK512 = "KECCAK-512",
  /* Insecure, please do not use in production */
  RIPEMD160 = "RIPEMD-160",
  /* Insecure, please do not use in production */
  SHA224 = 'SHA-224',
  /* Insecure, please do not use in production */
  SHA256 = 'SHA-256',
  /* Insecure, please do not use in production */
  SHA512 = 'SHA-512',
  /* Insecure, please do not use in production */
  SHA1 = 'SHA-1',
  /* Insecure, please do not use in production */
  MD5 = 'MD5',
}

/**
 * Specify algorithms that are supported but deemed insecure
 */
export const INSECURE_ALGORITHMS: string[] = [
  Algorithms.RIPEMD160,
  Algorithms.SHA224,
  Algorithms.SHA256,
  Algorithms.SHA512,
  Algorithms.SHA1,
  Algorithms.MD5,
];

export class Hash {
  private result: any;

  constructor(
    private input: string,
    private algo: string,
  ) {}

  public async digest() {
    this.result = await crypto.subtle.digest(this.algo as DigestAlgorithm, new TextEncoder().encode(this.input));
  }

  public hex() {
    return [...new Uint8Array(this.result)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
}
