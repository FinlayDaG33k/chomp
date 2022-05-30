import {Random} from "./random.ts";
import {Algorithms, Hash} from "./hash.ts";

/**
 *  Recommended hashing algorithm for most use-cases.
 *  May change over time to keep up with NIST approved algorithms
 */
export const PASSWORD_DEFAULT = Algorithms.SHA3_256;

/**
 * Create a mapping of algorithms to identifiers
 * Please *never* change the order of these (only append)
 */
const HASH_IDENTIFIERS = [
  Algorithms.MD5,
  Algorithms.SHA1,
  Algorithms.SHA224,
  Algorithms.SHA256,
  Algorithms.SHA384,
  Algorithms.SHA512,
  Algorithms.SHA3_224,
  Algorithms.SHA3_256,
  Algorithms.SHA3_384,
  Algorithms.SHA3_512,
  Algorithms.SHAKE128,
  Algorithms.SHAKE256,
  Algorithms.BLAKE2B256,
  Algorithms.BLAKE2B384,
  Algorithms.BLAKE2B,
  Algorithms.BLAKE2S,
  Algorithms.BLAKE3,
  Algorithms.KECCAK224,
  Algorithms.KECCAK256,
  Algorithms.KECCAK384,
  Algorithms.KECCAK512
];

/**
 * Specify algorithms that are supported but deemed insecure
 */
const INSECURE_ALGORITHMS: string[] = [
  Algorithms.SHA224,
  Algorithms.SHA256,
  Algorithms.SHA512,
  Algorithms.SHA1,
  Algorithms.MD5,
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
  public static async hash(password: string, algo: Algorithms = PASSWORD_DEFAULT, options: IPasswordOpts = DEFAULT_OPTS): Promise<string> {
    // Make sure we are not using an insecure algorithm
    if(INSECURE_ALGORITHMS.includes(algo) && !options.allowInsecure) throw Error('Insecure hashing algorithm selected, aborting');

    // Make sure cost is set, else, use a default
    if(typeof options.cost !== 'number' || options.cost <= 0) options.cost = DEFAULT_OPTS.cost;

    // Create our hash
    const salt = await Random.string(32);
    const result = await Password.doHash(password, algo, salt, options.cost!);

    // Return our final hash string
    return `${HASH_IDENTIFIERS.indexOf(algo)}!${options.cost}!${salt}!${result}`;
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
      algo: HASH_IDENTIFIERS[Number(tokens[0])],
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
      const h = new Hash(input, algo);
      await h.digest();
      result = await h.hex();
    }

    return result;
  }
}
