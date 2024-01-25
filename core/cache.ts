import { T as TimeString } from "../utility/time-string.ts";
import { Logger } from "../logging/logger.ts";
import { Cron } from "../utility/cron.ts";

interface CacheItem {
  data: unknown;
  expires: Date|null;
}

export class Cache {
  private static _items: Map<string, CacheItem> = new Map<string, CacheItem>();

  /**
   * Add an item to the cache.
   *
   * @param key
   * @param value
   * @param expiry Can be set to null for never expiring items
   */
  public static set(key: string, value: unknown, expiry: string|null = '+1 minute'): void {
    let expiresAt = null;
    if(expiry) expiresAt = new Date(new Date().getTime() + TimeString`${expiry}`)
    
    Cache._items.set(key, {
      data: value,
      expires: expiresAt,
    });
  }

  /**
   * Get an item from the cache
   *
   * @param key
   * @param optimistic Whether to serve expired items from the cache
   */
  public static get(key: string, optimistic = false): unknown|null {
    // Return null if the item doesn't exist
    if(!Cache.exists(key)) return null;

    // Return null if the item expired
    if(Cache.expired(key) && !optimistic) return null;

    // Return the item's data
    return Cache._items.get(key)?.data;
  }

  /**
   * Check whether an item exists in the cache.
   * This does *not* check whether the item has expired or not.
   *
   * @param key
   */
  public static exists(key: string): boolean {
    return Cache._items.has(key);
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
    if(!Cache._items.get(key)?.expires) return false;
    return Cache._items.get(key)?.expires! < new Date();
  }

  /**
   * Consume an item from the cache.
   * Differs from "Cache.get()" in that it removes the item afterwards.
   * 
   * @param key
   * @param optimistic Whether to serve expired items from the cache
   */
  public static consume(key: string, optimistic = false): unknown|null {
    // Copy item from cache
    const data = Cache.get(key, optimistic);
    
    // Remove item from cache
    Cache.remove(key);
    
    // Return the item
    return data;
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
    Cache._items.delete(key);
  }

  /**
   * Dumps the raw cache contents.
   * Should only be used for debugging purposes.
   */
  public static dump(): Map<string, CacheItem> {
    return Cache._items;
  }

  /**
   * Scan the cache and clean up expired items while keeping optimistic caching in tact.
   */
  public static sweep(): void {
    // Set the start time of this sweep
    // Set an optimistic boundary
    // TODO: Allow configuring of optimistic boundary
    const now = new Date();
    const start = new Date(now.getTime() + TimeString`-1 hour -1 second`);
    const boundary = new Date(now.getTime() + TimeString`-1 hour -1 minute`);
    
    // Loop over each item in the cache
    for(const [key, value] of Cache._items) {
      // Keep items that do not expire
      if(!value.expires) {
        Logger.debug(`Keeping cache item "${key}": Does not expire`);
        continue;
      }
      
      // Keep items that have not yet expired
      if(value.expires >= start) {
        Logger.debug(`Keeping cache item "${key}": Has not expired`);
        continue;
      }

      // Keep items that may be served optimistically
      if(value.expires >= boundary) {
        Logger.debug(`Keeping cache item "${key}": Keep for optimistic caching`);
        continue;
      }

      // Clean up items that have expired
      Logger.debug(`Removing expired cache item "${key}"`);
      Cache._items.delete(key);
    }
  }
}

// Sweep cache every hour
Cron('1 0 * * * *', () => Cache.sweep());
