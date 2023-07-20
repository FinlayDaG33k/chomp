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
   */
  public static pascalize(input: string, delimiter: string = '_'): string {
    return Inflector
      .humanize(input, delimiter)
      .replaceAll(' ', '');
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
      tokens[i] = Inflector.ucfirst(tokens[i]);
    }
    
    // Join tokens into a string and return
    return tokens.join(' ');
  }
}
