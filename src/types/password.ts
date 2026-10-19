/**
 * Create a mapping of algorithms to identifiers
 * To add new identifier:
 * - Hash enum value using SHA1
 * - Add first 2 characters as identifier
 * - Prefix with "d" (to make linter happy)
 */
export enum HASH_IDENTIFIERS {
  "d5e" = "SHA-384",
  "d6d" = "SHA3-224",
  "d88" = "SHA3-256",
  "def" = "SHA3-384",
  "d81" = "SHA3-512",
  "dfa" = "SHAKE128",
  "de3" = "SHAKE256",
  "d34" = "BLAKE2B-256",
  "d20" = "BLAKE2B-384",
  "d85" = "BLAKE2B",
  "d05" = "BLAKE2S",
  "d63" = "BLAKE3",
  "d87" = "KECCAK-224",
  "d78" = "KECCAK-256",
  "d1c" = "KECCAK-384",
  "df6" = "KECCAK-512",
  /* Insecure, please do not use in production */
  "dc0" = "RIPEMD-160",
  /* Insecure, please do not use in production */
  "dba" = "SHA-224",
  /* Insecure, please do not use in production */
  "d45" = "SHA-256",
  /* Insecure, please do not use in production */
  "db8" = "SHA-512",
  /* Insecure, please do not use in production */
  "dc5" = "SHA-1",
  /* Insecure, please do not use in production */
  "db7" = "MD5",
}

/**
 * Options for hashing a password
 */
export interface PasswordOptions {
  /* Cost factor for hashing (2**cost) */
  cost?: number;
  /* Allow the use of insecure algorithms */
  allowInsecure?: boolean;
  /**
   * Specify a static salt
   * Usage of this should be limited to testing only!
   */
  salt?: string;
}
