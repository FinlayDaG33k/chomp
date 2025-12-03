/**
 * Add function to BigInt interface
 */
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

/**
 * Turn BigInt into String when turning it into JSON.
 * (Why isn't this a thing in JS itself?)
 */
BigInt.prototype.toJSON = function () {
  return this.toString();
};
