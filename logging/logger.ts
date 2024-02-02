import { Time } from "../utility/time.ts";
import { Configure } from "../core/configure.ts";
import { cyan, yellow, red, magenta, bold } from "https://deno.land/std@0.117.0/fmt/colors.ts";

type Handlers = {
  info: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string, stack: string|null) => void;
  debug: (message: string) => void;
};
type LogLevels = keyof Handlers;

const handlers: Handlers = {
  info: (message: string): void => { console.log(`[${Logger.time()}] ${cyan('INFO')}  > ${message}`); },
  warning: (message: string): void => { console.error(`[${Logger.time()}] ${yellow('WARN')}  > ${message}`); },
  error: (message: string, stack:string|null = null): void => {
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
  },
  debug: (message: string): void => {
    if(Configure.get('debug', false)) {
      console.log(`[${Logger.time()}] ${magenta('DEBUG')} > ${message}`);
    }
  }
}

export class Logger {
  private static _handlers: Handlers = handlers;

  /**
   * Override a handler app-wide.
   * 
   * @param level {LogLevels}
   * @param handler {any}
   */
  // @ts-ignore TODO: Figure out how to replace Function with something more sane
  // deno-lint-ignore ban-types -- TODO
  public static setHandler(level: LogLevels, handler: Function): void { Logger._handlers[level] = handler; }
  
  /**
   * Write an info message to the console
   *
   * @param {string} message The message to write
   * @returns {void}
   */
  public static info(message: string): void { Logger._handlers['info'](message) }

  /**
   * Write a warning message to the console
   *
   * @param {string} message The message to write
   * @returns {void}
   */
  public static warning(message: string): void { Logger._handlers['warning'](message) }

  /**
   * Write an error message to the console.
   * If the "error_log" Configure item is set, will also write to file.
   *
   * @param {string} message The message to write
   * @param {string|null} stack Optional stacktrace
   * @returns {void}
   */
  public static error(message: string, stack: string|null = null): void { Logger._handlers['error'](message, stack); }

  /**
   * Write a debug message to the console
   * Only shows up when the "DEBUG" env is set to truthy
   *
   * @param {string} message The message to write
   * @returns {void}
   */
  public static debug(message: string): void { Logger._handlers['debug'](message); }

  /**
   * Return the current time in format.
   * Configurable using the "logger.timeformat" key.
   * Defaults to "yyyy/MM/dd HH:mm:ss" (2020/11/28 20:50:30)
   * https://github.com/denoland/deno_std/tree/0.77.0/datetime#datetime
   *
   * @returns {string} The formatted time
   */
  public static time(): string {
    return new Time().format(Configure.get('logger.timeformat', 'yyyy/MM/dd HH:mm:ss'));
  }
}
