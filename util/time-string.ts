/**
 * Thanks to Mordo95 for this code
 * https://github.com/Mordo95
 */

const TimeRegexp = /(?<digit>\d+)(?<format>[a-zA-Z]+)/g;

interface RegExp {
  groups: {
    digit: number;
    format: string;
  }
}

/**
 * Parse the number format to the equivalent milliseconds
 *
 * @param digit
 * @param format
 * @returns number
 */
function parseNumberFormat(digit: string, format: string): number {
  const n = Number(digit);
  switch(format) {
    case "ms":
      return n;
    case "s":
      return n * 1000;
    case "m":
      return n * 1000 * 60;
    case "h":
      return n * 1000 * 60 * 60;
    case "d":
      return n * 1000 * 60 * 60 * 24;
    case "w":
      return n * 1000 * 60 * 60 * 24 * 7;
    case "mo":
      return n * 1000 * 60 * 60 * 24 * 7 * 31;
    case "y":
      return n * 1000 * 60 * 60 * 24 * 7 * 31 * 12;
    default:
      throw Error('Could not parse format');
  }
}

/**
 * Takes a time string and turns it into milliseconds
 *
 * @param strIn
 * @param parts
 * @returns number
 */
export function T(strIn: TemplateStringsArray, ...parts: any[]): number {
  const str = String.raw(strIn, parts).toLowerCase().replace(/\s/g, '');
  const parsed = str.matchAll(TimeRegexp);
  if (!parsed)
    return 0;
  let out = 0;
  for (const res of parsed) {
    out += parseNumberFormat(res.groups!.digit, res.groups!.format);
  }
  return out;
}
