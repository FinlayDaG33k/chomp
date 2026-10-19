export type CacheItem = {
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be added to cache
  data: any;
  expires: number | null;
  optimistic?: number;
}

export type CacheMetrics = {
  reads: {
    hit: number;
    miss: number;
    optimistic: number;
  };
  writes: number;
  swept: number;
}

