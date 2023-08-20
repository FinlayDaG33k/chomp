/**
 * Idea and code primarily based on CakePHP's code.
 */
export class Inflector {

  /**
   * Return input string with first character uppercased.
   *
   * @param input
   */
  public static ucfirst(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  /**
   * Return input string with first character lowercased.
   *
   * @param input
   */
  public static lcfirst(input: string): string {
    return input.charAt(0).toLowerCase() + input.slice(1);
  }

  /**
   * Turn a string into PascalCase.
   *
   * @param input
   * @param delimiter Optional delimiter by which to split the string
   */
  public static pascalize(input: string, delimiter: string = '_'): string {
    return this
      .humanize(input, delimiter)
      .replaceAll(' ', '');
  }

  /**
   * Turn a string into camelCase
   * 
   * @param input
   * @param delimiter Optional delimiter by which to split the string
   */
  public static camelize(input: string, delimiter: string = '_'): string {
    return this.lcfirst(this.pascalize(input, delimiter));
  }

  /**
   * Return the input lower_case_delimited_string as "A Human Readable String".
   * (Underscores are replaced by spaces and capitalized following words.)
   *
   * @param input
   * @param delimiter
   */
  public static humanize(input: string, delimiter: string = '_'): string {
    // Split our string into tokens
    const tokens: string[] = input
      .split(delimiter);

    // Uppercase each of the tokens
    for(let i = 0; i < tokens.length; i++) {
      tokens[i] = this.ucfirst(tokens[i]);
    }

    // Join tokens into a string and return
    return tokens.join(' ');
  }
}
