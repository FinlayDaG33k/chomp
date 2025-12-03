import { Registry as newRegistry } from "../../utility/registry.ts";

/**
 * @deprecated Use {@linkcode ../../utility/Registry} instead.
 * This class only serves as a legacy proxy to it.
 */
export class Registry {
  /**
   * Add an item to the registry
   *
   * @param name
   * @param module
   */
  public static add(name: string, module: any): void {
    newRegistry.add(name, module);
  }

  /**
   * Get an item from the registry
   *
   * @param name
   */
  public static get(name: string): any | null {
    return newRegistry.get(name);
  }

  /**
   * Check whether the registry has an item with name
   *
   * @param name
   */
  public static has(name: string): boolean {
    return newRegistry.has(name);
  }
}
