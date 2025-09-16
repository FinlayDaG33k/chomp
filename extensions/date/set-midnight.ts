/**
 * Add function to Date interface
 */
declare global {
  interface Date {
    setMidnight(): Date;
  }
}

/**
 * Set the date to midnight (00:00:00.000)
 */
Date.prototype.setMidnight = function() {
  this.setHours(0, 0, 0, 0);
  return this;
}
