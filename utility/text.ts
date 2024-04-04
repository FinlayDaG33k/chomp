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
      const ret = tokens.splice(0, limit);
      ret.push(tokens.join(" "));
      return ret;
    }

    return tokens;
  }

  /**
   * Replace special characters with their HTML entities.
   * TODO: Add support for diacritical marks.
   *
   * @param str
   * @returns string
   */
  public static htmlentities(str: string): string {
    return str.replace(/[&<>'"]/g, (tag: string) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[tag] ?? tag))
  }
}
