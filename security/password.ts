import { Random } from "./random.ts";
import { Algorithms, Hash, INSECURE_ALGORITHMS } from "./hash.ts";

/**
 *  Recommended hashing algorithm for most use-cases.
 *  May change over time to keep up with NIST approved algorithms
 */
export const PASSWORD_DEFAULT = Algorithms.SHA3_256;

/**
 * Create a mapping of algorithms to identifiers
 * To add new identifier:
 * - Hash enum value using SHA1
 * - Add first 2 characters as identifier
 * - Prefix with "d" (to make linter happy)
 */
enum HASH_IDENTIFIERS {
  'd5e' = 'SHA-384',
  'd6d' = 'SHA3-224',
  'd88' = 'SHA3-256',
  'def' = 'SHA3-384',
  'd81' = 'SHA3-512',
  'dfa' = 'SHAKE128',
  'de3' = 'SHAKE256',
  'd34' = 'BLAKE2B-256',
  'd20' = 'BLAKE2B-384',
  'd85' = 'BLAKE2B',
  'd05' = "BLAKE2S",
  'd63' = "BLAKE3",
  'd87' = "KECCAK-224",
  'd78' = "KECCAK-256",
  'd1c' = "KECCAK-384",
  'df6' = "KECCAK-512",
  'd9a' = 'TIGER',
  /* Insecure, please do not use in production */
  'dc0' = 'RIPEMD-160',
  /* Insecure, please do not use in production */
  'dba' = 'SHA-224',
  /* Insecure, please do not use in production */
  'd45' = 'SHA-256',
  /* Insecure, please do not use in production */
  'db8' = 'SHA-512',
  /* Insecure, please do not use in production */
  'dc5' = 'SHA-1',
  /* Insecure, please do not use in production */
  'db7' = 'MD5',
}

// Set default options for hashing
export const DEFAULT_OPTS: IPasswordOpts = {
  cost: 10,
  allowInsecure: false
}

/**
 * Options for hashing a password
 */
export interface IPasswordOpts {
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
  public static async hash(password: string, algo: Algorithms = PASSWORD_DEFAULT, options: IPasswordOpts = DEFAULT_OPTS): Promise<string> {
    // Make sure we are not using an insecure algorithm
    if(INSECURE_ALGORITHMS.includes(algo) && !options.allowInsecure) throw Error('Insecure hashing algorithm selected, aborting.');

    // Make sure cost is set, else, use a default
    if(typeof options.cost !== 'number' || options.cost <= 0) options.cost = DEFAULT_OPTS.cost;

    // Get our identifier
    const identifierIndex = Object.values(HASH_IDENTIFIERS).indexOf(algo as unknown as HASH_IDENTIFIERS);
    if(!identifierIndex) throw Error(`Identifier for algorithm "${algo}" could not be found!`);
    const identifier = Object.keys(HASH_IDENTIFIERS)[identifierIndex];

    // Create our hash
    const salt = await Random.string(32);
    const result = await Password.doHash(password, algo, salt, options.cost!);

    // Return our final hash string
    return `${identifier}!${options.cost}!${salt}!${result}`;
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
    if(tokens.length < 4) throw Error('Malformed input hash');
    const data = {
      algo: HASH_IDENTIFIERS[tokens[0] as keyof typeof HASH_IDENTIFIERS],
      cost: Number(tokens[1]),
      salt: tokens[2],
      hash: tokens[3]
    };

    // Create our hash
    const result = await Password.doHash(password, data.algo, data.salt, data.cost);

    // Compare hash and return the result
    return result === data.hash;
  }

  private static async doHash(input: string, algo: string, salt: string, cost: number): Promise<string> {
    const rounds = 2 ** cost;
    let result = input;
    for(let round = 0; round < rounds; round++) {
      const h = new Hash(`${salt}${input}`, algo);
      await h.digest();
      result = await h.hex();
    }

    return result;
  }
}
