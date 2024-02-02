import { Logger } from "../logging/logger.ts";

// deno-lint-ignore no-explicit-any -- Arbitrary data may be used
const defaults = new Map<string, any>([
  ['debug', false],
  ['error_log', `${Deno.cwd()}/logs/error.log`],
]);

export class Configure {
  // deno-lint-ignore no-explicit-any -- Arbitrary data may be used
  private static config: Map<string, any> = defaults;
  private static hasLoaded = false;

  /**
   * Load our configure date from file
   *
   * @param force Set to true to force re-loading the configure
   * @returns void
   */
  public static async load(force = false): Promise<void> {
    // Make sure we don't have loaded already
    if(Configure.hasLoaded === true && force === false) return;
    Logger.info(`Loading data into Configure...`);

    // Make sure our file exists
    try {
      await Deno.stat(`${Deno.cwd()}/config.json`);
    } catch(_e) {
      Logger.warning(`Could not find file "config.json" at "${Deno.cwd()}". Configure will be empty!`);
      Configure.hasLoaded = true;
      return;
    }

    // Read our JSON
    try {
      const json = await Deno.readTextFile(`${Deno.cwd()}/config.json`);
      const data = JSON.parse(json);
      for(const entry of Object.keys(data)) {
        Configure.set(entry, data[entry]);
      }
    } catch(e) {
      Logger.error(`Could not load JSON: "${e.message}"`, e.stack);
      return;
    }

    // Mark configure as loaded
    Logger.info(`Finished loading Configure!`);
    Configure.hasLoaded = true;
  }

  /**
   * Obtain the value of a key in the configure
   *
   * @param key Key to look for
   * @param defaultValue Default value to return when no result was found
   * @returns any
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public static get(key: string, defaultValue: any = null): any {
    // Check if the key exists.
    // If not: return the default value
    // Else: return the value in the Configure
    if(!Configure.config.has(key)) return defaultValue;
    return Configure.config.get(key);
  }

  /**
   * Set a configure item
   *
   * @param key
   * @param value
   * @returns void
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public static set(key: string, value: any): void {
    Configure.config.set(key, value);
  }

  /**
   * Return whether a key exists
   *
   * @param key
   * @returns boolean
   */
  public static check(key: string): boolean {
    return Configure.config.has(key);
  }

  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public static consume(key: string, defaultValue: any = null): any {
    // Check if the key exists, if not, return the default value
    if(!Configure.config.has(key)) return defaultValue;

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
   * @param key
   * @returns void
   */
  public static delete(key: string): void {
    Configure.config.delete(key);
  }

  /**
   * Dump all contents of the Configure
   *
   * @returns ConfigureItem[]
   */
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be used
  public static dump(): Map<string, any> {
    return Configure.config;
  }

  /**
   * Clear all items in the configure (including defaults).
   * If you want to keep the defaults, use "Configure.reset()" instead.
   *
   * @returns void
   */
  public static clear(): void {
    Configure.config.clear();
  }

  /**
   * Resets the configure to the defaults.
   * If you do not want to keep the defaults, use "Configure.clear()" instead.
   */
  public static reset(): void {
    Configure.config = defaults;
  }
}
