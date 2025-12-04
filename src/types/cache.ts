export type CacheItem = {
  // deno-lint-ignore no-explicit-any -- Any arbitrary data may be added to cache
  data: any;
  expires: Date | null;
  optimistic?: Date;
}

export type CacheMetrics = {
  reads: {
    hit: number;
    miss: number;
  };
  writes: number;
  swept: number;
}

