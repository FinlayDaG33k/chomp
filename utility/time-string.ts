/**
 * Thanks to Mordo95 for this code
 * https://github.com/Mordo95/interval-template-strings/blob/35d55c86ee8cbff947b66740b327e1de4d4f96aa/index.js
 */

interface RegExp {
  groups: {
    digit: number;
    format: string;
  }
}

const TimeRegexp = /(?<value>[+-]?\d+(\.\d+)?)\s*(?<unit>[a-zA-Z]+)/g;
const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const month = Math.round(week * 4.34524);
const year = month * 12;

/**
 * Parse the number format to the equivalent milliseconds
 *
 * @param digit
 * @param unit
 * @returns number
 */
function parseNumberFormat(digit: string, unit: string): number {
  const n = Number(digit);
  switch(unit) {
    case "ms":
    case "millisecond":
    case "milliseconds":
      return n;
    case "s":
    case "second":
    case "seconds":
      return n * second;
    case "m":
    case "minute":
    case "minutes":
      return n * minute;
    case "h":
    case "hour":
    case "hours":
      return n * hour;
    case "d":
    case "day":
    case "days":
      return n * day;
    case "w":
    case "week":
    case "weeks":
      return n * week;
    case "mo":
    case "month":
    case "months":
      return n * month;
    case "y":
    case "year":
    case "years":
      return n * year;
    default:
      throw new Error(`${unit} is not a valid time unit`);
  }
}

/**
 * Takes a time string and turns it into milliseconds
 *
 * @param strIn
 * @param parts
 * @returns number
 */
export function T(strIn: TemplateStringsArray, ...parts: any[]) {
  const str = String.raw(strIn, parts).toLowerCase().replace(/\s/g, '');
  const parsed = [...str.matchAll(TimeRegexp)];
  if (parsed.length === 0)
    throw new Error(`"${str}" is not a valid interval string`);
  let out = 0;
  for (const res of parsed) {
    out += Math.round(parseNumberFormat(res.groups!.value, res.groups!.unit));
  }
  return out;
}

/**
 * Takes a time string and turns it into round seconds
 *
 * @param strIn
 * @param parts
 * @returns number
 */
export function _T(strIn: TemplateStringsArray, ...parts: any[]) {
  return Math.round(T(strIn, parts) / 1000);
}
