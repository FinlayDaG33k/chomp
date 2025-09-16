/**
 * Add function to Date interface
 */
declare global {
  interface Date {
    isBeforeOrEqual(date: Date): boolean;
  }
}

/**
 * Check whether the date is before or equal to the input date.
 *
 * @param date
 */
Date.prototype.isBeforeOrEqual = function(date: Date) {
  return date.getTime() >= this.getTime();
}
