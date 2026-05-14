const defaultSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

/**
 * Format bytes to a string
 *
 * @example Basic usage
 * ```ts
 * import { formatBytes } from "https://deno.land/x/chomp/utility/format-bytes.ts"
 * const size = formatBytes(1024);
 * ```
 *
 * @source https://stackoverflow.com/a/18650828/5001849
 *
 * @deprecated Please use `@std/fmt/bytes` instead.
 *
 * @param bytes
 * @param decimals
 * @param sizes Array of sizes
 * @param si Set to false to use IEC prefixes (1024 instead of 1000)
 */
export function formatBytes(bytes: number, decimals: number = 2, sizes: string[] = defaultSizes, si: boolean = false): string {
  if (!+bytes) return '0 Bytes'

  const k: number = si ? 1000 : 1024;
  const dm: number = decimals < 0 ? 0 : decimals
  const i: number = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
