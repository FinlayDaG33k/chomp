import { Logger } from "../logging/logger.ts";

interface ConfigureItem {
  key: string;
  value: any;
}

export class Configure {
  private static config: ConfigureItem[] = [];
  private static hasLoaded = false;

  /**
   * Load our configure date from file
   *
   * @returns void
   */
  public static async load(): Promise<void> {
    // Make sure we don't have loaded already
    if(Configure.hasLoaded === true) return;
    Logger.info(`Loading data into Configure!`)

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
      Configure.config = JSON.parse(json);
    } catch(e) {
      Logger.error(`Could not load JSON: "${e.message}"`);
      Logger.trace(e.stack);
      return;
    }

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
  public static get(key: string, defaultValue: any = null): ConfigureItem|null {
    const result = Configure.config.find((item: ConfigureItem) => item.key === key);
    if(typeof result === 'undefined') return defaultValue;
    return result;
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
}

// Load our configure when this file is loaded
await Configure.load();
