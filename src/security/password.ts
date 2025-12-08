import {Algorithms, INSECURE_ALGORITHMS} from "../types/hash.ts";
import {HASH_IDENTIFIERS, PasswordOptions} from "../types/password.ts";
import {Hash} from "./hash.ts";
import {Random} from "./random.ts";
import {Logger, raise} from "../../mod.ts";
import {valueOrDefault} from "../utility/value-or-default.ts";

/**
 *  Recommended hashing algorithm for most use-cases.
 *  May change over time to keep up with NIST approved algorithms
 */
export const PASSWORD_DEFAULT = Algorithms.SHA3_256;

/**
 * Default options for password hashing.
 * These defaults offer a good balance between performance and security.
 */
export const DEFAULT_OPTS: PasswordOptions = {
  cost: 10,
  allowInsecure: false,
};

/**
 * Create password hashes and easily verify them.
 * Automatically salts the hashes.
 *
 * Heavily inspired by PHP's {@link https://www.php.net/manual/en/function.password-hash.php password_hash}
 * and {@link https://www.php.net/manual/en/function.password-verify.php password_verify} functions.
 *
 * **NOTE**: If you want to create deterministic hashes, use the {@linkcode Hash} class instead!
 */
export class Password {
  /**
   * Hash the password using the specified password algorithm
   *
   * @param password
   * @param algo
   * @param options
   * @returns Hash string containing algo, cost, salt and hash
   */
  public static async hash(
    password: string,
    algo: Algorithms = PASSWORD_DEFAULT,
    options: PasswordOptions = DEFAULT_OPTS,
  ): Promise<string> {
    // Make sure we are not using an insecure algorithm
    const isUsingInsecureAlgorithm = INSECURE_ALGORITHMS.includes(algo);
    const mayUseInsecureAlgorithms = options.allowInsecure;
    if (isUsingInsecureAlgorithm && !mayUseInsecureAlgorithms) raise("Insecure hashing algorithm selected, aborting.");

    // Make sure cost is set, else, use a default
    const cost = valueOrDefault<number>(options.cost, 0);
    const costIsAboveZero = cost > 0;
    if (!costIsAboveZero) options.cost = DEFAULT_OPTS.cost;

    // Get our identifier
    const identifierIndex = Object.values(HASH_IDENTIFIERS).indexOf(algo as unknown as HASH_IDENTIFIERS);
    if (!identifierIndex) throw Error(`Identifier for algorithm "${algo}" could not be found!`);
    const identifier = Object.keys(HASH_IDENTIFIERS)[identifierIndex];

    // Create salt if need be
    // Warn if we use a static salt
    if(options.salt !== undefined) {
      Logger.warning("Using statically defined salt, this is not suitable for production usage!");
    }
    const salt = valueOrDefault<string>(options.salt, Random.string(32));

    // Hash our password
    const result = await Password.doHash(password, algo, salt, options.cost!);

    // Return our final hash string
    return `${identifier}!${options.cost}!${salt}!${result}`;
  }

  /**
   * @param password Input password to check against
   * @param hash Hash string input from Password.hash()
   * @returns Promise<boolean> Whether the password was valid or not
   */
  public static async verify(password: string, hash: string): Promise<boolean> {
    // Split input hash at the delimiter
    // Then build our data
    const tokens = hash.split("!");
    if (tokens.length < 4) throw Error("Malformed input hash");
    const data = {
      algo: HASH_IDENTIFIERS[tokens[0] as keyof typeof HASH_IDENTIFIERS],
      cost: Number(tokens[1]),
      salt: tokens[2],
      hash: tokens[3],
    };

    // Create our hash
    const result = await Password.doHash(password, data.algo, data.salt, data.cost);

    // Compare hash and return the result
    return result === data.hash;
  }

  private static async doHash(input: string, algo: string, salt: string, cost: number): Promise<string> {
    const rounds = 2 ** cost;
    let result = input;

    for (let round = 0; round < rounds; round++) {
      const h = new Hash(`${salt}${input}`, algo as Algorithms);
      await h.digest();
      result = h.hex();
    }

    return result;
  }
}
