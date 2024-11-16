import { TimeString } from "../utility/time-string.ts";
import { Logger } from "./logger.ts";
import { Cron } from "../utility/cron.ts";

interface CacheItem {
  data: unknown;
  expires: Date | null;
}

interface CacheMetrics {
  hit: number;
  miss: number;
}

export class Cache {
  private static _items: Map<string, CacheItem> = new Map<string, CacheItem>();
  private static _metrics: CacheMetrics = { hit: 0, miss: 0 };

  /**
   * Get the metrics for the cache
   *
   * @example Basic usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   * const metrics = Cache.metrics();
   * const hits = Cache.metrics("hit");
   * const misses = Cache.metrics("miss");
   * const rate = Cache.metrics("rate");
   * ```
   *
   * @param key
   */
  public static metrics(key: keyof CacheMetrics|"rate"|"total"|null = null): number|CacheMetrics {
    switch(key) {
      case "hit":
        return Cache._metrics.hit;
      case "miss":
        return Cache._metrics.miss;
      case "total":
        return Cache._metrics.hit + Cache._metrics.miss;
      case "rate":
        const percentile = Cache._metrics.hit / Cache.metrics("total");
        return Math.round(percentile * 100) / 100;
      default:
        return Cache._metrics;
    }
  }

  /**
   * Add an item to the cache.
   *
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * Cache.set('I expire in 1 minute', 'foo');
   * Cache.set('I expire in 10 minutes', 'bar', '+10 minutes');
   * Cache.set('I never expire', 'baz', null);
   * ```
   *
   * **NOTE**: Expiry times use {@linkcode TimeString} formats.
   *
   * @param key
   * @param value
   * @param expiry Can be set to null for never expiring items
   */
  public static set(key: string, value: unknown, expiry: string | null = "+1 minute"): void {
    let expiresAt = null;
    if (expiry) expiresAt = new Date(new Date().getTime() + TimeString`${expiry}`);

    Cache._items.set(key, {
      data: value,
      expires: expiresAt,
    });
  }

  /**
   * Get an item from the cache
   *
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * Cache.get('cache item name');
   * ```
   *
   * @example Getting expired items
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * const item = Cache.get('cache item name', true);
   * ```
   *
   * @param key
   * @param optimistic Whether to serve expired items from the cache
   */
  public static get(key: string, optimistic = false): unknown | null {
    // Return null if the item doesn't exist
    if (!Cache.exists(key)) {
      Cache._metrics.miss++;
      return null;
    }

    // Return null if the item expired
    if (Cache.expired(key) && !optimistic) {
      Cache._metrics.miss++;
      return null;
    }

    // Return the item's data
    Cache._metrics.hit++;
    return Cache._items.get(key)?.data;
  }

  /**
   * Check whether an item exists in the cache.
   * This does *not* check whether the item has expired or not.
   *
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * const doesExist = Cache.exists('cache item name');
   * ```
   *
   * @param key
   */
  public static exists(key: string): boolean {
    return Cache._items.has(key);
  }

  /**
   * Check whether an item has expired
   *
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * const hasExpired = Cache.expired('cache item name');
   * ```
   *
   * @param key
   */
  public static expired(key: string): boolean {
    // If the item doesn't exist, return true
    if (!Cache.exists(key)) return true;

    // Check if the expiry date is before our current date
    if (!Cache._items.get(key)?.expires) return false;
    return Cache._items.get(key)?.expires! < new Date();
  }

  /**
   * Consume an item from the cache.
   * Differs from "Cache.get()" in that it removes the item afterwards.
   *
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * const item = Cache.consume('cache item name');
   * ```
   *
   * @param key
   * @param optimistic Whether to serve expired items from the cache
   */
  public static consume(key: string, optimistic = false): unknown | null {
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
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * Cache.remove('cache item name');
   * ```
   *
   * @param key
   */
  public static remove(key: string): void {
    Cache._items.delete(key);
  }

  /**
   * Read-through cache.
   *
   * Will check if the cache item can be obtained and if not, will execute the callable function.
   * The result will then be stored in the cache.
   *
   * **NOTE:** This feature is currently experimental.
   *
   * TODO: Test whether it actually works as intended
   *
   * @example Basic Usage
   * ```ts
   * const res = Cache.remember('cache item name, "+1 minute", async function { return true });
   * ```
   *
   * @param key
   * @param expiry
   * @param callable
   */
  public static async remember(key: string, expiry: string | null = "+1 minute", callable: Promise): Promise<any> {
    // Check if cache item exists and hasn't expired
    if(!Cache.expired(key)) return Cache.get(key);

    // Cache does not exist, run callable
    const res = await callable();

    // Add result to cache
    Cache.set(key, res, expiry);

    // Return result
    return res;
  }

  /**
   * Dumps the raw cache contents.
   * Should only be used for debugging purposes.
   *
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * console.log(Cache.dump());
   * ```
   */
  public static dump(): Map<string, CacheItem> {
    return Cache._items;
  }

  /**
   * Scan the cache and clean up expired items while keeping optimistic caching in tact.
   * There shouldn't be a need to manually run this in most cases.
   *
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * Cache.sweep();
   * ```
   */
  public static sweep(): void {
    // Set the start time of this sweep
    // Set an optimistic boundary
    // TODO: Allow configuring of optimistic boundary
    const now = new Date();
    const start = new Date(now.getTime() + TimeString`-1 hour -1 second`);
    const boundary = new Date(now.getTime() + TimeString`-1 hour -1 minute`);

    // Loop over each item in the cache
    for (const [key, value] of Cache._items) {
      // Keep items that do not expire
      if (!value.expires) {
        Logger.debug(`Keeping cache item "${key}": Does not expire`);
        continue;
      }

      // Keep items that have not yet expired
      if (value.expires >= start) {
        Logger.debug(`Keeping cache item "${key}": Has not expired`);
        continue;
      }

      // Keep items that may be served optimistically
      if (value.expires >= boundary) {
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
// @ts-ignore It's a function not a type
Cron("1 0 * * * *", () => Cache.sweep());
