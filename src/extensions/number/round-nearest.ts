/**
 * Add function to Number interface
 */
declare global {
  interface Number {
    roundNearest(unit: number): number;
  }
}

/**
 * Round number to the nearest unit
 *
 * @example Basic usage
 * ```
 * const a = 55;
 * const rounded = a.roundNearest(100); // 100
 * ```
 *
 * @param unit
 */
Number.prototype.roundNearest = function(unit: number): number {
  return Math.round(<number>this/unit) * unit;
}
