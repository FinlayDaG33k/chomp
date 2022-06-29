import { Time } from "../common/time.ts";
import { Configure } from "../common/configure.ts";
import { cyan, yellow, red, magenta, bold } from "https://deno.land/std@0.117.0/fmt/colors.ts";

export class Logger {
  /**
   * Write an info message to the console
   *
   * @param message The message to write
   * @returns void
   */
  public static info(message: string): void { console.log(`[${Logger.time()}] ${cyan('INFO')}  > ${message}`); }

  /**
   * Write a warning message to the console
   *
   * @param message The message to write
   * @returns void
   */
  public static warning(message: string): void { console.error(`[${Logger.time()}] ${yellow('WARN')}  > ${message}`); }

  /**
   * Write an error message to the console
   *
   * @param message The message to write
   * @returns void
   */
  public static error(message: string): void { console.error(`[${Logger.time()}] ${red(bold('ERROR'))} > ${message}`); }

  /**
   * Write a debug message to the console
   * Only shows up when the "DEBUG" env is set to truthy
   *
   * @param message The message to write
   * @returns void
   */
  public static debug(message: string): void {
    if(Configure.get('debug', false)) console.log(`[${Logger.time()}] ${magenta('DEBUG')} > ${message}`);
  }

  /**
   * Write a stacktrace to the console
   *
   * @param stacktrace The stacktrace
   * @returns void
   */
  public static trace(stacktrace: any): void {
    console.error(stacktrace);
  }

  /**
   * Return the current time in format.
   * Configurable using the "logger.timeformat" key.
   * Defaults to "yyyy/MM/dd HH:mm:ss" (2020/11/28 20:50:30)
   *
   * @returns string The formatted time
   */
  private static time(): string {
    return new Time().format(Configure.get('logger.timeformat', 'yyyy/MM/dd HH:mm:ss'));
  }
}
