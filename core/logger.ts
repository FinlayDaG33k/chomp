import { Time } from "../utility/time.ts";
import { Configure } from "./configure.ts";
import { bold, cyan, magenta, red, yellow, blue, green, gray } from "https://deno.land/std@0.117.0/fmt/colors.ts";

type Handlers = {
  error: (message: string, stack: string | null) => void;
  warning: (message: string) => void;
  notice: (message: string) => void;
  info: (message: string) => void;
  monitor: (message: string) => void;
  debug: (message: string) => void;
  trace: (message: string) => void;
};
type LogLevels = keyof Handlers;

const handlers: Handlers = {
  error: (message: string, stack: string | null = null): void => {
    // Get current time
    const now = Logger.time();

    // Check if we need to write to file
    // Write to file if need be
    if (Configure.get("error_log")) {
      try {
        let output = `[${now}] ERROR > ${message}`;
        if (stack) output += `\r\n${stack}`;
        Deno.writeTextFile(Configure.get("error_log"), output, { append: true });
      } catch (e) {
        console.error(`Could not append to error log: "${e.message}"`);
      }
    }

    // Write to console
    let output = `[${now}] ${red(bold("ERROR"))}  > ${message}`;
    if (stack) output += `\r\n${stack}`;
    console.error(output);
  },
  warning: (message: string): void => {
    console.error(`[${Logger.time()}] ${yellow("WARN")}   > ${message}`);
  },
  notice: (message: string): void => {
    console.error(`[${Logger.time()}] ${blue("NOTICE")} > ${message}`);
  },
  info: (message: string): void => {
    console.log(`[${Logger.time()}] ${cyan("INFO")}   > ${message}`);
  },
  monitor: (message: string): void => {
    console.log(`[${Logger.time()}] ${green("MONIT")}  > ${message}`);
  },
  debug: (message: string): void => {
    if (Configure.get("debug", false)) {
      console.log(`[${Logger.time()}] ${magenta("DEBUG")}  > ${message}`);
    }
  },
  trace: (message: string): void => {
    if (Configure.get("debug", false)) {
      console.log(`[${Logger.time()}] ${gray("TRACE")}  > ${message}`);
    }
  }
};

/**
 * Logging handler for writing to console
 */
export class Logger {
  private static _handlers: Handlers = handlers;

  /**
   * Override a handler app-wide.
   *
   * @param level {LogLevels}
   * @param handler {any}
   */
  // deno-lint-ignore no-explicit-any -- TODO: Figure out how to replace any type with something more sane
  public static setHandler(level: LogLevels, handler: any): void {
    Logger._handlers[level] = handler;
  }

  /**
   * Write an error message to the console.
   * If the "error_log" Configure item is set, will also write to file.
   *
   * Available in any log level.
   *
   * @param {string} message The message to write
   * @param {string|null} stack Optional stacktrace
   * @returns {void}
   */
  public static error(message: string, stack: string | null = null): void {
    Logger._handlers["error"](message, stack);
  }

  /**
   * Write a warning message to the console
   *
   * Available in log levels 0 and higher.
   *
   * @param {string} message The message to write
   * @returns {void}
   */
  public static warning(message: string): void {
    if(Logger.shouldLog(0)) Logger._handlers["warning"](message);
  }

  /**
   * Write a notice to the console
   *
   * Available in log levels 1 and higher.
   *
   * @param {string} message The message to write
   * @returns {void}
   */
  public static notice(message: string): void {
    if(Logger.shouldLog(1)) Logger._handlers["notice"](message);
  }

  /**
   * Write an info message to the console
   *
   * Available in log levels 2 and higher.
   *
   * @param {string} message The message to write
   * @returns {void}
   */
  public static info(message: string): void {
    if(Logger.shouldLog(2)) Logger._handlers["info"](message);
  }

  /**
   * Write a monitor message to the console
   * Useful for when you want to write performance-related messages
   *
   * Available in log levels 3 and higher.
   *
   * @param message
   * @returns {void}
   */
  public static monitor(message: string): void {
    if(Logger.shouldLog(3)) Logger._handlers["monitor"](message);
  }

  /**
   * Write a debug message to the console
   *
   * Available in log levels 4 and higher.
   *
   * @param {string} message The message to write
   * @returns {void}
   */
  public static debug(message: string): void {
    if(Logger.shouldLog(4)) Logger._handlers["debug"](message);
  }

  /**
   * Write a trace message to the console.
   * By default, only shows up when the "DEBUG" env is set to truthy.
   *
   * Available in log levels 5 and higher.
   *
   * @param message
   * @returns {void}
   */
  public static trace(message: string): void {
    if(Logger.shouldLog(5)) Logger._handlers["trace"](message);
  }

  /**
   * Return the current time in format.
   * Configurable using the "logger.timeformat" key.
   * Defaults to "yyyy/MM/dd HH:mm:ss" (2020/11/28 20:50:30)
   * https://github.com/denoland/deno_std/tree/0.77.0/datetime#datetime
   *
   * @returns {string} The formatted time
   */
  public static time(): string {
    return new Time().format(Configure.get("logger.timeformat", "yyyy/MM/dd HH:mm:ss"));
  }

  /**
   * Check
   *
   * @param level
   * @private
   */
  private static shouldLog(level: number): boolean {
    return Configure.get("log_level", 5) >= level;
  }
}
