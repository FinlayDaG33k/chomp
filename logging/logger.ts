import { Time } from "../common/time.ts";

export class Logger {
  /**
   * Write an info message to the console
   *
   * @param message The message to write
   * @returns void
   */
  public static info(message: string): void { console.log(`[${Logger.time()}] INFO  > ${message}`); }

  /**
   * Write a warning message to the console
   *
   * @param message The message to write
   * @returns void
   */
  public static warning(message: string): void { console.error(`[${Logger.time()}] WARN  > ${message}`); }

  /**
   * Write an error message to the console
   *
   * @param message The message to write
   * @returns void
   */
  public static error(message: string): void { console.error(`[${Logger.time()}] ERROR > ${message}`); }

  /**
   * Write a debug message to the console
   * Only shows up when the "DEBUG" env is set to truthy
   *
   * @param message The message to write
   * @returns void
   */
  public static debug(message: string): void {
    if(Deno.env.get('DEBUG') == "true") console.log(`[${Logger.time()}] DEBUG > ${message}`);
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
   * eg. 2020/11/28 20:50:30
   *
   * @returns string The formatted time
   */
  private static time(): string { return new Time().format(`yyyy/MM/dd HH:mm:ss`); }
}
