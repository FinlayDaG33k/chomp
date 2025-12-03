import { RegistryItem } from "../../types/webserver.ts";

/**
 * @deprecated Use {@linkcode ../../utility/Registry} instead
 */
export class Registry {
  private static _items: RegistryItem = <RegistryItem> {};

  /**
   * Add an item to the registry
   *
   * @param name
   * @param module
   */
  public static add(name: string, module: any): void {
    Registry._items[name] = module;
  }

  /**
   * Get an item from the registry
   *
   * @param name
   */
  public static get(name: string): any | null {
    return Registry._items[name] ?? null;
  }

  /**
   * Check whether the registry has an item with name
   *
   * @param name
   */
  public static has(name: string): boolean {
    return name in Registry._items;
  }
}
