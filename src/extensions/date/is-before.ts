/**
 * Add function to Date interface
 */
declare global {
  interface Date {
    isBefore(date: Date): boolean;
  }
}

/**
 * Check whether the date is before the input date.
 *
 * @param date
 */
Date.prototype.isBefore = function(date: Date) {
  return date.getTime() > this.getTime();
}
