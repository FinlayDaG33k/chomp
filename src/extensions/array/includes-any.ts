/**
 * Add function to Array interface
 */
declare global {
  interface Array<T> {
    includesAny: <T>(compareTo: T[]) => boolean;
  }
}

Array.prototype.includesAny = function<T>(compareTo: T[]) {
  return compareTo.some((value: T) => this.includes(value));
}
