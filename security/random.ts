export class Random {
  /**
   * Generate random bytes
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
   * Generate a random string
   *
   * @param length Length of the string to be generated
   * @returns Promise<string>
   */
  public static async string(length: number): Promise<string> {
    const buf = await Random.bytes(length / 2);
    return Array.from(buf, (dec: number) => dec.toString(16).padStart(2, "0")).join('')
  }
}
