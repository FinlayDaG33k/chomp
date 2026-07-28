/**
 * Add function to Array interface
 */
declare global {
  interface Array<T> {
    findClosestNumber: (input: number) => number;
  }
}

Array.prototype.findClosestNumber = function(input: number): number {
  return this.reduce(
    (previous, current) => Math.abs(current - input) < Math.abs(previous - input) ? current : previous
  );
}
