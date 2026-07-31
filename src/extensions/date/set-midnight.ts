/**
 * Add function to Date interface
 */
declare global {
  interface Date {
    setMidnight: (goToTomorrow?: boolean) => Date;
  }
}

/**
 * Set the date to midnight (00:00:00.000).
 *
 * @example Basic usage
 * ```ts
 * const start = new Date('2025-09-16T12:13:56.123Z');
 * start.setMidnight();
 * console.log(start.toISOString()); // 2025-09-16T23:00:00.000Z
 * ```
 *
 * @example Go to tomorrow
 * ```ts
 * const start = new Date('2025-09-16T12:13:56.123Z');
 * start.setMidnight(true);
 * console.log(start.toISOString()); // 2025-09-17T23:00:00.000Z
 * ```
 *
 * @param goToTomorrow Whether to set to midnight tomorrow
 */
Date.prototype.setMidnight = function(goToTomorrow: boolean = false) {
  this.setHours(0, 0, 0, 0);
  if(goToTomorrow) this.setDate(this.getDate() + 1);
  return this;
}
