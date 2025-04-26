import { Logger } from "./logger.ts";

// deno-lint-ignore no-explicit-any -- Arbitrary data may be used
const defaults = new Map<string, any>([
  ["debug", false],
  ["error_log", `${Deno.cwd()}/logs/error.log`],
]);

/**
 * In-memory configuration handler.
 */
export class Configure {
  // deno-lint-ignore no-explicit-any -- Arbitrary data may be used
  private static config: Map<string, any> = defaults;
  private static hasLoaded = false;

  /**
   * Load our configure data from file at `${Deno.cwd()}/config.json` or `${Deno.cwd()}/config.ts`.
   *
   * **NOTE**: Loading from `config.json` is deprecated and will be removed in the future but is currently still the default.
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * ```
   *
   * @example Load from config.ts
   * ```
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load(false, true);
   * ```
   *
   * @param force Set to true to force re-loading the configure
   * @param useTs Set to true to load from config.ts instead of config.json
   * @returns void
   */
  public static async load(force = false, useTs = false): Promise<void> {
    // Make sure we don't have loaded already
    if (Configure.hasLoaded === true && force === false) return;
    Logger.info(`Loading data into Configure...`);

    if(!useTs) {
      Logger.warning('Loading Configure from JSON is deprecated!');
      await Configure._loadJson();
    } else {
      const module = await import(`file:///${Deno.cwd()}/config.ts`);
      if(!('default' in module)) {
        Logger.warning(`Could not load Configure: "${Deno.cwd()}/config.ts" has no default export...`);
        Configure.hasLoaded = true;
        return;
      }
      Configure.config = new Map(function*() { yield* defaults; yield* module['default']; }());
    }

    // Mark configure as loaded
    Logger.info(`Finished loading Configure!`);
    Configure.hasLoaded = true;
  }

  /**
   * Read the config.json file
   *
   * @deprecated Switching to using solely TS-based configs
   */
  private static async _loadJson() {
    // Make sure our file exists
    try {
      await Deno.stat(`${Deno.cwd()}/config.json`);
    } catch (_e) {
      Logger.warning(`Could not find file "config.json" at "${Deno.cwd()}". Configure will be empty!`);
      Configure.hasLoaded = true;
      return;
    }

    // Read our JSON
    try {
      const json = await Deno.readTextFile(`${Deno.cwd()}/config.json`);
      const data = JSON.parse(json);
      for (const entry of Object.keys(data)) {
        Configure.set(entry, data[entry]);
      }
    } catch (e) {
      Logger.error(`Could not load JSON: "${e.message}"`, e.stack);
      return;
    }
  }

  /**
   * Obtain the value of a key in the configure.
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * const item = Configure.get('my-item');
   * ```
   *
   * @example Setting a default value
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * const item = Configure.get('my-item', 'my-default');
   * ```
   *
   * @param key Key to look for
   * @param defaultValue Default value to return when no result was found
   * @returns any|null
   */
  public static get<T>(key: string, defaultValue: T|null = null): T | null {
    // Return null if we do not have the key
    if (!Configure.config.has(key)) return defaultValue;
    return Configure.config.get(key);
  }

  /**
   * Set a configure item
   * It is not possible to store null values
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * Configure.set('my-item', 'my-value);
   * ```
   *
   * @param key
   * @param value
   * @returns void
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public static set(key: string, value: any): void {
    if (value === null || typeof value === "undefined") return;
    Configure.config.set(key, value);
  }

  /**
   * Return whether a key exists
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * const exists = Configure.check('my-item');
   * ```
   *
   * @param key
   * @returns boolean
   */
  public static check(key: string): boolean {
    return Configure.config.has(key);
  }

  /**
   * Consume a key from configure (removing it).
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * const exists = Configure.consume('my-item');
   * ```
   *
   * @example Setting a default value
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * const exists = Configure.consume('my-item', 'default-value');
   * ```
   *
   * @param key
   * @param defaultValue
   */
  public static consume<T>(key: string, defaultValue: T|null = null): T|null {
    // Check if the key exists, if not, return the default value
    if (!Configure.config.has(key)) return defaultValue;

    // Hack together a reference to our item's value
    const ref = [Configure.config.get(key)];

    // Delete the original item
    Configure.config.delete(key);

    // Return the value
    return ref[0];
  }

  /**
   * Delete a ConfigureItem from the Configure
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * Configure.delete('my-item');
   * ```
   *
   * @param key
   * @returns void
   */
  public static delete(key: string): void {
    Configure.config.delete(key);
  }

  /**
   * Dump all contents of the Configure
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * console.log(Configure.dump());
   * ```
   *
   * @returns ConfigureItem[]
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public static dump(): Map<string, any> {
    return Configure.config;
  }

  /**
   * Clear all items in the configure (including defaults).
   * If you want to keep the defaults, use {@linkcode Configure.reset()} instead.
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * Configure.clear();
   * ```
   *
   * @returns void
   */
  public static clear(): void {
    Configure.config.clear();
  }

  /**
   * Resets the configure to the defaults.
   * If you do not want to keep the defaults, use "Configure.clear()" instead.
   *
   * @example Basic Usage
   * ```ts
   * import { Configure } from "https://deno.land/x/chomp/core/configure.ts";
   *
   * await Configure.load();
   * Configure.reset();
   * ```
   */
  public static reset(): void {
    Configure.config = defaults;
  }
}
