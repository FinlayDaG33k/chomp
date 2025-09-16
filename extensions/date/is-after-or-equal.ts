/**
 * Add function to Date interface
 */
declare global {
  interface Date {
    isAfterOrEqual(date: Date): boolean;
  }
}

/**
 * Check whether the date is after or equal to the input date.
 *
 * @param date
 */
Date.prototype.isAfterOrEqual = function(date: Date) {
  return this.getTime() >= date.getTime();
}
