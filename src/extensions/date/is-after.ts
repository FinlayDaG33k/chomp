/**
 * Add function to Date interface
 */
declare global {
  interface Date {
    isAfter(date: Date): boolean;
  }
}

/**
 * Check whether the date is after the input date.
 *
 * @param date
 */
Date.prototype.isAfter = function(date: Date) {
  return this.getTime() > date.getTime();
}
