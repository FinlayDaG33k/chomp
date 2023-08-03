export class Text {
  /**
   * Generate unique identifiers as per RFC-4122.
   */
  public static uuid(): string {
    return crypto.randomUUID();
  }

  /**
   * Tokenize a string into an array of strings.
   * 
   * @param input
   * @param limit
   */
  public static tokenize(input: string, limit = 3): string[] {
    const tokens = input.split(" ");
    if(tokens.length > limit) {
      let ret = tokens.splice(0, limit);
      ret.push(tokens.join(" "));
      return ret;
    }

    return tokens;
  }
}
