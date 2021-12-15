import { DigestAlgorithm, crypto } from "../deps.ts";
import { Random } from "./random.ts";

/**
 * List of algorithms supported by this library
 */
/* Recommended, may change over time to keep up with NIST approved algorithms */
export const PASSWORD_DEFAULT = 'SHA3-256';
export const PASSWORD_SHA384 = 'SHA-384';
export const PASSWORD_SHA3_224 = 'SHA3-224';
export const PASSWORD_SHA3_256 = 'SHA3-256';
export const PASSWORD_SHA3_384 = 'SHA3-384';
export const PASSWORD_SHA3_512 = 'SHA3-512';
export const PASSWORD_SHAKE128 = 'SHAKE128';
export const PASSWORD_SHAKE256 = 'SHAKE256';
export const PASSWORD_BLAKE2B256 = "BLAKE2B-256";
export const PASSWORD_BLAKE2B384 = "BLAKE2B-384";
export const PASSWORD_BLAKE2B = "BLAKE2B";
export const PASSWORD_BLAKE2S = "BLAKE2S";
export const PASSWORD_BLAKE3 = "BLAKE3";
export const PASSWORD_KECCAK224 = "KECCAK-224";
export const PASSWORD_KECCAK256 = "KECCAK-256";
export const PASSWORD_KECCAK384 = "KECCAK-384";
export const PASSWORD_KECCAK512 = "KECCAK-512";
/* Insecure, please do not use in production */
export const PASSWORD_SHA224 = 'SHA-224';
/* Insecure, please do not use in production */
export const PASSWORD_SHA256 = 'SHA-256';
/* Insecure, please do not use in production */
export const PASSWORD_SHA512 = 'SHA-512';
/* Insecure, please do not use in production */
export const PASSWORD_SHA1 = 'SHA-1';
/* Insecure, please do not use in production */
export const PASSWORD_MD5 = 'MD5'

/**
 * Create a mapping of algorithms to identifiers
 * Please *never* change the order of these (only append)
 */
const HASH_IDENTIFIERS = [
  PASSWORD_MD5,
  PASSWORD_SHA1,
  PASSWORD_SHA224,
  PASSWORD_SHA256,
  PASSWORD_SHA384,
  PASSWORD_SHA512,
  PASSWORD_SHA3_224,
  PASSWORD_SHA3_256,
  PASSWORD_SHA3_384,
  PASSWORD_SHA3_512,
  PASSWORD_SHAKE128,
  PASSWORD_SHAKE256,
  PASSWORD_BLAKE2B256,
  PASSWORD_BLAKE2B384,
  PASSWORD_BLAKE2B,
  PASSWORD_BLAKE2S,
  PASSWORD_BLAKE3,
  PASSWORD_KECCAK224,
  PASSWORD_KECCAK256,
  PASSWORD_KECCAK384,
  PASSWORD_KECCAK512
];

/**
 * Specify algorithms that are supported but deemed insecure
 */
const INSECURE_ALGORITHMS: string[] = [
  PASSWORD_SHA224,
  PASSWORD_SHA256,
  PASSWORD_SHA512,
  PASSWORD_SHA1,
  PASSWORD_MD5
];

// Set default options for hashing
export const DEFAULT_OPTS: IPasswordOpts = {
  cost: 10,
  allowInsecure: false
}

/**
 * Options for hashing a password
 */
interface IPasswordOpts {
  /* Cost factor for hashing (2**cost) */
  cost?: number;
  /* Allow the use of insecure algorithms */
  allowInsecure?: boolean;
}

export class Password {
  /**
   * Hash the password using the specified password algorithm
   *
   * @param password
   * @param algo
   * @param options
   * @returns Promise<string> Hash string containing algo, cost, salt and hash
   */
  public static async hash(password: string, algo: string = PASSWORD_DEFAULT, options: IPasswordOpts = DEFAULT_OPTS): Promise<string> {
    // Make sure we are not using an insecure algorithm
    if(INSECURE_ALGORITHMS.includes(algo) && !options.allowInsecure) throw Error('Insecure hashing algorithm selected, aborting');

    // Make sure cost is set, else, use a default
    if(typeof options.cost !== 'number' || options.cost <= 0) options.cost = DEFAULT_OPTS.cost;

    // Create our hash
    let salt = await Random.string(32);
    let result = await Password.doHash(password, algo, salt, options.cost!);

    // Return our final hash string
    return `!${HASH_IDENTIFIERS.indexOf(algo)}!${options.cost}!${salt}!${result}`;
  }

  /**
   *
   * @param password Input password to check against
   * @param hash Hash string input from Password.hash()
   * @returns Promise<boolean> Whether the password was valid or not
   */
  public static async verify(password: string, hash: string): Promise<boolean> {
    // Split input hash at the delimiter
    // Then build our data
    const tokens = hash.split('!');
    let data = {
      algo: HASH_IDENTIFIERS[Number(tokens[1])],
      cost: Number(tokens[2]),
      salt: tokens[3],
      hash: tokens[4]
    };

    // Create our hash
    let result = await Password.doHash(password, data.algo, data.salt, data.cost);

    // Compare hash and return the result
    return result === data.hash;
  }

  private static async doHash(input: string, algo: string, salt: string, cost: number): Promise<string> {
    let rounds = 2 ** cost;
    let result = input;
    for(let round = 0; round < rounds; round++) {
      let buf = await crypto.subtle.digest(algo as DigestAlgorithm, new TextEncoder().encode(`${salt}${result}`));
      result = [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    return result;
  }
}
