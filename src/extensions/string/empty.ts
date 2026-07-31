/**
 * Add function to String interface
 */
declare global {
  interface StringConstructor {
    empty: string;
  }
}

/**
 * Add empty type
 */
String.empty = "";
