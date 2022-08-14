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
   * Write an error message to the console.
   * If the "error_log" Configure item is set, will also write to file.
   *
   * @param message The message to write
   * @param stack Optional stacktrace
   * @returns void
   */
  public static error(message: string, stack: string|null = null): void {
    // Get current time
    const now = Logger.time();

    // Check if we need to write to file
    // Write to file if need be
    if(Configure.get('error_log')) {
      try {
        let output = `[${now}] ERROR > ${message}`;
        if(stack) output += `\r\n${stack}`;
        Deno.writeTextFile(Configure.get('error_log'), output, {append: true});
      }  catch(e) {
        console.error(`Could not append to error log: "${e.message}"`);
      }
    }

    // Write to console
    let output = `[${now}] ${red(bold('ERROR'))} > ${message}`;
    if(stack) output += `\r\n${stack}`;
    console.error(output);
  }

  /**
   * Write a debug message to the console
   * Only shows up when the "DEBUG" env is set to truthy
   *
   * @param message The message to write
   * @returns void
   */
  public static debug(message: string): void {
    if(Deno.env.get('DEBUG') == "true" || Configure.get('debug', false)) console.log(`[${Logger.time()}] ${magenta('DEBUG')} > ${message}`);
  }

  /**
   * Write a stacktrace to the console
   *
   * @param stacktrace The stacktrace
   * @returns void
   */
  public static trace(stacktrace: any): void {
    Logger.warning('Use of Logger#stack is deprecated, please pass trace to Logger#error instead.');
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
