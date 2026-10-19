import { CacheItem, CacheMetrics } from "../types/cache.ts";
import { TimeString } from "../utility/time-string.ts";
import { Logger } from "./logger.ts";
import { Configure } from "./configure.ts";
import {Contract} from "../utility/contract.ts";

/**
 * Default optimistic boundaries
 */
const OPTIMISTIC_DELAY = '+1 hour';

/**
 * Default batch size for sweeper
 */
const SWEEP_BATCH_SIZE = 100;

/**
 * Very crude but effective in-memory caching
 *
 * Running {@linkcode Cache.sweep} is up to the app itself.
 */
export class Cache {
  private static _items: Map<string, CacheItem> = new Map<string, CacheItem>();
  private static _metrics: CacheMetrics = {
    reads: {
      hit: 0,
      miss: 0,
      optimistic: 0,
    },
    writes: 0,
    swept: 0,
  };

  /**
   * Get the metrics for the cache
   *
   * **NOTE:** Rate will be returned 0-1
   *
   * @example Basic usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   * const metrics = Cache.metrics();
   * const hits = Cache.metrics("hit");
   * const misses = Cache.metrics("miss");
   * const rate = Cache.metrics("rate");
   * const writes = Cache.metrics("writes");
   * const swept = Cache.metrics("swept");
   * ```
   *
   * @param key
   */
  public static metrics<T>(key: keyof CacheMetrics["reads"]|"rate"|"total"|"writes"|"swept"|"size"|null = null): T|number|CacheMetrics {
    switch(key) {
      case "hit":
        return Cache._metrics.reads.hit;
      case "optimistic":
        return Cache._metrics.reads.optimistic;
      case "miss":
        return Cache._metrics.reads.miss;
      case "total":
        return Cache._metrics.reads.hit + Cache._metrics.reads.miss;
      case "rate": {
        const total: number = Cache.metrics("total") as number;
        const percentile = +(Cache._metrics.reads.hit / total).toFixed(4);
        if(percentile > 0) return percentile;
        return 0;
      }
      case "writes":
        return Cache._metrics.writes;
      case "swept":
        return Cache._metrics.swept;
      case "size":
        return Cache._items.size;
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
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be added to cache
  public static set(key: string, value: any, expiry: string | null = "+1 minute"): void {
    let expiresAt = null;
    let optimisticExpiry = undefined;

    // Check if an expiry is specified
    // Calculate the expiry values if so
    if (expiry !== null) {
      expiresAt = Date.now() + TimeString`${expiry}`
      optimisticExpiry = expiresAt + TimeString`${Configure.get('chomp_optimistic_delay', OPTIMISTIC_DELAY)}`;
    }

    // Set item in the Cache
    Cache._items.set(key, {
      data: value,
      expires: expiresAt,
      optimistic: optimisticExpiry
    });

    // Increase write metric
    Cache._metrics.writes++;
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
   * @param allowOptimism Whether to allow optimistically serve expired items from the cache
   */
  public static get<T>(key: string, allowOptimism = false): T | null {
    // Check if item exists
    const item = Cache._items.get(key);

    // Return null if no item was found
    if (item === undefined) {
      Cache._metrics.reads.miss++;
      return null;
    }

    // Return item if we didn't expire yet
    const hasExpired = Cache._expiry(item);
    if(!hasExpired) {
      Cache._metrics.reads.hit++;
      return item.data;
    }

    // Return null if we're not allowed to be optimistic
    if (!allowOptimism && Cache._optimism(item)) {
      Cache._metrics.reads.miss++;
      return null;
    }

    // Increase hit counters
    Cache._metrics.reads.hit++;
    Cache._metrics.reads.optimistic++;

    // Return Cache data
    return item.data;
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
   * Check whether an item has expired.
   * This function ignores optimistic caching.
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
    // Get the item from cache
    const item = Cache._items.get(key);

    // Make sure the item exists
    if(item === undefined) return true;

    // Check whether the item has expired
    return Cache._expiry(item);
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
   * @param allowOptimism Whether to allow optimistically serve expired items from the cache
   */
  public static consume<T>(key: string, allowOptimism = false): T | null {
    // Copy item from cache
    const data = <T|null>Cache.get(key, allowOptimism);

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
  public static async remember<T>(key: string, expiry: string | null = "+1 minute", callable: Promise<T>|(() => Promise<T>)): Promise<T> {
    // Get item from cache
    const item = Cache.get<T>(key);

    // Check if cache item exists
    // If not, execute callable and remember it
    if(item === null) {
      // TODO: Fix "no call signatures" in lint
      // @ts-ignore See TODO
      const res = await callable();

      // Add result to cache
      Cache.set(key, res, expiry);

      // Return result
      return res;
    }

    // Return item
    return item;
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
   *
   * @example Basic Usage
   * ```ts
   * import { Cache } from "https://deno.land/x/chomp/core/cache.ts";
   *
   * Cache.sweep();
   * ```
   */
  public static async sweep(): Promise<void> {
    Logger.debug('Starting cache sweep...');

    // Prepare some variables
    const now = Date.now();
    const iterator = Cache._items.entries();

    // Process a new patch
    // TODO: Move this out of this method for readability
    const batchProcess = () : Promise<boolean> => {
      return new Promise((resolve) => {
        // Yield execution back to the event loop
        setTimeout(() => {
          // Keep count of
          let count = 0;

          while (count < SWEEP_BATCH_SIZE) {
            // Get next item
            const next = iterator.next();

            // Check if next item was found
            // If not, we're done sweeping
            if (next.done) return resolve(true);

            // Get value for the cache item
            const [key, item] = next.value;
            count++;

            // Check if entry has expired
            // If not, move along
            if(!Cache._expiry(item, now)) {
              Logger.trace(`Keeping cache item "${key}": Has not expired`);
              continue;
            }

            // Check if item can still be served optimistically
            // If so, move along
            if(Cache._optimism(item, now)) {
              Logger.trace(`Keeping cache item "${key}": Keep for optimistic caching`);
              continue;
            }

            // Clean up items that have expired
            Logger.trace(`Removing expired cache item "${key}"`);
            Cache._items.delete(key);
            Cache._metrics.swept++;
          }

          // Batch completed but we still have items to check
          resolve(false);
        }, 0);
      });
    }

    // Check if we have more work to do
    // If so, process next batch
    let isDone = false;
    while(!isDone) {
      isDone = await batchProcess();
    }
    Logger.debug(`Finished cache sweep!`);
  }

  /**
   * Logic to check whether a cache item has expired.
   *
   * @param item
   * @param now Timestamp against which to check
   */
  private static _expiry(item: CacheItem, now: number = Date.now()) {
    // Make sure the item has an expiry
    if(item.expires === null) return false;

    // Check whether the item has expired
    return item.expires < now;
  }

  /**
   * Logic to check whether a cache item can be served optimistically
   *
   * @param item
   * @param now Timestamp against which to check
   */
  private static _optimism(item: CacheItem, now: number = Date.now()) {
    // Make sure the item has optimistic expiry
    if(item.optimistic === undefined) return false;

    // Check whether the item has expired
    return item.optimistic < now;
  }
}
