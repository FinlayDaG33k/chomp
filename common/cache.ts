import { T as TimeString } from "../util/time-string.ts";

interface CacheItem {
  [key: string]: {
    data: unknown;
    expires: Date;
  }
}

export class Cache {
  private static _items: CacheItem = <CacheItem>{};

  /**
   * Add an item to the cache.
   * 
   * @param key
   * @param value
   * @param expiry
   */
  public static set(key: string, value: unknown, expiry = '+1 minute'): void {
    Cache._items[key] = {
      data: value,
      expires: new Date(new Date().getTime() + TimeString`${expiry}`),
    };
  }

  /**
   * Get an item from the cache
   * 
   * @param key
   */
  public static get(key: string): unknown|null {
    // Return null if the item doesn't exist
    if(!Cache.exists(key)) return null;
    
    // Return null if the item expired
    if(Cache.expired(key)) return null;
    
    // Return the item's data
    return Cache._items[key].data;
  }

  /**
   * Check whether an item exists in the cache
   * 
   * @param key
   */
  public static exists(key: string): boolean {
    return key in Cache._items;
  }
  
  /**
   * Check whether an item has expired
   * 
   * @param key
   */
  public static expired(key: string): boolean {
    // If the item doesn't exist, return true
    if(!Cache.exists(key)) return true;
    
    // Check if the expiry date is before our current date
    return Cache._items[key].expires < new Date();
  }

  /**
   * Remove an item from the cache
   * 
   * @param key
   */
  public static remove(key: string): void {
    // Return if the item doesn't exist
    if(!Cache.exists(key)) return;
    
    // Delete our item
    delete Cache._items[key];
  }
}
