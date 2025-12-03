import {valueOrDefault} from "./value-or-default.ts";

export class Registry {
  private static readonly _items: Map<string, any> = new Map<string, any>();

  /**
   * Add an item to the registry
   *
   * @example Basic usage
   * ```ts
   * const module = await import(`file://path/to/my/file.ts`);
   * Registry.add('my-module', module);
   * ```
   *
   * @param name
   * @param module
   */
  public static add(name: string, module: any): void {
    Registry._items.set(name, module);
  }

  /**
   * Get an item from the registry
   *
   * @example Basic usage
   * ```ts
   * const module = Registry.add('my-module');
   * ```
   *
   * @param name
   */
  public static get(name: string): any | null {
    return valueOrDefault<any|null>(Registry._items.get(name), null);
  }

  /**
   * Check whether the registry has an item with name
   *
   * @example Basic usage
   * ```ts
   * const hasModule = Registry.has('my-module');
   * ```
   *
   * @param name
   */
  public static has(name: string): boolean {
    return Registry._items.has(name);
  }
}
