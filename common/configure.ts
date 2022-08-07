import { Logger } from "../logging/logger.ts";

interface ConfigureItem {
  key: string;
  value: any;
}

export class Configure {
  private static config: ConfigureItem[] = [
    { key: 'error_log', value: `${Deno.cwd()}/logs/error.log` }
  ];
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
    } catch(e) {
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
   * @returns ConfigureItem|null
   */
  public static get(key: string, defaultValue: any = null): any {
    const result = Configure.config.find((item: ConfigureItem) => item.key === key);
    if(typeof result === 'undefined') return defaultValue;
    return result.value;
  }

  /**
   * Set a configure item
   *
   * @param key
   * @param value
   * @returns void
   */
  public static set(key: string, value: any): void {
    // Check if the key already exists
    // Add it if not
    const result = Configure.config.find((item: ConfigureItem) => item.key === key);
    if(typeof result === 'undefined') {
      Configure.config.push({ key: key, value: value });
      return;
    }

    // Update our value
    result.value = value;
  }

  /**
   * Return whether a key exists
   *
   * @param key
   * @returns boolean
   */
  public static check(key: string): boolean {
    const result = Configure.config.find((item: ConfigureItem) => item.key === key);
    return typeof result !== 'undefined';
  }

  public static consume(key: string, defaultValue: any = null): any {
    // Find the item in the Configure
    const index = Configure.config.findIndex((item: ConfigureItem) => item.key === key);
    if(index === -1) return defaultValue;

    // Create a WeakReference to the item
    const ref = new WeakRef(Configure.config[index]);

    // Delete the original item
    delete Configure.config[index];

    // Return WeakReference
    return ref;
  }

  /**
   * Delete a ConfigureItem from the Configure
   *
   * @param key
   * @returns void
   */
  public static delete(key: string): void {
    // Find the item in the Configure
    const index = Configure.config.findIndex((item: ConfigureItem) => item.key === key);
    if(index === -1) return;

    // Delete the original item
    delete Configure.config[index];
  }

  /**
   * Dump all contents of the Configure
   *
   * @returns ConfigureItem[]
   */
  public static dump(): ConfigureItem[] {
    return Configure.config;
  }

  /**
   * Clear all items in the configure (including defaults)
   *
   * @returns void
   */
  public static clear(): void {
    Configure.config = [];
  }
}

// Load our configure when this file is loaded
await Configure.load();
